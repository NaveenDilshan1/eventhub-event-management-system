import os
import sys
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime
import requests as http_requests

# Load .env from parent (backend) directory
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '.env')
load_dotenv(dotenv_path)

app = Flask(__name__)
CORS(app)

# ─── MongoDB Setup ────────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    print("❌ ERROR: MONGO_URI not found in .env"); sys.exit(1)

mongo_client = MongoClient(MONGO_URI)
db = mongo_client['event_management']
ai_queries = db['aiqueries']
print("✅ MongoDB connected to event_management")

# ─── Gemini Setup ─────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("❌ ERROR: GEMINI_API_KEY not found in .env"); sys.exit(1)

GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
print("✅ Gemini API Key loaded (model: gemini-2.5-flash)")

# ─── Helpers ──────────────────────────────────────────────────────
def get_system_context(role):
    try:
        # 1. Fetch Summary Stats
        total_events = db['events'].count_documents({})
        total_users  = db['masterusers'].count_documents({})
        
        # 2. Fetch Detailed Event List for Reasoning
        events_cursor = db['events'].find({}, {
            'title': 1, 'soldTickets': 1, 'totalTickets': 1, 
            'price': 1, 'category': 1, 'status': 1, 'location': 1
        })
        
        event_details = []
        tickets_sold = 0
        total_revenue = 0
        for e in events_cursor:
            sold = e.get('soldTickets', 0)
            total = e.get('totalTickets', 0)
            price = e.get('price', 0)
            tickets_sold += sold
            total_revenue += (sold * price)
            
            event_details.append(
                f"- {e.get('title')} ({e.get('category')}): Sold {sold}/{total} tickets at ${price} each."
                f" Status: {e.get('status')}. Location: {e.get('location')}."
            )

        # 3. Fetch User Role Breakdown
        role_breakdown = {}
        users_cursor = db['masterusers'].find({}, {'role': 1})
        for u in users_cursor:
            r = u.get('role', 'user')
            role_breakdown[r] = role_breakdown.get(r, 0) + 1

        context = (
            f"SYSTEM ROLE: You are the Official Advanced AI for Event Hub Pro.\n"
            f"CURRENT USER ROLE: {role}\n\n"
            f"--- SYSTEM DATA SNAPSHOT ---\n"
            f"OVERALL STATS:\n"
            f"- Total Events: {total_events}\n"
            f"- Total Registered Users: {total_users}\n"
            f"- Total Tickets Sold (System Wide): {tickets_sold}\n"
            f"- Total Revenue (System Wide): ${total_revenue:,.2f}\n\n"
            f"USER DISTRIBUTION BY ROLE:\n"
            + "\n".join([f"- {r.capitalize()}s: {count}" for r, count in role_breakdown.items()]) + "\n\n"
            f"DETAILED EVENT LIST:\n"
            + "\n".join(event_details) + "\n\n"
            f"--- YOUR INSTRUCTIONS ---\n"
            f"1. You have FULL ACCESS to the data above. If a user asks 'Which event is performing best?', look at the 'Sold' numbers.\n"
            f"2. Be extremely precise. Use specific numbers from the data.\n"
            f"3. If asked questions outside of business (like jokes or general info), you can answer but briefly bring the conversation back to events if possible.\n"
            f"4. You are an expert analyst. Provide insights, not just numbers.\n"
            f"5. Answer in the language the user uses (Sinhala, English, Tamil, etc.).\n"
        )
        return context
    except Exception as e:
        print(f"⚠️ Stats fetch error: {e}")
        return "You are an Advanced AI for Event Hub Pro. Data is temporarily unavailable, but assist to your best ability."


def call_gemini(system_ctx, history, prompt):
    """Call Gemini REST API with retry for rate limits."""
    import time

    contents = [
        {"role": "user",  "parts": [{"text": system_ctx}]},
        {"role": "model", "parts": [{"text": "Understood! I'm the Event Hub Pro AI. How can I help?"}]},
    ]
    for msg in history[-10:]:
        g_role = "model" if msg.get('role') == "assistant" else "user"
        contents.append({"role": g_role, "parts": [{"text": msg.get('content', '')}]})

    contents.append({"role": "user", "parts": [{"text": prompt}]})

    payload = {"contents": contents}

    # Retry up to 3 times with backoff for rate limits
    for attempt in range(3):
        resp = http_requests.post(GEMINI_URL, json=payload, timeout=60)
        if resp.status_code == 429:
            wait_time = (attempt + 1) * 5
            print(f"⚠️  Rate limited (429). Retrying in {wait_time}s... (attempt {attempt+1}/3)")
            time.sleep(wait_time)
            continue
        resp.raise_for_status()
        data = resp.json()
        return data['candidates'][0]['content']['parts'][0]['text']

    return "I'm currently experiencing high traffic. Please try again in a moment."


# ─── Routes ───────────────────────────────────────────────────────
@app.route('/api/python/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "Event Hub Pro Python AI"})


@app.route('/api/python/ask', methods=['POST'])
def ask_ai():
    try:
        data    = request.get_json() or {}
        prompt  = data.get('prompt', '').strip()
        role    = data.get('role', 'admin')
        history = data.get('history', [])

        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400

        system_ctx    = get_system_context(role)
        response_text = call_gemini(system_ctx, history, prompt)

        ai_queries.insert_one({
            "prompt":    prompt,
            "response":  response_text,
            "role":      role,
            "createdAt": datetime.utcnow(),
        })

        return jsonify({"response": response_text})

    except Exception as e:
        print(f"❌ /ask error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/python/history', methods=['GET'])
def get_history():
    try:
        role    = request.args.get('role', 'admin')
        records = list(ai_queries.find({"role": role}).sort("createdAt", -1).limit(20))
        for r in records:
            r['_id'] = str(r['_id'])
        return jsonify(records)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Start ────────────────────────────────────────────────────────
if __name__ == '__main__':
    print("🚀 Python AI Service starting on port 5001 ...")
    app.run(host='0.0.0.0', port=5001, debug=False)

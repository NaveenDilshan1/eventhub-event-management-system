import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Bot,
  Send,
  Sparkles,
  Ticket,
  BarChart3,
  Users,
  DollarSign,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import axios from "axios";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

const quickPrompts = [
  { label: "Show ticket sales", icon: Ticket, prompt: "ticket-sales" },
  { label: "Which event is best?", icon: BarChart3, prompt: "top-event" },
  { label: "How many users?", icon: Users, prompt: "active-users" },
  { label: "Revenue report", icon: DollarSign, prompt: "revenue-report" },
];

const AIChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch history on load
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/ai/history?role=admin");
        if (res.data && res.data.length > 0) {
          const history = res.data.reverse().map((q: any) => ([
            { id: q._id + "-q", role: "user", content: q.prompt, timestamp: new Date(q.createdAt) },
            { id: q._id + "-a", role: "assistant", content: q.response, timestamp: new Date(q.createdAt) }
          ])).flat();
          setMessages(history);
        } else {
          setMessages([
            {
              id: "welcome",
              role: "assistant",
              content: "👋 Hello Admin! I'm your Event Hub Pro AI assistant. Ask me anything about system stats, revenue, or event management.",
              timestamp: new Date(),
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
        setMessages([
          {
            id: "welcome",
            role: "assistant",
            content: "👋 Hello! I'm your AI assistant. Ask me about events, ticket sales, or reports.",
            timestamp: new Date(),
          },
        ]);
      }
    };
    fetchHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text === "ticket-sales" ? "Give me a summary of ticket sales" :
        text === "top-event" ? "Which is the top performing event?" :
          text === "active-users" ? "How many active users are in the system?" :
            text === "revenue-report" ? "Show me the revenue report" : text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://localhost:5000/api/ai/ask", {
        prompt: userMessage.content,
        role: "admin",
        history: messages.slice(-10) // Send last 10 messages for context
      });

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to get AI response");

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "⚠️ Sorry, I encountered an error. Please make sure the Gemini API key is configured in the backend .env file.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Assistant</h1>
              <p className="text-sm text-muted-foreground">Ask anything about your events and analytics</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessages([messages[0]])}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            New Chat
          </Button>
        </motion.div>

        {/* Quick Prompts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt.label}
                variant="outline"
                size="sm"
                onClick={() => handleSend(prompt.prompt)}
                className="gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <prompt.icon className="h-4 w-4" />
                {prompt.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "flex-row-reverse" : ""
                  )}
                >
                  <Avatar className={cn(
                    "h-8 w-8",
                    message.role === "assistant" ? "bg-primary" : "bg-secondary"
                  )}>
                    <AvatarFallback>
                      {message.role === "assistant" ? <Sparkles className="h-4 w-4" /> : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary/50"
                  )}>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {message.content.split("\n").map((line, i) => (
                        <p key={i} className="mb-1 last:mb-0">{line}</p>
                      ))}
                    </div>
                    {message.role === "assistant" && (
                      <div className="flex gap-2 mt-3 pt-2 border-t border-border/50">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(message.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback>
                    <Sparkles className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-secondary/50 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t border-border bg-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-3"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your events, sales, or analytics..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button type="submit" disabled={!input.trim() || isTyping} className="gap-2">
                <Send className="h-4 w-4" />
                Send
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AIChatPage;

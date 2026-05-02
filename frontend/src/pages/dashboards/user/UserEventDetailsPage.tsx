import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle2, CreditCard, Search, Ticket as TicketIcon, Download } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toPng } from "html-to-image";

interface Event {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  category?: string;
  totalTickets?: number;
  soldTickets?: number;
  imageUrl?: string;
  price?: number;
}

type BookingStep = "details" | "qr" | "verify" | "bank" | "ticket";

const UserEventDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ticketRef = useRef<HTMLDivElement>(null);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<BookingStep>("details");

  // Booking session state
  const [generatedTicketId, setGeneratedTicketId] = useState("");
  const [enteredId, setEnteredId] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    holderName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    email: "",
    phone: "",
    method: "Visa"
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const eventRes = await axios.get(`http://localhost:5000/api/events/public/${id}`);
        setEvent(eventRes.data);

        // Fetch User Profile to pre-fill
        const token = localStorage.getItem("token");
        if (token) {
          const profileRes = await axios.get(`http://localhost:5000/api/auth/profile`, { // Assuming there's a profile route or similar
            headers: { Authorization: `Bearer ${token}` }
          }).catch(() => null);

          if (profileRes?.data) {
            setBankDetails(prev => ({
              ...prev,
              holderName: `${profileRes.data.firstName} ${profileRes.data.lastName}`,
              email: profileRes.data.email,
              phone: profileRes.data.phone || ""
            }));
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load event");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const generateUniqueId = () => {
    const id = "TKT-" + Math.random().toString(36).substr(2, 9).toUpperCase();
    setGeneratedTicketId(id);
    setStep("qr");
  };

  const verifyId = () => {
    if (enteredId.trim().toUpperCase() === generatedTicketId) {
      setIsVerified(true);
      toast.success("Ticket ID Verified!");
    } else {
      toast.error("Invalid Ticket ID. Please check the QR info.");
    }
  };

  const downloadTicket = async () => {
    if (ticketRef.current === null) return;

    try {
      const dataUrl = await toPng(ticketRef.current, { cacheBust: true, });
      const link = document.createElement('a');
      link.download = `Ticket-${generatedTicketId}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Downloading ticket slip...");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download ticket image");
    }
  };

  const handlePurchase = async () => {
    if (!event) return;
    if (!bankDetails.holderName || !bankDetails.cardNumber) return toast.error("Please fill bank details");

    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("You must be logged in");

      // Save the booking with the unique ID
      await axios.post(
        "http://localhost:5000/api/bookings/book",
        {
          eventId: event._id,
          quantity: 1,
          customTicketId: generatedTicketId,
          buyerName: bankDetails.holderName,
          buyerEmail: bankDetails.email,
          buyerPhone: bankDetails.phone,
          paymentMethod: bankDetails.method
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Purchase successful! 🎉");
      setStep("ticket");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Booking failed");
    }
  };

  if (loading) return <DashboardLayout><div className="text-center py-12">Loading event...</div></DashboardLayout>;
  if (!event) return <DashboardLayout><div className="text-center py-12">Event not found</div></DashboardLayout>;

  const imageUrl = event.imageUrl
    ? (event.imageUrl.startsWith('http') ? event.imageUrl : `http://localhost:5000${event.imageUrl}`)
    : 'https://via.placeholder.com/1200x400';

  const qrData = JSON.stringify({
    event: event.title,
    date: event.date,
    ticketId: generatedTicketId
  });
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 px-4">
          {["Details", "QR Code", "Verify", "Payment", "Ticket"].map((s, i) => (
            <div key={s} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i <= ["details", "qr", "verify", "bank", "ticket"].indexOf(step) ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}>
                {i + 1}
              </div>
              <span className="text-[10px] mt-1">{s}</span>
            </div>
          ))}
        </div>

        {step === "details" && (
          <div className="space-y-6">
            <div className="relative h-64 rounded-xl overflow-hidden shadow-xl">
              <img src={imageUrl} alt={event.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{event.title}</h1>
                  <p className="text-gray-200">{event.category}</p>
                </div>
              </div>
              <Button variant="ghost" className="absolute top-4 left-4 text-white hover:bg-white/20" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
            </div>

            <Card className="border-none shadow-md">
              <CardContent className="p-6 space-y-4">
                <p className="text-muted-foreground">{event.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {new Date(event.date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {event.location}</div>
                  <div className="flex items-center gap-2 font-bold text-lg text-primary col-span-2">Price: ₹{event.price}</div>
                </div>
                <Button size="lg" className="w-full h-12 text-lg font-bold" onClick={generateUniqueId}>Book Now</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "qr" && (
          <Card className="text-center p-8 space-y-6 max-w-md mx-auto shadow-2xl border-primary/20 bg-gradient-to-b from-white to-primary/5">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Your Booking QR Code</h2>
              <p className="text-sm text-muted-foreground">Scan this to see your unique Ticket ID</p>
            </div>
            <div className="p-4 bg-white rounded-2xl shadow-inner mx-auto inline-block border-4 border-primary/10">
              <img src={qrUrl} alt="Booking QR" className="w-48 h-48" />
            </div>

            <Button className="w-full" onClick={() => setStep("verify")}>Next: Verify Ticket ID</Button>
          </Card>
        )}

        {step === "verify" && (
          <Card className="max-w-md mx-auto p-8 space-y-6 shadow-xl border-t-4 border-t-primary">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Verification</h2>
              <p className="text-sm text-muted-foreground">Enter the Ticket ID from your QR code</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Enter User ID / Ticket ID</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10 h-12 uppercase"
                    placeholder="TKT-XXXXXX"
                    value={enteredId}
                    onChange={(e) => setEnteredId(e.target.value)}
                  />
                </div>
              </div>
              <Button className="w-full h-12 gap-2" variant={"secondary"} onClick={verifyId}>
                <Search className="h-4 w-4" /> Verify ID
              </Button>

              {isVerified && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <CheckCircle2 className="h-6 w-6" />
                  <div>
                    <p className="font-bold">ID Verified Successfully!</p>
                    <p className="text-xs">You can now proceed to payment.</p>
                  </div>
                </motion.div>
              )}

              <Button className="w-full h-12" disabled={!isVerified} onClick={() => setStep("bank")}>Continue to Bank Details</Button>
            </div>
          </Card>
        )}

        {step === "bank" && (
          <Card className="max-w-md mx-auto p-8 space-y-6 shadow-xl border-t-4 border-t-blue-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><CreditCard className="text-blue-500" /> Payment Details</h2>
              <p className="text-sm text-muted-foreground">Complete your purchase securely</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Attendee Name / Card Holder</Label>
                <Input placeholder="John Doe" value={bankDetails.holderName} onChange={(e) => setBankDetails({ ...bankDetails, holderName: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="john@example.com" value={bankDetails.email} onChange={(e) => setBankDetails({ ...bankDetails, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+94 7X XXX XXXX" value={bankDetails.phone} onChange={(e) => setBankDetails({ ...bankDetails, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Card Number</Label>
                <div className="flex gap-2">
                  <select
                    className="border rounded-md px-2 bg-background text-sm"
                    value={bankDetails.method}
                    onChange={(e) => setBankDetails({ ...bankDetails, method: e.target.value })}
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">M/C</option>
                    <option value="Amex">Amex</option>
                  </select>
                  <Input className="flex-1" placeholder="XXXX-XXXX-XXXX-XXXX" value={bankDetails.cardNumber} onChange={(e) => setBankDetails({ ...bankDetails, cardNumber: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry</Label>
                  <Input placeholder="MM/YY" />
                </div>
                <div className="space-y-2">
                  <Label>CVV</Label>
                  <Input type="password" placeholder="***" />
                </div>
              </div>
              <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700" onClick={handlePurchase}>Pay & Generate Ticket</Button>
            </div>
          </Card>
        )}

        {step === "ticket" && (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-bold text-foreground">Purchase Confirmed!</h2>
              <p className="text-muted-foreground">Your ticket has been generated and saved to your account.</p>
            </div>

            {/* Visual Digital Ticket */}
            <div ref={ticketRef} className="relative max-w-lg mx-auto overflow-hidden rounded-3xl shadow-2xl flex flex-col md:flex-row bg-white border border-muted">
              {/* Left: Event Info */}
              <div className="flex-1 p-8 space-y-6 bg-white">
                <div className="space-y-1">
                  <Badge variant={"secondary"} className="bg-primary/10 text-primary border-primary/20">{event.category}</Badge>
                  <h3 className="text-2xl font-black text-foreground leading-tight">{event.title}</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(event.date).toDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="truncate">{event.location}</span>
                  </div>

                </div>

                <div className="pt-4 border-t border-dashed">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Pass Holder</p>
                  <p className="font-bold">{bankDetails.holderName || "Verified Guest"}</p>
                </div>
              </div>

              {/* Ticket Divider (Dashed Line) */}
              <div className="w-full md:w-px border-t md:border-t-0 md:border-l border-dashed border-muted-foreground/30 relative py-2 md:py-0 bg-white">
                <div className="absolute -left-2 md:-left-2 -top-2 md:top-1/2 md:-translate-y-1/2 w-4 h-4 bg-background rounded-full border border-muted"></div>
                <div className="absolute -right-2 md:-right-2 -bottom-2 md:bottom-1/2 md:translate-y-1/2 w-4 h-4 bg-background rounded-full border border-muted"></div>
              </div>

              {/* Right: QR & ID Footer */}
              <div className="md:w-1/3 bg-muted/20 p-8 flex flex-col items-center justify-center space-y-4 text-center">
                <img src={qrUrl} alt="Final Ticket QR" className="w-32 h-32 rounded-lg bg-white p-2 shadow-md" />

              </div>
            </div>

            <div className="flex justify-center flex-wrap gap-4">
              <Button variant="outline" onClick={downloadTicket} className="gap-2">
                <Download className="h-4 w-4" /> Download Slip
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard/user/browse-events")}>Browse More Events</Button>
              <Button onClick={() => navigate("/dashboard/user/my-tickets")}>View My Tickets</Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserEventDetailsPage;

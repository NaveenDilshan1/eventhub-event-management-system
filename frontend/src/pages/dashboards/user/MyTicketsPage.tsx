// src/pages/dashboards/user/MyTicketsPage.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Ticket, Calendar, Clock, MapPin, QrCode, User, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import { toPng } from "html-to-image";
import { useRef } from "react";

export const TICKET_IMAGE = "https://images.unsplash.com/photo-1523906630133-f6934a1abf0c?w=400&h=200&fit=crop";

interface TicketType {
  _id: string;
  eventId: string;
  eventName: string;
  eventImage?: string;
  date: string;
  time: string;
  location: string;
  type: string;
  price: string;
  status: "upcoming" | "past";
  customTicketId?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  attendeePhone?: string;
}

const typeColors: Record<string, string> = {
  VIP: "bg-amber-100 text-amber-700",
  Standard: "bg-blue-100 text-blue-700",
  General: "bg-green-100 text-green-700",
};

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const passRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);

  const downloadPass = async () => {
    if (passRef.current === null) return;

    try {
      const dataUrl = await toPng(passRef.current, { cacheBust: true, });
      const link = document.createElement('a');
      link.download = `Pass-${selectedTicket?.customTicketId || 'Ticket'}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Downloading digital pass...");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download pass image");
    }
  };

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("You must be logged in");

        const res = await axios.get(`http://localhost:5000/api/tickets/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setTickets(res.data);
      } catch (err) {
        console.error("Failed to load tickets", err);
        toast.error("Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const upcomingTickets = tickets.filter(t => t.status === "upcoming");
  const pastTickets = tickets.filter(t => t.status === "past");

  const handleShowQr = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setQrModalOpen(true);
  };

  const TicketCard = ({ ticket }: { ticket: TicketType }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-l-primary">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-64 h-40 md:h-auto relative flex-shrink-0">
          <img
            src={ticket.eventImage ? (ticket.eventImage.startsWith('http') ? ticket.eventImage : `http://localhost:5000${ticket.eventImage}`) : TICKET_IMAGE}
            alt={ticket.eventName}
            className="w-full h-full object-cover"
          />
          <Badge className={`absolute top-2 left-2 ${typeColors[ticket.type] || "bg-primary text-white"}`}>{ticket.type}</Badge>
        </div>
        <CardContent className="flex-1 p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-bold text-xl text-foreground leading-tight">{ticket.eventName}</h3>
                <div className="flex flex-col gap-1 mt-2">

                  {ticket.attendeeName && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold uppercase">Holder</span>
                      <p className="text-sm font-semibold text-foreground">{ticket.attendeeName}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground pt-1">
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" />{new Date(ticket.date).toLocaleDateString()}</span>
                {ticket.time && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" />{ticket.time}</span>}
                <span className="flex items-center gap-1.5 w-full"><MapPin className="h-4 w-4 text-primary" />{ticket.location}</span>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between self-stretch gap-4">
              <div className="flex flex-col items-end">
                <p className="text-2xl font-black text-primary">{ticket.price}</p>
                <div className="mt-2 p-1.5 bg-white border border-muted rounded-lg shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(JSON.stringify({
                      id: ticket.customTicketId || ticket._id,
                      event: ticket.eventName,
                      attendee: ticket.attendeeName
                    }))}`}
                    alt="Small QR"
                    className="w-12 h-12"
                  />
                </div>
              </div>
              <Button
                type="button"
                className="gap-2 w-full sm:w-auto"
                onClick={() => handleShowQr(ticket)}
              >
                <QrCode className="h-4 w-4" /> View Full Pass
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );

  if (loading) return <DashboardLayout><div className="flex items-center justify-center p-20"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
          <h1 className="text-4xl font-black text-foreground flex items-center gap-4">
            <Ticket className="h-10 w-10 text-primary" /> My Tickets
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Your collection of upcoming and past event experiences.</p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-8">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="upcoming" className="rounded-lg px-6">Upcoming Events ({upcomingTickets.length})</TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg px-6">Past Memories ({pastTickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingTickets.length === 0 && (
              <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                <Ticket className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold">No tickets yet?</h3>
                <p className="text-muted-foreground mt-2">Start your journey by browsing our exclusive events.</p>
                <Button className="mt-6" variant="outline" onClick={() => (window.location.href = "/dashboard/user/browse-events")}>Browse Events</Button>
              </div>
            )}
            {upcomingTickets.map((ticket, index) => (
              <motion.div key={ticket._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                <TicketCard ticket={ticket} />
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {pastTickets.length === 0 && (
              <div className="text-center py-20 opacity-50">
                <h3 className="text-lg font-medium">Nothing in history</h3>
                <p className="text-muted-foreground">Events you attend will appear here.</p>
              </div>
            )}
            {pastTickets.map((ticket, index) => (
              <motion.div key={ticket._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <TicketCard ticket={ticket} />
              </motion.div>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Code / Digital Pass Modal */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl border-none">
          {selectedTicket && (
            <div className="flex flex-col">
              {/* This part will be exported as image */}
              <div ref={passRef} className="bg-white">
                {/* Header Image */}
                <div className="h-32 bg-primary relative">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                    <Badge className="bg-white text-primary hover:bg-white">{selectedTicket.type}</Badge>
                    <p className="text-white font-black text-xl">Digital Pass</p>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 text-center bg-white">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-foreground">{selectedTicket.eventName}</h2>
                    <div className="flex justify-center gap-4 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(selectedTicket.date).toDateString()}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{selectedTicket.location}</span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="p-4 bg-white border-8 border-muted rounded-3xl shadow-inner inline-block">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({
                          id: selectedTicket.customTicketId || selectedTicket._id,
                          event: selectedTicket.eventName,
                          attendee: selectedTicket.attendeeName
                        }))}`}
                        alt="Digital Ticket QR"
                        className="w-48 h-48"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-2xl">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Pass Holder</p>
                      <p className="font-bold text-lg">{selectedTicket.attendeeName || "Guest User"}</p>
                      {selectedTicket.attendeeEmail && <p className="text-xs text-muted-foreground">{selectedTicket.attendeeEmail}</p>}
                      {selectedTicket.attendeePhone && <p className="text-xs text-muted-foreground">{selectedTicket.attendeePhone}</p>}
                    </div>

                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t flex flex-col gap-3">
                <Button onClick={downloadPass} className="w-full h-12 rounded-2xl text-lg font-bold gap-2">
                  <Download className="h-5 w-5" /> Download Pass (Image)
                </Button>
                <DialogClose asChild>
                  <Button variant="ghost" className="w-full">Close</Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyTicketsPage;

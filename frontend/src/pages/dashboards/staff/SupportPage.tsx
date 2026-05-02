// src/pages/dashboards/staff/SupportPage.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  HelpCircle,
  MessageSquare,
  Ticket,
  CheckCircle,
  Plus,
  Send,
  Search,
  Download,
  QrCode as QrIcon,
  Trash2
} from "lucide-react";
import { useRef } from "react";
import { toPng } from "html-to-image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import API from "@/services/api";

interface TicketType {
  id: string;
  issue: string;
  description: string;
  attendee: string;
  status: "open" | "in-progress" | "resolved";
  time: string;
  ticketId?: string;
  eventName?: string;
}

const statusColors: Record<string, string> = {
  open: "bg-red-100 text-red-700",
  "in-progress": "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
};

interface SearchResult {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  eventName: string;
  date?: string;
  location?: string;
  status: string;
}

const SupportPage = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [manualName, setManualName] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<SearchResult | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const detailQrRef = useRef<HTMLDivElement>(null);
  const [issueType, setIssueType] = useState<string>("");
  const [viewingTicket, setViewingTicket] = useState<TicketType | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tickets from backend
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await API.get("/staff/support-tickets");
        setTickets(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load support tickets");
      }
    };

    fetchTickets();
    // Optional: auto-refresh every 15 seconds
    const interval = setInterval(fetchTickets, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async () => {
    if (searchName.length < 3) {
      toast.error("Enter at least 3 characters to search");
      return;
    }
    setIsSearching(true);
    setSelectedAttendee(null);
    try {
      const res = await API.get(`/staff/search-attendee?name=${encodeURIComponent(searchName)}`);
      setSearchResults(res.data);
      if (res.data.length === 0) {
        toast.info("No matching ticket found for this name");
      } else {
        toast.success(`${res.data.length} ticket(s) found!`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const downloadQR = async () => {
    if (!qrRef.current) return;
    try {
      const dataUrl = await toPng(qrRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = `QR-${selectedAttendee?.name || "ticket"}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("QR Code downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download QR code");
    }
  };

  const downloadDetailQR = async () => {
    if (!detailQrRef.current) return;
    try {
      const dataUrl = await toPng(detailQrRef.current, { cacheBust: true });
      const link = document.createElement("a");
      link.download = `QR-Detail-${viewingTicket?.attendee || "ticket"}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("QR Code downloaded!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download QR code");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const description = formData.get("description") as string;
    const attendeeName = selectedAttendee ? selectedAttendee.name : (manualName || searchName);

    if (!attendeeName) {
      toast.error("Please enter or search for an attendee name");
      return;
    }

    if (!issueType) {
      toast.error("Please select an issue type");
      return;
    }

    if (!description) {
      toast.error("Please enter a description");
      return;
    }

    const newTicketPayload = {
      attendee: attendeeName,
      issueType: issueType,
      description: description,
      ticketId: selectedAttendee?.id || "",
      eventName: selectedAttendee?.eventName || ""
    };

    setIsSubmitting(true);
    try {
      const res = await API.post("/staff/support-tickets", newTicketPayload);
      const created: TicketType = res.data;
      setTickets((prev) => [created, ...prev]);
      toast.success("Support ticket created!");
      setShowNewTicket(false);
      setIssueType("");
      setSelectedAttendee(null);
      setSearchResults([]);
      setSearchName("");
      setManualName("");
      form.reset();

      // Force a refresh from server to be sure
      const refreshRes = await API.get("/staff/support-tickets");
      setTickets(refreshRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this support ticket?")) return;
    try {
      await API.delete(`/staff/support-tickets/${id}`);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      toast.success("Ticket deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete ticket");
    }
  };

  // Stats
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in-progress").length;
  const resolvedToday = tickets.filter((t) => {
    const today = new Date().toDateString();
    const ticketDate = new Date(t.time).toDateString();
    return t.status === "resolved" && ticketDate === today;
  }).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <HelpCircle className="h-8 w-8 text-primary" />
              Help Desk
            </h1>
            <p className="text-muted-foreground mt-1">Manage support tickets and attendee issues.</p>
          </div>
          <Button onClick={() => setShowNewTicket(!showNewTicket)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{openCount}</p>
              <p className="text-sm text-muted-foreground">Open Tickets</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{inProgressCount}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold">{resolvedToday}</p>
              <p className="text-sm text-muted-foreground">Resolved Today</p>
            </CardContent>
          </Card>
        </div>

        {/* New Ticket Form */}
        {showNewTicket && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
            <Card>
              <CardHeader>
                <CardTitle>Create Support Ticket</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Search Section */}
                  <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-dashed border-primary/20">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search Attendee Name</label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type name to find ticket..."
                          value={searchName}
                          onChange={(e) => setSearchName(e.target.value)}
                        />
                        <Button type="button" onClick={handleSearch} disabled={isSearching} variant="secondary">
                          {isSearching ? <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" /> : <Search className="h-4 w-4" />}
                          <span className="ml-2 hidden sm:inline">Search</span>
                        </Button>
                      </div>
                    </div>

                    {/* Search Results */}
                    {searchResults.length > 0 && !selectedAttendee && (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {searchResults.map((res) => (
                          <div
                            key={res.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-primary cursor-pointer transition-colors"
                            onClick={() => setSelectedAttendee(res)}
                          >
                            <div>
                              <p className="font-bold text-sm">{res.name}</p>
                              <p className="text-xs text-muted-foreground">{res.eventName} • {res.ticketType}</p>
                            </div>
                            <Badge variant="outline" className="text-[10px] uppercase">{res.status}</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* QR Display for selected attendee */}
                    {selectedAttendee && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                        <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2 border border-green-200">
                          <CheckCircle className="h-5 w-5" />
                          <p className="text-sm font-semibold">Ticket Found & Verified: {selectedAttendee.name}</p>
                        </div>

                        <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
                          <div ref={qrRef} className="p-4 bg-white border-4 border-muted rounded-xl">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(JSON.stringify({
                                id: selectedAttendee.id,
                                event: selectedAttendee.eventName,
                                attendee: selectedAttendee.name
                              }))}`}
                              alt="Generated QR"
                              className="w-40 h-40"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button type="button" variant="outline" size="sm" onClick={downloadQR} className="gap-2">
                              <Download className="h-4 w-4" /> Download QR
                            </Button>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedAttendee(null)}>Change</Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Ticket Details Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Attendee Name (for Ticket)</label>
                        <Input
                          name="attendee"
                          placeholder="Enter attendee name"
                          required
                          value={selectedAttendee ? selectedAttendee.name : manualName}
                          onChange={(e) => !selectedAttendee && setManualName(e.target.value)}
                          readOnly={!!selectedAttendee}
                          className={selectedAttendee ? "bg-muted" : ""}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Issue Type</label>
                        <Select onValueChange={setIssueType} value={issueType} required>
                          <SelectTrigger><SelectValue placeholder="Select issue type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lost-ticket">Lost Ticket</SelectItem>
                            <SelectItem value="wrong-type">Wrong Ticket Type</SelectItem>
                            <SelectItem value="qr-issue">QR Code Issue</SelectItem>
                            <SelectItem value="refund">Refund Request</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <Textarea name="description" placeholder="Describe the issue..." rows={3} required />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setShowNewTicket(false);
                        setSelectedAttendee(null);
                        setSearchResults([]);
                        setSearchName("");
                      }}>Cancel</Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Submit Ticket
                      </Button>
                    </div>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Tickets List */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-primary" />
                Support Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ticket.status === "resolved" ? "bg-green-100" : ticket.status === "in-progress" ? "bg-amber-100" : "bg-red-100"}`}>
                      {ticket.status === "resolved" ? <CheckCircle className="h-5 w-5 text-green-600" /> : <MessageSquare className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                        <Badge className={statusColors[ticket.status]}>{ticket.status}</Badge>
                      </div>
                      <p className="font-medium">{ticket.issue}</p>
                      <p className="text-sm text-muted-foreground">
                        {ticket.attendee} • {new Date(ticket.time).toLocaleDateString()} {new Date(ticket.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      setViewingTicket(ticket);
                      setIsDetailsModalOpen(true);
                    }}>View Details</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(ticket.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No tickets yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* View Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden rounded-3xl border-none">
          {viewingTicket && (
            <div className="flex flex-col">
              <div className="h-32 bg-primary relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                  <Badge className="bg-white text-primary hover:bg-white">{viewingTicket.status}</Badge>
                  <p className="text-white font-black text-xl">Ticket Support</p>
                </div>
              </div>

              <div className="p-8 space-y-6 text-center bg-white">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-foreground">{viewingTicket.issue}</h2>
                  <p className="text-sm text-muted-foreground">{viewingTicket.description}</p>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div ref={detailQrRef} className="p-4 bg-white border-8 border-muted rounded-3xl shadow-inner inline-block">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({
                        id: viewingTicket.ticketId || viewingTicket.id,
                        event: viewingTicket.eventName || "Support Event",
                        attendee: viewingTicket.attendee
                      }))}`}
                      alt="Support Ticket QR"
                      className="w-48 h-48"
                    />
                  </div>
                  <Button onClick={downloadDetailQR} className="gap-2" variant="outline" size="sm">
                    <Download className="h-4 w-4" /> Download QR
                  </Button>
                </div>

                <div className="bg-muted p-4 rounded-2xl text-left">
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Attendee Name</p>
                  <p className="font-bold text-lg">{viewingTicket.attendee}</p>
                  {viewingTicket.eventName && (
                    <>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 mt-3">Event</p>
                      <p className="font-semibold">{viewingTicket.eventName}</p>
                    </>
                  )}
                  <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1 mt-3">Created At</p>
                  <p className="text-sm">{new Date(viewingTicket.time).toLocaleString()}</p>
                </div>
              </div>

              <div className="p-6 bg-white border-t flex flex-col gap-3">
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

export default SupportPage;

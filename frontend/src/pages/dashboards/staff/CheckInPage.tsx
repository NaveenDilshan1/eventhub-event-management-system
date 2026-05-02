// src/pages/dashboards/staff/CheckInPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  UserCheck,
  Search,
  CheckCircle,
  Users,
  Clock,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  ticketId: string;
  checkedIn: boolean;
  checkInTime?: string;
}

const typeColors: Record<string, string> = {
  VIP: "bg-amber-100 text-amber-700",
  Standard: "bg-blue-100 text-blue-700",
  "Early Bird": "bg-green-100 text-green-700",
};

const CheckInPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [search, setSearch] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [eventName, setEventName] = useState("Event");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "approved">("all");

  const [noEvents, setNoEvents] = useState(false);

  // ================= FETCH STAFF EVENTS (IF NO EVENT ID) =================
  useEffect(() => {
    const checkEvents = async () => {
      if (!eventId) {
        setLoading(true);
        try {
          const res = await fetch("http://localhost:5000/api/staff/events", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
          if (!res.ok) throw new Error("Failed to fetch events");
          const events = await res.json();

          if (events && events.length > 0) {
            // Automatically pick the first event to show attendees
            navigate(`/dashboard/staff/events/${events[0].id}/attendees`);
          } else {
            setNoEvents(true);
            setLoading(false);
          }
        } catch (err) {
          console.error("Event check error:", err);
          setNoEvents(true);
          setLoading(false);
        }
      }
    };
    checkEvents();
  }, [eventId, navigate]);

  // ================= FETCH ATTENDEES =================
  const fetchAttendees = async () => {
    try {
      if (!eventId) return; // Wait until we have an eventId
      setLoading(true);

      const res = await fetch(`http://localhost:5000/api/staff/events/${eventId}/attendees`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) throw new Error("Failed to fetch attendees");

      const data = await res.json();
      const confirmedAttendees: Attendee[] = data.attendees.map((a: any) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        ticketType: a.ticketType,
        ticketId: a.ticketId || a.id.slice(-6),
        checkedIn: a.checkedIn,
        checkInTime: a.checkInTime ? new Date(a.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      }));

      setAttendees(confirmedAttendees);
      setEventName(data.eventName || "Event");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendees();
  }, [eventId]);

  // ================= EVENT ID CHECK =================
  if (!eventId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[500px] text-center space-y-4">
          {noEvents ? (
            <>
              <div className="p-4 bg-red-50 rounded-full">
                <Calendar className="h-10 w-10 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">No Events Assigned</h2>
                <p className="text-muted-foreground">You don't have any events assigned for check-in yet.</p>
              </div>
              <Button onClick={() => navigate("/dashboard/staff")}>Go to Dashboard</Button>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Finding assigned events...</p>
            </>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ================= CHECK-IN HANDLER =================
  const handleCheckIn = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/staff/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ qrData: id }) // Send ID as QR data for manual check-in
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Check-in failed");
      }

      toast.success("Attendee checked in successfully!");
      fetchAttendees(); // Refresh the list
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Check-in failed");
    }
  };

  const filteredAttendees = attendees.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.ticketId.toLowerCase().includes(search.toLowerCase());

    if (activeTab === "approved") {
      return matchesSearch && a.checkedIn;
    }
    return matchesSearch;
  });

  const checkedInCount = attendees.filter(a => a.checkedIn).length;

  if (loading && attendees.length === 0) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-primary" />
              {eventName}
            </h1>
            <p className="text-muted-foreground mt-1">Manage event arrivals and QR approvals.</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchAttendees} className="gap-2">
            <Clock className="h-4 w-4" />
            Refresh List
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white shadow-sm border-none">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{attendees.length}</p>
                <p className="text-sm text-muted-foreground">Total Expected</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-none">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-2xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{checkedInCount}</p>
                <p className="text-sm text-muted-foreground">Approved Today</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-sm border-none">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 bg-amber-50 rounded-2xl">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">{attendees.length - checkedInCount}</p>
                <p className="text-sm text-muted-foreground">Pending Arrival</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/10 pb-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                  <Button
                    variant={activeTab === "all" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 text-xs px-4"
                    onClick={() => setActiveTab("all")}
                  >
                    All Attendees
                  </Button>
                  <Button
                    variant={activeTab === "approved" ? "default" : "ghost"}
                    size="sm"
                    className="h-8 text-xs px-4"
                    onClick={() => setActiveTab("approved")}
                  >
                    Approved (QR Scanned)
                  </Button>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-10 border-none bg-muted/50"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border max-h-[500px] overflow-y-auto">
                {filteredAttendees.length > 0 ? filteredAttendees.map((attendee) => (
                  <div key={attendee.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${attendee.checkedIn ? "bg-green-100" : "bg-gray-100"}`}>
                        {attendee.checkedIn ? <CheckCircle className="h-6 w-6 text-green-600" /> : <Users className="h-6 w-6 text-gray-400" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-800">{attendee.name}</p>
                          <Badge className={`${typeColors[attendee.ticketType] || "bg-gray-100"} border-none font-medium`}>{attendee.ticketType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{attendee.email}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1 uppercase">ID: {attendee.ticketId}</p>
                      </div>
                    </div>
                    {attendee.checkedIn ? (
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 mb-1">APPROVED</Badge>
                        <p className="text-[10px] font-medium text-muted-foreground flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />
                          {attendee.checkInTime}
                        </p>
                      </div>
                    ) : (
                      <Button onClick={() => handleCheckIn(attendee.id)} className="rounded-full px-6 shadow-sm">
                        Manual Check-in
                      </Button>
                    )}
                  </div>
                )) : (
                  <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-gray-500 font-medium">No results found</p>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default CheckInPage;

// src/pages/dashboards/staff/StaffDashboard.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import axios from "axios";

interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  ticketId: string;
  checkedIn: boolean;
  checkInTime?: string;
}

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  checkedIn: number;
  total: number;
  status: "ongoing" | "upcoming";
}

const ticketTypeColors: Record<string, string> = {
  VIP: "bg-amber-100 text-amber-700",
  Standard: "bg-blue-100 text-blue-700",
  "Early Bird": "bg-green-100 text-green-700",
  Student: "bg-purple-100 text-purple-700",
};

export const StaffDashboard = () => {
  const { toast } = useToast();

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch attendees from backend
  const fetchAttendees = async () => {
    try {
      const res = await axios.get("/api/staff/attendees");
      setAttendees(res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching attendees",
        description: "Unable to load attendees. Please try again.",
      });
    }
  };

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      const res = await axios.get("/api/staff/events");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error fetching events",
        description: "Unable to load events. Please try again.",
      });
    }
  };

  useEffect(() => {
    fetchAttendees();
    fetchEvents();
  }, []);

  const handleCheckIn = async (attendeeId: string) => {
    try {
      await axios.post(`/api/staff/attendees/${attendeeId}/checkin`);
      setAttendees(prev =>
        prev.map(a =>
          a.id === attendeeId
            ? { ...a, checkedIn: true, checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
            : a
        )
      );
      const attendee = attendees.find(a => a.id === attendeeId);
      toast({
        title: "Check-in Successful",
        description: `${attendee?.name} has been checked in.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Check-in Failed",
        description: "Something went wrong. Please try again.",
      });
    }
  };

  const checkedInCount = attendees.filter(a => a.checkedIn).length;
  const pendingCount = attendees.filter(a => !a.checkedIn).length;

  const filteredAttendees = attendees.filter(
    a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.ticketId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to your dashboard!</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Checked-In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{checkedInCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Events */}
      <h2 className="mt-8 mb-2 text-xl font-semibold">Upcoming Events</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {events.map(e => (
          <Card key={e.id}>
            <CardHeader>
              <CardTitle>{e.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{e.date} | {e.time}</p>
              <p>{e.location}</p>
              <p>Checked-In: {e.checkedIn}/{e.total}</p>
              <Badge variant={e.status === "ongoing" ? "destructive" : "secondary"} className="mt-2">
                {e.status.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendees */}
      <h2 className="mt-8 mb-2 text-xl font-semibold">Attendees</h2>
      <Input
        placeholder="Search by name, email, ticket ID"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      <div className="space-y-2 max-h-96 overflow-auto">
        {filteredAttendees.map(a => (
          <Card key={a.id} className="flex justify-between items-center p-4">
            <div>
              <p className="font-medium">{a.name}</p>
              <p className="text-sm text-muted-foreground">{a.email}</p>
            </div>
            <Badge className={ticketTypeColors[a.ticketType] || "bg-gray-100 text-gray-700"}>
              {a.ticketType}
            </Badge>
            <div className="flex items-center gap-2">
              <p>{a.ticketId}</p>
              {!a.checkedIn && (
                <Button size="sm" onClick={() => handleCheckIn(a.id)}>
                  Check-In
                </Button>
              )}
              {a.checkedIn && <p className="text-green-600 font-medium">{a.checkInTime}</p>}
            </div>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

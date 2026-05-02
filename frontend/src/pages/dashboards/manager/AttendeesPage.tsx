import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, StatusBadge, Column } from "@/components/dashboard/DataTable";
import { Users, Search, Mail, Filter } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import API from "@/services/api";

interface Event {
  _id: string;
  id: string;
  title: string;
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventId: string;
  eventName: string;
  ticketType: string;
  status: string;
  registeredAt: string;
}

const columns: Column<Attendee>[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "eventName", label: "Event" },
  { key: "ticketType", label: "Ticket Type" },
  { key: "status", label: "Status", render: (item) => <StatusBadge status={item.status} /> },
  { key: "registeredAt", label: "Registered" },
];

const AttendeesPage = () => {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("all");

  const [viewAttendee, setViewAttendee] = useState<Attendee | null>(null);
  const [editAttendee, setEditAttendee] = useState<Attendee | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch events first for mapping
        const eventsRes = await API.get("/events/manager");
        const eventsData = eventsRes.data;
        setEvents(eventsData);

        const eventMap: Record<string, string> = {};
        eventsData.forEach((e: any) => {
          eventMap[e._id] = e.title;
          eventMap[e.id] = e.title;
        });

        // Fetch attendees for this manager
        const attRes = await API.get("/attendees/manager");
        const mapped = attRes.data.attendees.map((att: any) => ({
          id: att._id,
          name: att.name,
          email: att.email,
          phone: att.phone,
          eventId: att.eventId,
          eventName: eventMap[att.eventId] || att.eventName || "Unknown Event",
          ticketType: att.ticketType,
          status: att.status,
          registeredAt: new Date(att.registeredAt).toLocaleDateString(),
        }));

        setAttendees(mapped);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filtered = attendees.filter(att =>
    (att.name.toLowerCase().includes(search.toLowerCase()) ||
      att.email.toLowerCase().includes(search.toLowerCase())) &&
    (eventFilter === "all" || att.eventName === eventFilter)
  );

  // ---- Send Email ----
  const handleSendEmail = async () => {
    try {
      await API.post("/attendees/send-email", { attendees: filtered.map(a => a.id) });
      toast.success("Email sent to all attendees!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send emails");
    }
  };

  // ---- Edit Attendee ----
  const handleUpdate = async () => {
    if (!editAttendee) return;

    try {
      const res = await API.put(`/attendees/${editAttendee.id}`, {
        name: editName,
        email: editEmail,
      });

      const updated = res.data;

      setAttendees(prev =>
        prev.map(a => (a.id === (updated._id || updated.id) ? {
          ...a,
          name: updated.name || updated.buyerName,
          email: updated.email || updated.buyerEmail,
        } : a))
      );

      toast.success("Attendee updated!");
      setEditAttendee(null);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  };

  // ---- Delete Attendee ----
  const handleDelete = async (item: Attendee) => {
    if (!window.confirm(`Are you sure you want to delete ${item.name}?`)) return;

    try {
      await API.delete(`/attendees/${item.id}`);
      setAttendees(prev => prev.filter(a => a.id !== item.id));
      toast.success("Attendee removed successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete attendee");
    }
  };


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Attendees
            </h1>
            <p className="text-muted-foreground mt-1">View and manage all event attendees.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSendEmail} className="gap-2">
              <Mail className="h-4 w-4" />
              Send Email
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
                </div>
                <Select value={eventFilter} onValueChange={setEventFilter}>
                  <SelectTrigger className="w-64">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    {events.map(ev => (
                      <SelectItem key={ev._id} value={ev.title}>{ev.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Attendees Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <DataTable
            title="All Attendees"
            data={filtered}
            columns={columns}
            onView={(item) => setViewAttendee(item)}
            onEdit={(item) => {
              setEditAttendee(item);
              setEditName(item.name);
              setEditEmail(item.email);
            }}
            onDelete={handleDelete}
          />
        </motion.div>

        {/* View Modal */}
        {viewAttendee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">Attendee Details</h2>
              <p><b>Name:</b> {viewAttendee.name}</p>
              <p><b>Email:</b> {viewAttendee.email}</p>
              <p><b>Phone:</b> {viewAttendee.phone}</p>
              <p><b>Event:</b> {viewAttendee.eventName}</p>
              <p><b>Ticket:</b> {viewAttendee.ticketType}</p>
              <p><b>Status:</b> {viewAttendee.status}</p>
              <p><b>Registered:</b> {viewAttendee.registeredAt}</p>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setViewAttendee(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editAttendee && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
              <h2 className="text-xl font-bold mb-4">Edit Attendee</h2>
              <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" className="mb-2" />
              <Input value={editEmail} onChange={e => setEditEmail(e.target.value)} placeholder="Email" />
              <div className="mt-4 flex justify-end gap-2">
                <Button onClick={handleUpdate}>Save</Button>
                <Button variant="outline" onClick={() => setEditAttendee(null)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AttendeesPage;
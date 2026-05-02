// src/pages/dashboards/manager/MyEventsPage.tsx
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, Clock, MapPin, Edit, Trash2, Ban, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRole } from "@/context/RoleContext";
import { useCurrency } from "@/context/CurrencyContext";
import API from "@/services/api";

// Event interface
interface EventItem {
  _id: string;
  id: string;           // Ensure we access the string ID
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  ticketsAvailable: number;
  ticketsSold: number;
  revenue: number;
  status: string;
  imageUrl?: string;
}

// Fallback image
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?w=400&h=200&fit=crop";

const MyEventsPage = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);
  const navigate = useNavigate();
  const { role } = useRole();

  const dashPath = role === "staff" ? "staff" : "manager";

  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/events/manager");
        const data = res.data;

        setEvents(
          data.map((event: any) => ({
            ...event,
            id: event._id,
            ticketsSold: event.soldTickets ?? 0,
            ticketsAvailable: event.totalTickets ?? 0,
            revenue: (event.price ?? 0) * (event.soldTickets ?? 0),
            imageUrl: event.imageUrl
              ? (event.imageUrl.startsWith('http') ? event.imageUrl : `${API.defaults.baseURL?.replace('/api', '')}${event.imageUrl}`)
              : DEFAULT_IMAGE,
          }))
        );
      } catch (err) {
        console.error(err);
        toast.error("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    try {
      setDeleting(eventId);
      await API.delete(`/events/${eventId}`);
      setEvents(events.filter(e => e._id !== eventId || e.id !== eventId));
      toast.success("Event deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete event");
    } finally {
      setDeleting(null);
    }
  };

  const handleCancelEvent = async (eventId: string, title: string) => {
    const confirmCancel = window.confirm(
      `Are you sure you want to CANCEL "${title}"? \n\nThis will: \n1. Mark the event as Cancelled \n2. Automatically REFUND all purchased tickets \n3. Send notifications to all attendees \n\nThis action cannot be undone.`
    );

    if (!confirmCancel) return;

    try {
      setCancelling(eventId);
      await API.put(`/events/${eventId}`, { status: "cancelled" });

      // Update local state to reflect the cancelled status
      setEvents(events.map(e => (e._id === eventId || e.id === eventId) ? { ...e, status: "cancelled" } : e));

      toast.success("Event cancelled and refunds processed successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to cancel event");
    } finally {
      setCancelling(null);
    }
  };

  const handlePublishEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to publish this event? This will make it visible to the public.")) {
      return;
    }

    try {
      setPublishing(eventId);
      await API.put(`/events/${eventId}`, { status: "upcoming" });

      // Update local state
      setEvents(events.map(e => (e._id === eventId || e.id === eventId) ? { ...e, status: "upcoming" } : e));

      toast.success("Event published successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to publish event");
    } finally {
      setPublishing(null);
    }
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/dashboard/${dashPath}/events/edit/${eventId}`);
  };

  return (
    <DashboardLayout>
      <h2 className="text-2xl font-bold mb-4">My Events</h2>

      {loading && <p>Loading...</p>}
      {!loading && events.length === 0 && <p>No events available.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <Card key={event._id} className="shadow-lg hover:shadow-xl transition overflow-hidden">
            {/* Event Image with Overlay */}
            <div
              className="relative h-40 bg-cover bg-center flex items-end overflow-hidden group"
              style={{
                backgroundImage: `url('${event.imageUrl}')`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/70 transition"></div>
              <div className="relative p-3 w-full">
                <h3 className="font-bold text-white text-sm truncate">{event.title}</h3>
              </div>
            </div>

            <CardContent className="flex flex-col gap-2 pt-3">
              {event.description && <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>}
              <div className="flex gap-2 text-sm text-muted-foreground items-center">
                {event.date && <Calendar className="h-4 w-4" />} {event.date}{" "}
                {event.time && <Clock className="h-4 w-4" />} {event.time}
              </div>
              {event.location && (
                <div className="flex gap-2 items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {event.location}
                </div>
              )}
              <p>Tickets Sold: {event.ticketsSold} / {event.ticketsAvailable}</p>
              <p>Revenue: {formatCurrency(event.revenue ?? 0)}</p>
              <p>Status: {event.status}</p>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleEditEvent(event._id)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleDeleteEvent(event._id)}
                  disabled={deleting === event._id}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  {deleting === event._id ? "Deleting..." : "Delete"}
                </Button>
              </div>

              {event.status === "draft" && (
                <Button
                  size="sm"
                  className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handlePublishEvent(event._id)}
                  disabled={publishing === event._id}
                >
                  <Globe className="h-4 w-4 mr-1" />
                  {publishing === event._id ? "Publishing..." : "Publish Event"}
                </Button>
              )}

              {event.status !== "cancelled" && event.status !== "draft" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleCancelEvent(event._id, event.title)}
                  disabled={cancelling === event._id}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  {cancelling === event._id ? "Cancelling..." : "Cancel Event"}
                </Button>
              )}

              {event.status === "cancelled" && (
                <div className="mt-2 text-center text-xs font-medium text-red-600 bg-red-50 py-1 rounded">
                  Cancelled & Refunded
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default MyEventsPage;

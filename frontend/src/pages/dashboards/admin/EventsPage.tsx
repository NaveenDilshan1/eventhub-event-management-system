// src/pages/dashboards/admin/EventsPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Eye, Edit, Trash2, MoreVertical, Ticket, DollarSign, User, RefreshCw, Globe } from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";

interface EventType {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: string;
  imageUrl?: string;
  category?: string;
  totalTickets?: number;
  soldTickets?: number;
  price?: number;
  createdBy?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop";

const EventsPage = () => {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const fetchEvents = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("You must be logged in");

    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mappedEvents = res.data.map((e: any) => ({
        ...e,
        // Handle image URL properly for both relative and absolute paths
        imageUrl: e.imageUrl
          ? (e.imageUrl.startsWith('http') ? e.imageUrl : `http://localhost:5000${e.imageUrl}`)
          : DEFAULT_IMAGE,
      }));

      setEvents(mappedEvents);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (_id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("You must be logged in");

    try {
      if (!confirm("Are you sure you want to delete this event?")) return;

      await axios.delete(`http://localhost:5000/api/events/${_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setEvents(prev => prev.filter(e => e._id !== _id));
      toast.success("Event deleted successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete event");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'upcoming': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      case 'draft': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const handlePublish = async (_id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("You must be logged in");

    try {
      if (!confirm("Are you sure you want to publish this event? This will make it visible to the public.")) return;

      setPublishing(_id);
      await axios.put(`http://localhost:5000/api/events/${_id}`,
        { status: "upcoming" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEvents(prev => prev.map(e => e._id === _id ? { ...e, status: "upcoming" } : e));
      toast.success("Event published successfully");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to publish event");
    } finally {
      setPublishing(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const { formatCurrency } = useCurrency();

  const filteredEvents = events.filter(e =>
    (e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase()) ||
      e.category?.toLowerCase().includes(search.toLowerCase())) &&
    (statusFilter === "all" || e.status === statusFilter)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="h-8 w-8 text-primary" /> All Events
          </h1>
          <Button variant="outline" onClick={fetchEvents} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Search by title, location, category..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="md:w-80"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading events...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-10">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No events found</p>
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <Card key={event._id} className="shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              {/* Event Image with Overlay */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Status Badge */}
                <Badge className={`absolute top-3 right-3 ${getStatusColor(event.status)} text-white`}>
                  {event.status || 'Unknown'}
                </Badge>

                {/* Category Badge */}
                {event.category && (
                  <Badge variant="secondary" className="absolute top-3 left-3">
                    {event.category}
                  </Badge>
                )}

                {/* Title on Image */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-bold text-lg text-white truncate">{event.title}</h3>
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                {/* Description */}
                {event.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                )}

                {/* Date & Time */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  {event.time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{event.time}</span>
                    </div>
                  )}
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                {/* Tickets & Price Info */}
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Ticket className="h-4 w-4 text-primary" />
                    <span>{event.soldTickets || 0} / {event.totalTickets || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span>{formatCurrency(event.price ?? 0)}</span>
                  </div>
                </div>

                {/* Created By */}
                {event.createdBy && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground border-t pt-2">
                    <User className="h-3 w-3" />
                    <span>
                      Created by: {event.createdBy.firstName || ''} {event.createdBy.lastName || event.createdBy.email || 'Unknown'}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/dashboard/admin/events/${event._id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/dashboard/admin/events/edit/${event._id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive cursor-pointer"
                          onClick={async (e) => {
                            e.preventDefault();
                            await handleDelete(event._id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {event.status === "draft" && (
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                      onClick={() => handlePublish(event._id)}
                      disabled={publishing === event._id}
                    >
                      <Globe className="h-4 w-4" />
                      {publishing === event._id ? "Publishing..." : "Publish Event"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EventsPage;

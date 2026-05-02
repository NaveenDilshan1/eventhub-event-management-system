// src/pages/dashboards/user/BrowseEventsPage.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Search, Calendar, MapPin, Clock, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import heroImage from "@/assets/hero-events.jpg";

interface Event {
  _id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  price?: number;
  category?: string;
  totalTickets?: number;
  soldTickets?: number;
  imageUrl?: string;
}

const BrowseEventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventsRes, catsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/events/public"),
          axios.get("http://localhost:5000/api/categories")
        ]);

        setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
        setCategories(Array.isArray(catsRes.data) ? catsRes.data : []);
      } catch (err) {
        console.error("Error fetching data:", err);
        toast.error("Failed to load events.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEvents = events.filter((event) => {
    const searchTerm = search.toLowerCase().trim();
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm) ||
      (event.category || "").toLowerCase().includes(searchTerm) ||
      (event.location || "").toLowerCase().includes(searchTerm);

    const matchesCategory = category === "all" || event.category?.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const handleBookTicket = (eventId: string) => {
    navigate(`/dashboard/user/events/${eventId}`);
  };

  if (loading) return (
    <DashboardLayout>
      <div className="text-center py-12">Loading events...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">Browse Events</h1>
          <p className="text-muted-foreground mt-1">Discover and book amazing events near you.</p>
        </motion.div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-64 h-11 bg-secondary/50 border-none">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </p>
          {(search || category !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearch(""); setCategory("all"); }}
              className="text-primary hover:text-primary/80"
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-4"
          >
            <div className="p-4 bg-secondary/50 rounded-full">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">No events found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                We couldn't find any events matching your search criteria. Try a different category or search term.
              </p>
            </div>
          </motion.div>
        )}

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => {
            const eventImageUrl = event.imageUrl
              ? (event.imageUrl.startsWith('http') ? event.imageUrl : `http://localhost:5000${event.imageUrl}`)
              : heroImage;

            return (
              <motion.div key={event._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 group bg-card/50 backdrop-blur-sm">
                  <div className="relative h-48 overflow-hidden">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url('${eventImageUrl}')` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    <div className="absolute top-3 left-3 flex gap-2">
                      {event.category && (
                        <Badge className="bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white/30 transition-colors capitalize">
                          {event.category}
                        </Badge>
                      )}
                    </div>

                    {event.price != null && (
                      <div className="absolute bottom-3 right-3">
                        <Badge className="bg-primary text-primary-foreground shadow-lg px-3 py-1 text-sm font-bold">
                          ₹{event.price.toLocaleString()}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-5 space-y-4">
                    <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {event.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary/70" />
                        <span className="truncate">{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-primary/70" />
                        <span className="truncate">{event.time || "TBA"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                        <MapPin className="h-4 w-4 text-primary/70" />
                        <span className="truncate">{event.location || "Online"}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full h-11 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 group-hover:translate-y-[-2px] transition-all"
                      onClick={() => handleBookTicket(event._id)}
                    >
                      Book Tickets
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrowseEventsPage;

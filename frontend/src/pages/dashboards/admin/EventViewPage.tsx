// src/pages/dashboards/admin/EventViewPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";

interface EventType {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  status: string;
  imageUrl?: string;
  totalTickets?: number;
  soldTickets?: number;
  price?: number;
}

interface GalleryImage {
  _id: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
}

const DEFAULT_IMAGE = "https://via.placeholder.com/600x300?text=No+Image";

const EventViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("You must be logged in");

      try {
        const res = await axios.get(`http://localhost:5000/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvent(res.data);
      } catch (err: any) {
        console.error(err);
        toast.error(err.response?.data?.message || "Event not found");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <div className="p-4 text-center">Loading...</div>;
  if (!event) return <div className="p-4 text-red-600 text-center">Event not found</div>;

  const imageUrl = event.imageUrl 
    ? (event.imageUrl.startsWith('http') ? event.imageUrl : `http://localhost:5000${event.imageUrl}`)
    : DEFAULT_IMAGE;

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div
        className="relative h-96 bg-cover bg-center flex items-end"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url('${imageUrl}')`
        }}
      >
        <div className="w-full p-6 text-white space-y-2">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/20 mb-4">
            Back
          </Button>
          <h1 className="text-4xl font-bold">{event.title}</h1>
          <p className="text-gray-200">{event.location}</p>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
      <Card className="-mt-12 relative shadow-xl">
        <CardContent className="space-y-4 p-6">
          <div className="flex justify-between items-start">
            <div></div>
            <Badge
  variant={
    event.status === "upcoming"
      ? "secondary"
      : event.status === "completed"
      ? "outline"
      : "destructive"
  }
>
  {event.status.toUpperCase()}
</Badge>

          </div>

          <p className="text-gray-700">{event.description}</p>

          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event.date}</div>
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {event.time}</div>
            <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</div>
          </div>

          <div className="flex gap-6 mt-4 text-gray-600">
            <div>Total Tickets: <span className="font-semibold">{event.totalTickets || 0}</span></div>
            <div>Sold Tickets: <span className="font-semibold">{event.soldTickets || 0}</span></div>
            <div>Price: <span className="font-semibold">₹{event.price || 0}</span></div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default EventViewPage;

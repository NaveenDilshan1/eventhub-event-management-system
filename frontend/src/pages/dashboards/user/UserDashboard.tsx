// src/pages/dashboards/user/UserDashboard.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Calendar, Ticket, Clock, Star, ArrowRight, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import heroImage from "@/assets/hero-events.jpg";
import { useRole } from "@/context/RoleContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Event {
  _id: string;
  name: string;
  date: string;
  time?: string;
  location: string;
  ticketType?: string;
  image?: string;
  price?: string;
}
export const USER_EVENT_IMAGE = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=200&fit=crop";
const UserDashboard = () => {
  const navigate = useNavigate();
  const { userId, userName, userAvatar } = useRole();

  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [ticketsCount, setTicketsCount] = useState(0);
  const [pastEventsCount, setPastEventsCount] = useState(0);
  const [rewardPoints, setRewardPoints] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch Events and filter for dashboard
    axios.get("http://localhost:5000/api/events/public", { headers })
      .then(res => {
        const sorted = res.data
          .filter((e: any) => {
            const evDate = new Date(e.date);
            evDate.setHours(0, 0, 0, 0);
            return evDate.getTime() >= new Date().setHours(0, 0, 0, 0);
          })
          .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setUpcomingEvents(sorted.slice(0, 3).map((e: any) => ({
          _id: e.id || e._id,
          name: e.title,
          date: e.date,
          time: e.time,
          location: e.location,
          image: e.imageUrl,
          price: `₹${e.price}`
        })));

        setRecommendedEvents(sorted.slice(3, 6).map((e: any) => ({
          _id: e.id || e._id,
          name: e.title,
          date: e.date,
          time: e.time,
          location: e.location,
          image: e.imageUrl,
          price: `₹${e.price}`
        })));
      })
      .catch(err => console.error(err));

    // Fetch My Tickets
    axios.get("http://localhost:5000/api/tickets/my", { headers })
      .then(res => {
        setTicketsCount(res.data.length);
        const past = res.data.filter((t: any) => t.status === "past").length;
        setPastEventsCount(past);
      })
      .catch(err => console.error(err));

    // Fetch Profile for reward points
    axios.get(`http://localhost:5000/api/masterusers/${userId}`, { headers })
      .then(res => setRewardPoints(res.data.points || 0))
      .catch(err => console.error(err));

  }, [userId]);

  return (
    <DashboardLayout >
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarImage src={userAvatar || ""} className="object-cover" />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {userName?.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, {userName}! 👋</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your events today.</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard title="My Tickets" value={ticketsCount} icon={Ticket} />
          <StatsCard title="Upcoming Events" value={upcomingEvents.length} icon={Calendar} iconColor="text-blue-600" iconBg="bg-blue-100" />
          <StatsCard title="Past Events" value={pastEventsCount} icon={Clock} iconColor="text-muted-foreground" iconBg="bg-secondary" />
          <StatsCard title="Rewards Points" value={rewardPoints} icon={Star} iconColor="text-amber-600" iconBg="bg-amber-100" />
        </div>

        {/* Upcoming Events */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Your Upcoming Events</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/user/my-tickets")}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map(event => (
                <div key={event._id} className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-secondary/30 transition-colors">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: `url('${event.image || heroImage}')` }}>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{event.name}</h3>
                      {event.ticketType && <Badge variant="outline">{event.ticketType}</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(event.date).toDateString()}</span>
                      {event.time && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>}
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => navigate("/dashboard/user/my-tickets")}>View Ticket</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recommended Events */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recommended for You</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/user/browse-events")}>
              Browse All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {recommendedEvents.map((event, index) => (
              <motion.div key={event._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + index * 0.1 }}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/dashboard/user/browse-events")}>
                  <div
                    className="relative h-32 bg-cover bg-center group"
                    style={{
                      backgroundImage: `url('${event.image || heroImage}')`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition"></div>
                    {event.price && <Badge className="absolute top-2 right-2 z-10 bg-primary">{event.price}</Badge>}
                  </div>
                  <CardContent className="pt-4">
                    <h3 className="font-semibold text-foreground mb-1">{event.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{new Date(event.date).toDateString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;

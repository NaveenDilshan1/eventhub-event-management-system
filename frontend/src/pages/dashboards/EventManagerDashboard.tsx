import { motion } from "framer-motion";
import {
  Calendar,
  Ticket,
  Users,
  DollarSign,
  Plus,
  Eye,
  Edit,
  Clock,
  MapPin,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero-event.jpg";

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  ticketsSold: number;
  totalTickets: number;
  revenue: string;
  status: "upcoming" | "ongoing" | "completed";
  image: string;
}

const events: Event[] = [
  {
    id: "1",
    name: "Tech Summit 2025",
    date: "March 15, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "San Francisco Convention Center",
    ticketsSold: 1850,
    totalTickets: 2500,
    revenue: "$55,500",
    status: "upcoming",
    image: heroImage,
  },
  {
    id: "2",
    name: "Startup Pitch Night",
    date: "March 20, 2025",
    time: "6:00 PM - 10:00 PM",
    location: "Innovation Hub, NYC",
    ticketsSold: 287,
    totalTickets: 350,
    revenue: "$14,063",
    status: "upcoming",
    image: heroImage,
  },
  {
    id: "3",
    name: "Design Workshop",
    date: "March 25, 2025",
    time: "10:00 AM - 4:00 PM",
    location: "Creative Space, London",
    ticketsSold: 45,
    totalTickets: 80,
    revenue: "$6,705",
    status: "upcoming",
    image: heroImage,
  },
  {
    id: "4",
    name: "Developer Conference",
    date: "March 10, 2025",
    time: "8:00 AM - 5:00 PM",
    location: "Tech Hub, Austin",
    ticketsSold: 500,
    totalTickets: 500,
    revenue: "$75,000",
    status: "completed",
    image: heroImage,
  },
];

const statusColors = {
  upcoming: "bg-blue-100 text-blue-700",
  ongoing: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
};

const EventManagerDashboard = () => {
  return (
    <DashboardLayout >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Event Manager
            </h1>
            <p className="text-muted-foreground">
              Create and manage your events
            </p>
          </div>
          <Button variant="hero">
            <Plus className="h-4 w-4" />
            Create New Event
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="My Events"
            value="8"
            change={2}
            icon={Calendar}
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <StatsCard
            title="Total Tickets Sold"
            value="2,682"
            change={15}
            icon={Ticket}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
          <StatsCard
            title="Total Attendees"
            value="2,450"
            change={12}
            icon={Users}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          <StatsCard
            title="Revenue Generated"
            value="$151,268"
            change={28}
            icon={DollarSign}
            iconColor="text-amber-600"
            iconBg="bg-amber-100"
          />
        </div>

        {/* Events Grid */}
        <div>
          <h2 className="font-display font-semibold text-xl text-foreground mb-4">
            Your Events
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-40">
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <Badge className={`absolute top-4 left-4 ${statusColors[event.status]}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </Badge>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-display font-bold text-xl text-white mb-1">
                      {event.name}
                    </h3>
                  </div>
                </div>

                <div className="p-5">
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Tickets Sold</p>
                      <p className="font-semibold text-foreground">
                        {event.ticketsSold}/{event.totalTickets}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="font-semibold text-foreground">{event.revenue}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Capacity</span>
                      <span>{Math.round((event.ticketsSold / event.totalTickets) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(event.ticketsSold / event.totalTickets) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    <Button variant="default" size="sm" className="flex-1">
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Revenue Chart */}
        <RevenueChart title="Event Revenue Trend" />
      </div>
    </DashboardLayout>
  );
};

export default EventManagerDashboard;

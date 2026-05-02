// src/pages/dashboards/staff/StaffDashboardMain.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, TrendingUp, QrCode, Bot, Calendar, MapPin, Clock } from "lucide-react";
import API from "@/services/api";

// Dashboard tools
const dashboardItems = [
  { label: "Events", icon: Calendar, route: "/dashboard/staff/events", description: "Manage all events and details." },
  { label: "Check-In", icon: Users, route: "/dashboard/staff/checkin", description: "Manage attendee check-ins." },
  { label: "Live Stats", icon: TrendingUp, route: "/dashboard/staff/live-stats", description: "View event statistics." },
  { label: "QR Scanner", icon: QrCode, route: "/dashboard/staff/qr-scanner", description: "Scan tickets quickly." },
];

interface AssignedEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  checkedIn: number;
  total: number;
  status: "ongoing" | "upcoming";
}

const StaffDashboardMain = () => {
  const navigate = useNavigate();
  const [assignedEvents, setAssignedEvents] = useState<AssignedEvent[]>([]);

  // Fetch assigned events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await API.get("/staff/events");
        setAssignedEvents(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load assigned events");
      }
    };
    fetchEvents();
  }, []);

  return (
    <DashboardLayout>
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Access your tools below and view assigned events.
        </p>
      </motion.div>

      {/* Dashboard tools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {dashboardItems.map((item) => (
          <Card key={item.label} className="hover:shadow-lg transition cursor-pointer">
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <item.icon className="w-6 h-6 text-primary" />
                {item.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <Button className="mt-4 w-full" onClick={() => navigate(item.route)}>Go</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assigned Events */}
      <h2 className="text-2xl font-bold mt-10 mb-4">Assigned Events</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignedEvents.length > 0 ? (
          assignedEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all group">
              <div className={`h-2 w-full ${event.status === "ongoing" ? "bg-green-500" : "bg-primary"}`} />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-2">
                  <Badge
                    variant="secondary"
                    className={event.status === "ongoing" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-primary/10 text-primary hover:bg-primary/10"}
                  >
                    {event.status.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">{event.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Attendance Progress</span>
                    <span className="text-xs font-bold">{event.checkedIn} / {event.total}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (event.checkedIn / event.total) * 100) || 0}%` }}
                    />
                  </div>
                </div>

                <Button
                  className="w-full mt-2 gap-2"
                  onClick={() => navigate(`/dashboard/staff/events/${event.id}/attendees`)}
                >
                  <Users className="h-4 w-4" /> Manage Attendees
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground col-span-full">No assigned events yet.</p>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboardMain;

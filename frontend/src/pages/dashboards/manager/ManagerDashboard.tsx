// src/pages/dashboards/manager/ManagerDashboard.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

import { Calendar, Ticket, Users, DollarSign, Plus, Eye, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import API from "@/services/api";
import { useCurrency } from "@/context/CurrencyContext";

// -------------------- TYPES --------------------
interface Stats {
  totalEvents: number;
  ticketsSold: number;
  totalRevenue: number;
  activeUsers: number;
}

interface EventItem {
  id: string;
  _id: string;
  title: string;
  date: string;
  totalTickets: number;
  soldTickets: number;
  price: number;
  status: string;
}

// -------------------- COMPONENT --------------------
const ManagerDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>({
    totalEvents: 0,
    ticketsSold: 0,
    totalRevenue: 0,
    activeUsers: 0,
  });

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, eventsRes] = await Promise.all([
          API.get("/stats/manager"),
          API.get("/events/manager")
        ]);

        setStats(statsRes.data);
        setEvents(eventsRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  // -------------------- STAT CARDS --------------------
  const statCards = [
    {
      title: "My Events",
      value: stats.totalEvents,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      title: "Tickets Sold",
      value: stats.ticketsSold,
      icon: Ticket,
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-100"
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100"
    },
  ];

  // -------------------- RENDER --------------------
  return (
    <DashboardLayout>
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold">Manager Dashboard</h2>
          <p className="text-muted-foreground mt-1">Track your events and performance.</p>
        </div>

        <Button
          onClick={() => navigate("/dashboard/manager/events/create")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" /> Create Event
        </Button>
      </motion.div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {statCards.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value.toString()}
            icon={stat.icon}
            iconColor={stat.color}
            iconBg={stat.bg}
          />
        ))}
      </div>

      {/* REVENUE CHART */}
      <div className="mt-8 lg:mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>
      </div>

      {/* UPCOMING EVENTS */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Latest / Upcoming Events</h3>
        <div className="space-y-3">
          {events.length === 0 && !loading && (
            <p className="text-muted-foreground">No events available.</p>
          )}

          {events.map((event) => (
            <Card key={event._id || event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex justify-between items-center py-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-secondary rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{event.title}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span className="capitalize">{event.status}</span>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Tickets Sold</p>
                    <p className="font-medium">{event.soldTickets} / {event.totalTickets}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="font-medium text-green-600">{formatCurrency(event.soldTickets * event.price)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout >
  );
};

export default ManagerDashboard;

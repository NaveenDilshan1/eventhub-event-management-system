import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  BarChart3,
  TrendingUp,
  Users,
  Ticket,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { toast } from "sonner";
import API from "@/services/api";

interface AnalyticsData {
  totalRevenue: number;
  totalTicketsSold: number;
  totalAttendees: number;
  conversionRate: number;
  revenueData: { month: string; revenue: number; tickets: number }[];
  ticketTypeData: { ticketType: string; value: number }[];
  eventPerformance: { name: string; revenue: number; attendees: number }[];
}

const ticketColors: Record<string, string> = {
  VIP: "#14b8a6",          // teal
  Standard: "#f59e0b",     // amber
  "Early Bird": "#3b82f6", // blue
};

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await API.get("/analytics");
        setAnalytics(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleExport = () => toast.success("Analytics report exported!");

  if (loading) return <p className="text-center mt-10">Loading analytics...</p>;

  // Safe defaults
  const revenueData = analytics?.revenueData ?? [];
  const eventPerformance = analytics?.eventPerformance ?? [];

  // Generate ticket type chart data
  const ticketDataWithNames = analytics?.ticketTypeData.map(t => ({
    name: t.ticketType,
    value: t.value,
    color: ticketColors[t.ticketType] || "#0ea5e9",
  })) ?? [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" />
              Analytics
            </h1>
            <p className="text-muted-foreground mt-1">Track your event performance and insights.</p>
          </div>
          <div className="flex gap-3">
            <Select defaultValue="30">
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">This year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Revenue" value={`₹${(analytics?.totalRevenue ?? 0).toLocaleString("en-IN")}`} icon={DollarSign} />
          <StatsCard title="Tickets Sold" value={(analytics?.totalTicketsSold ?? 0).toLocaleString("en-IN")} icon={Ticket} iconColor="text-green-600" iconBg="bg-green-100" />
          <StatsCard title="Total Attendees" value={(analytics?.totalAttendees ?? 0).toLocaleString("en-IN")} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-100" />
          <StatsCard title="Conversion Rate" value={`${analytics?.conversionRate ?? 0}%`} icon={TrendingUp} iconColor="text-purple-600" iconBg="bg-purple-100" />
        </div>
        {/* Event Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Event Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.eventPerformance ?? []}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--primary))" />
                  <YAxis yAxisId="right" orientation="right" stroke="#0ea5e9" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    formatter={(value: any, name: string) => name.includes("Revenue") ? `₹${Number(value).toLocaleString("en-IN")}` : value}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" name="Revenue (₹)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="attendees" fill="#0ea5e9" name="Attendees" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      {/* Charts Row */}
      <div className="flex justify-center gap-6">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full lg:w-3/4" // makes it smaller than full width on large screens
        >
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: any) => `₹${Number(value).toLocaleString("en-IN")}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>



    </DashboardLayout>
  );
};

export default AnalyticsPage;

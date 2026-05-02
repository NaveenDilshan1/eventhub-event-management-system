// src/pages/dashboards/admin/AdminDashboard.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Ticket, DollarSign, Building2, BarChart3, Sparkles } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { toast } from "sonner";
import API from "@/services/api";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useCurrency } from "@/context/CurrencyContext";

interface Stats {
  totalEvents: number;
  totalTickets: number;
  totalRevenue: number;
  activeUsers: number;
}


interface MonthlyRevenue {
  month: string;
  totalRevenue: number;
}

interface Activity {
  _id: string;
  type: string;
  description: string;
  generatedAt: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Dashboard state
  const [stats, setStats] = useState<Stats>({ totalEvents: 0, totalTickets: 0, totalRevenue: 0, activeUsers: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const { formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Using Promise.all for faster loading
        const [statsRes, revenueRes, activityRes] = await Promise.all([
          API.get("/stats/admin"),
          API.get("/reports/monthly-revenue"),
          API.get("/activity-log")
        ]);

        const statsData = statsRes.data;
        setStats({
          totalEvents: statsData.totalEvents ?? 0,
          totalTickets: statsData.ticketsSold ?? 0,
          totalRevenue: statsData.totalRevenue ?? 0,
          activeUsers: statsData.totalUsers ?? 0,
        });


        setMonthlyRevenue(
          revenueRes.data.map((item: any) => ({
            month: item.month,
            totalRevenue: item.revenue,
          }))
        );

        setRecentActivity(activityRes.data.slice(0, 10).reverse());
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "Total Events",
      value: stats.totalEvents,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      title: "Tickets Sold",
      value: stats.totalTickets,
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

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-muted-foreground mt-1">Welcome back!</p>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => navigate("/dashboard/admin/users")} className="gap-2">
            <Users className="h-4 w-4" /> Manage Users
          </Button>
          <Button onClick={() => navigate("/dashboard/admin/events")} className="gap-2">
            <Calendar className="h-4 w-4" /> Manage Events
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
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

      {/* Charts & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Revenue Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="totalRevenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-80 overflow-y-auto">
              {recentActivity.length === 0 && <p>No recent activity.</p>}
              {recentActivity.map((activity) => (
                <div key={activity._id} className="flex justify-between items-center border-b border-border/30 p-2">
                  <div>
                    <p className="text-sm font-medium">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(activity.generatedAt).toLocaleString()}</p>
                  </div>
                  <div className="text-sm text-primary">{activity.type}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </DashboardLayout>
  );
};

export default AdminDashboard;

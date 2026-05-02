// src/pages/dashboards/staff/LiveStatsPage.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Activity,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import API from "@/services/api";

interface CheckInPoint {
  time: string;
  count: number;
}

interface Zone {
  name: string;
  capacity: number;
  current: number;
}

interface LiveStats {
  totalCapacity: number;
  checkedIn: number;
  perMinute: number;
  checkInTrend: CheckInPoint[];
  zones: Zone[];
}

const LiveStatsPage = () => {
  const [stats, setStats] = useState<LiveStats>({
    totalCapacity: 0,
    checkedIn: 0,
    perMinute: 0,
    checkInTrend: [],
    zones: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/staff/live-stats");
        setStats(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load live stats");
      }
    };

    fetchStats();

    // Optional: auto-refresh every 15 seconds
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const checkInRate = stats.totalCapacity
    ? Math.round((stats.checkedIn / stats.totalCapacity) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              Live Statistics
            </h1>
            <p className="text-muted-foreground mt-1">Real-time attendance tracking for your event.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700">Live</span>
          </div>
        </motion.div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-primary mb-2" />
                <p className="text-4xl font-bold">{stats.checkedIn.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Checked In</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-amber-600 mb-2" />
                <p className="text-4xl font-bold">{(stats.totalCapacity - stats.checkedIn).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Remaining</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
              <CardContent className="pt-6">
                <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                <p className="text-4xl font-bold">{checkInRate}%</p>
                <p className="text-sm text-muted-foreground">Check-in Rate</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
              <CardContent className="pt-6">
                <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
                <div className="flex items-center gap-2">
                  <p className="text-4xl font-bold">{stats.perMinute}</p>
                  <ArrowUp className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">Per Minute</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Check-in Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Check-in Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.checkInTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Zone Capacity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle>Zone Capacity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {stats.zones.map((zone) => {
                const percent = Math.round((zone.current / zone.capacity) * 100);
                return (
                  <div key={zone.name} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{zone.name}</span>
                      <span className="text-muted-foreground">{zone.current}/{zone.capacity} ({percent}%)</span>
                    </div>
                    <Progress value={percent} className={`h-3 ${percent > 85 ? "[&>div]:bg-red-500" : percent > 70 ? "[&>div]:bg-amber-500" : ""}`} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default LiveStatsPage;

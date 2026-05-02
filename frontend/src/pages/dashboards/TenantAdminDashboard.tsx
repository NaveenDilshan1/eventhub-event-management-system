import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Ticket,
  DollarSign,
  UserPlus,
  Plus,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DataTable, StatusBadge, Column } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastActive: string;
}

const users: User[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah@company.com", role: "Event Manager", status: "Active", lastActive: "2 min ago" },
  { id: "2", name: "Mike Peters", email: "mike@company.com", role: "Staff", status: "Active", lastActive: "1 hour ago" },
  { id: "3", name: "Emma Wilson", email: "emma@company.com", role: "Event Manager", status: "Active", lastActive: "3 hours ago" },
  { id: "4", name: "James Brown", email: "james@company.com", role: "Staff", status: "Inactive", lastActive: "2 days ago" },
  { id: "5", name: "Lisa Chen", email: "lisa@company.com", role: "Staff", status: "Active", lastActive: "5 min ago" },
];

const userColumns: Column<User>[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { 
    key: "status", 
    label: "Status",
    render: (item) => <StatusBadge status={item.status} />
  },
  { key: "lastActive", label: "Last Active" },
];

const ticketSalesData = [
  { name: "VIP", value: 1200, color: "hsl(187, 85%, 43%)" },
  { name: "Standard", value: 3500, color: "hsl(200, 85%, 50%)" },
  { name: "Early Bird", value: 800, color: "hsl(25, 95%, 53%)" },
  { name: "Student", value: 500, color: "hsl(142, 71%, 45%)" },
];

const TenantAdminDashboard = () => {
  return (
    <DashboardLayout role="admin" userName="Michael Chen" userEmail="michael@techcorp.com">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Company Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your organization's events and team
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <UserPlus className="h-4 w-4" />
              Invite User
            </Button>
            <Button variant="hero">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Team Members"
            value="24"
            change={4}
            icon={Users}
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <StatsCard
            title="Active Events"
            value="8"
            change={12}
            icon={Calendar}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          <StatsCard
            title="Tickets Sold"
            value="2,847"
            change={18}
            icon={Ticket}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
          <StatsCard
            title="Total Revenue"
            value="$45,230"
            change={25}
            icon={DollarSign}
            iconColor="text-amber-600"
            iconBg="bg-amber-100"
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart title="Revenue Overview" />
          </div>
          
          {/* Ticket Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <h3 className="font-display font-semibold text-lg text-foreground mb-4">
              Ticket Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ticketSalesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ticketSalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions & Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DataTable
              title="Team Members"
              data={users}
              columns={userColumns}
              onView={(item) => console.log("View", item)}
              onEdit={(item) => console.log("Edit", item)}
              onDelete={(item) => console.log("Delete", item)}
            />
          </div>
          <RecentActivity />
        </div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <h3 className="font-display font-semibold text-lg text-foreground mb-6">
            Upcoming Events
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Tech Summit 2025", date: "Mar 15", tickets: 2500, sold: 1850 },
              { name: "Startup Pitch Night", date: "Mar 20", tickets: 350, sold: 287 },
              { name: "Design Workshop", date: "Mar 25", tickets: 80, sold: 45 },
              { name: "Annual Conference", date: "Apr 1", tickets: 500, sold: 123 },
            ].map((event, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
              >
                <h4 className="font-semibold text-foreground mb-1">{event.name}</h4>
                <p className="text-sm text-muted-foreground mb-3">{event.date}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tickets</span>
                    <span className="font-medium text-foreground">{event.sold}/{event.tickets}</span>
                  </div>
                  <div className="h-2 bg-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${(event.sold / event.tickets) * 100}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default TenantAdminDashboard;

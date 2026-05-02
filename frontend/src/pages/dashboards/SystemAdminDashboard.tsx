import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Globe,
  AlertCircle,
  Plus,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { DataTable, StatusBadge, Column } from "@/components/dashboard/DataTable";
import { Button } from "@/components/ui/button";

interface Tenant {
  id: string;
  name: string;
  plan: string;
  users: number;
  events: number;
  status: string;
  revenue: string;
}

const tenants: Tenant[] = [
  { id: "1", name: "TechCorp Inc", plan: "Enterprise", users: 45, events: 12, status: "Active", revenue: "$2,499/mo" },
  { id: "2", name: "Event Masters", plan: "Professional", users: 12, events: 8, status: "Active", revenue: "$99/mo" },
  { id: "3", name: "Conference Pro", plan: "Enterprise", users: 78, events: 25, status: "Active", revenue: "$2,499/mo" },
  { id: "4", name: "StartupHub", plan: "Starter", users: 5, events: 3, status: "Pending", revenue: "$29/mo" },
  { id: "5", name: "Global Events", plan: "Professional", users: 23, events: 15, status: "Active", revenue: "$99/mo" },
];

const columns: Column<Tenant>[] = [
  { key: "name", label: "Company" },
  { key: "plan", label: "Plan" },
  { key: "users", label: "Users" },
  { key: "events", label: "Events" },
  { 
    key: "status", 
    label: "Status",
    render: (item) => <StatusBadge status={item.status} />
  },
  { key: "revenue", label: "Revenue" },
];

const SystemAdminDashboard = () => {
  return (
    <DashboardLayout >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              System Dashboard
            </h1>
            <p className="text-muted-foreground">
              Overview of the entire Event Hub platform
            </p>
          </div>
          <Button variant="hero">
            <Plus className="h-4 w-4" />
            Add Tenant
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Tenants"
            value="156"
            change={12}
            icon={Building2}
            iconColor="text-primary"
            iconBg="bg-primary/10"
          />
          <StatsCard
            title="Total Users"
            value="4,521"
            change={8}
            icon={Users}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />
          <StatsCard
            title="Active Events"
            value="342"
            change={15}
            icon={Calendar}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />
          <StatsCard
            title="Monthly Revenue"
            value="$52,430"
            change={23}
            icon={DollarSign}
            iconColor="text-amber-600"
            iconBg="bg-amber-100"
          />
        </div>

        {/* Charts & Activity */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart title="Platform Revenue" />
          </div>
          <RecentActivity />
        </div>

        {/* Platform Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-foreground">Growth Rate</h3>
            </div>
            <p className="text-3xl font-display font-bold text-foreground mb-1">+23%</p>
            <p className="text-sm text-muted-foreground">Monthly growth</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-100">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-foreground">Countries</h3>
            </div>
            <p className="text-3xl font-display font-bold text-foreground mb-1">48</p>
            <p className="text-sm text-muted-foreground">Active regions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-foreground">Issues</h3>
            </div>
            <p className="text-3xl font-display font-bold text-foreground mb-1">3</p>
            <p className="text-sm text-muted-foreground">Pending support tickets</p>
          </motion.div>
        </div>

        {/* Tenants Table */}
        <DataTable
          title="Recent Tenants"
          data={tenants}
          columns={columns}
          onView={(item) => console.log("View", item)}
          onEdit={(item) => console.log("Edit", item)}
          onDelete={(item) => console.log("Delete", item)}
        />
      </div>
    </DashboardLayout>
  );
};

export default SystemAdminDashboard;

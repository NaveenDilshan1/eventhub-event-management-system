import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/dashboard/DataTable";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  Ticket,
  DollarSign,
  TrendingUp,
  Users,
  Download,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import API from "@/services/api";

// Ticket data interface
interface TicketData {
  id: string;
  _id: string;
  eventId: string;
  eventName?: string;
  title: string;
  price: number;
  quantity: number;
  sold: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface PurchaseData {
  id: string;
  _id: string;
  buyerName: string;
  buyerEmail: string;
  eventId: {
    _id: string;
    title: string;
  };
  ticketTitle: string;
  quantity: number;
  totalAmount: number;
  createdAt: string;
}

const TicketsPage = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [purchases, setPurchases] = useState<PurchaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ticketsRes, purchasesRes] = await Promise.all([
          API.get("/tickets/manager"),
          API.get("/bookings/manager")
        ]);

        setTickets(ticketsRes.data);
        setPurchases(purchasesRes.data.map((p: any) => ({ ...p, id: p._id })));
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch ticket data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTickets = tickets.filter((t) =>
    (t.title || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.eventName || "").toLowerCase().includes(search.toLowerCase())
  );

  // ================================
  // VIEW / EDIT HANDLERS
  // ================================
  const handleView = (ticket: TicketData) => {
    navigate(`/dashboard/manager/tickets/view/${ticket._id}`);
  };

  const handleEdit = (ticket: TicketData) => {
    navigate(`/dashboard/manager/tickets/edit/${ticket._id}`);
  };

  // ================================
  // EXPORT (still dummy)
  // ================================
  const handleExport = () =>
    toast.success("Ticket sales exported successfully!");

  // ================================
  // TABLE COLUMNS
  // ================================
  const columns: Column<TicketData>[] = [
    { key: "eventName", label: "Event Name" },
    { key: "title", label: "Ticket Type" },
    {
      key: "price",
      label: "Price",
      render: (t) => `₹${t.price.toLocaleString("en-IN")}`,
    },
    { key: "quantity", label: "Capacity" },
    { key: "sold", label: "Tickets Sold" },
    {
      key: "revenue",
      label: "Revenue",
      render: (t) => `₹${(t.price * t.sold).toLocaleString("en-IN")}`,
    },
    {
      key: "createdAt",
      label: "Created",
      render: (t) => new Date(t.createdAt).toLocaleDateString(),
    },
  ];

  const purchaseColumns: Column<PurchaseData>[] = [
    { key: "buyerName", label: "Buyer Name" },
    {
      key: "eventName",
      label: "Event",
      render: (p) => p.eventId?.title || "Unknown Event"
    },
    { key: "quantity", label: "Qty" },
    {
      key: "totalAmount",
      label: "Paid",
      render: (p) => `₹${p.totalAmount.toLocaleString("en-IN")}`
    },
    {
      key: "createdAt",
      label: "Date",
      render: (p) => new Date(p.createdAt).toLocaleDateString()
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Ticket className="h-8 w-8 text-primary" /> Ticket Sales
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all your ticket sales.
            </p>
          </div>


        </motion.div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Ticket Types"
            value={tickets.length.toString()}
            icon={Ticket}
          />

          <StatsCard
            title="Total Revenue"
            value={`₹${tickets.reduce(
              (acc, t) => acc + t.price * t.sold,
              0
            ).toLocaleString("en-IN")}`}
            icon={DollarSign}
            iconColor="text-green-600"
            iconBg="bg-green-100"
          />

          <StatsCard
            title="Avg. Ticket Price"
            value={`₹${Math.round(
              tickets.reduce((acc, t) => acc + t.price, 0) /
              (tickets.length || 1)
            ).toLocaleString("en-IN")}`}
            icon={TrendingUp}
            iconColor="text-blue-600"
            iconBg="bg-blue-100"
          />

          <StatsCard
            title="Total Tickets Sold"
            value={`${tickets.reduce(
              (acc, t) => acc + t.sold,
              0
            ).toLocaleString("en-IN")}`}
            icon={Users}
            iconColor="text-purple-600"
            iconBg="bg-purple-100"
          />
        </div>

        {/* SEARCH */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ticket name..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* TABLES */}
        <div className="grid grid-cols-1 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <DataTable
              title="Ticket Sales Summary"
              data={filteredTickets}
              columns={columns}
              onView={handleView}
              onEdit={handleEdit}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DataTable
              title="Ticket Purchases (Buyer Details)"
              data={purchases}
              columns={purchaseColumns}
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TicketsPage;

// src/pages/dashboards/user/PaymentsPage.tsx

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, StatusBadge, Column } from "@/components/dashboard/DataTable";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { CreditCard, Plus, IndianRupee, History, Wallet, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import axios from "axios";
import { useRole } from "@/context/RoleContext";

/* ================= TYPES ================= */

interface Payment {
  id: string;
  date: string;
  event: string;
  amount: number;
  method: string;
  status: string;
  buyerName?: string;
  customTicketId?: string;
  ticketType?: string;
  quantity?: number;
}

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;

  cardHolderName: string;
  isDefault: boolean;
}

interface NewPaymentMethodForm {
  brand: string;
  last4: string;

  expMonth: string;
  expYear: string;

  cardHolderName: string;
  isDefault: boolean;
}

/* ================= COMPONENT ================= */

const PaymentsPage = () => {
  const { userId } = useRole();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);

  const [newCard, setNewCard] = useState<NewPaymentMethodForm>({
    brand: "Visa",
    last4: "",
    expMonth: "",
    expYear: "",
    cardHolderName: "",
    isDefault: false,
  });

  /* ================= FETCH DATA ================= */

  useEffect(() => {
    if (!userId) return;

    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return toast.error("You must be logged in");

        const [resPayments, resMethods] = await Promise.all([
          axios.get(`http://localhost:5000/api/payments/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5000/api/payments/methods/my`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const mappedPayments: Payment[] = resPayments.data.map((p: any) => ({
          id: p._id,
          date: new Date(p.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          event: p.eventName, // <--- Using the mapped eventName from backend
          amount: p.amount,
          method: p.method,
          status: p.status,
          buyerName: p.buyerName,
          customTicketId: p.customTicketId,
          ticketType: p.ticketType,
          quantity: p.quantity,
        }));

        setPayments(mappedPayments);
        setMethods(resMethods.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [userId]);

  /* ================= STATS ================= */

  const totalSpent = payments.reduce(
    (acc, p) => acc + (p.status === "Refunded" ? 0 : p.amount),
    0
  );

  const totalRefunded = payments.reduce(
    (acc, p) => acc + (p.status === "Refunded" ? p.amount : 0),
    0
  );

  /* ================= TABLE ================= */

  const columns: Column<Payment>[] = [
    {
      key: "id",
      label: "Transaction ID",
      render: item => (
        <span className="font-mono text-[10px] text-muted-foreground">
          {item.id}
        </span>
      )
    },
    { key: "date", label: "Date" },
    { key: "event", label: "Event" },
    { key: "buyerName", label: "Attendee" },
    {
      key: "ticketType",
      label: "Ticket Info",
      render: item => (
        <div className="flex flex-col gap-1">
          <Badge variant="outline" className="text-[10px] uppercase font-bold w-fit">
            {item.ticketType || "Standard"} x{item.quantity || 1}
          </Badge>
          <span className="font-mono text-[9px] text-muted-foreground bg-secondary px-1 py-0.5 rounded w-fit">
            ID: {item.customTicketId || "N/A"}
          </span>
        </div>
      )
    },
    {
      key: "amount",
      label: "Amount",
      render: item => <span className="font-semibold text-foreground">₹{item.amount.toLocaleString()}</span>,
    },
    {
      key: "method",
      label: "Method",
      render: item => (
        <div className="flex items-center gap-1.5 text-xs">
          <CreditCard className="h-3.5 w-3.5 text-primary" />
          {item.method}
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      render: item => <StatusBadge status={item.status} />,
    },
  ];

  /* ================= SAVE CARD ================= */

  const handleSavePaymentMethod = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Please login again");

      // Basic validation
      if (!newCard.last4 || newCard.last4.length !== 4) {
        return toast.error("Please enter last 4 digits of the card");
      }
      if (!newCard.expMonth || !newCard.expYear || !newCard.cardHolderName) {
        return toast.error("Please fill in all card details");
      }

      const payload = {
        brand: newCard.brand,
        last4: newCard.last4,
        expMonth: parseInt(newCard.expMonth),
        expYear: parseInt(newCard.expYear),
        cardHolderName: newCard.cardHolderName,
        isDefault: newCard.isDefault,
      };

      await axios.post(
        `http://localhost:5000/api/payments/methods/my`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Payment method added successfully! 💳");
      setShowAddModal(false);

      // Reset form
      setNewCard({
        brand: "Visa",
        last4: "",
        expMonth: "",
        expYear: "",
        cardHolderName: "",
        isDefault: false,
      });

      // reload cards
      const res = await axios.get(
        `http://localhost:5000/api/payments/methods/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMethods(res.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to save card");
    }
  };

  const handleDeleteMethod = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/payments/methods/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Card removed");
      setMethods(methods.filter(m => m.id !== id));
    } catch (err) {
      toast.error("Failed to delete card");
    }
  };


  /* ================= UI ================= */

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-foreground whitespace-nowrap">
              <CreditCard className="h-8 w-8 text-primary" />
              Payments
            </h1>
            <p className="text-muted-foreground">
              Track your transactions and manage your saved cards.
            </p>
          </div>

          <Button className="gap-2 shadow-lg shadow-primary/20" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4" />
            Add Payment Method
          </Button>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Total Spent"
            value={`₹${totalSpent.toLocaleString()}`}
            icon={IndianRupee}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-500"
          />
          <StatsCard
            title="Transactions"
            value={payments.length}
            icon={History}
            iconBg="bg-purple-500/10"
            iconColor="text-purple-500"
          />
          <StatsCard
            title="Refunded"
            value={`₹${totalRefunded.toLocaleString()}`}
            icon={Wallet}
            iconBg="bg-red-500/10"
            iconColor="text-red-500"
          />
        </div>

        {/* Saved Cards Grid */}
        {methods.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methods.map((method) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative p-6 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/10 shadow-xl overflow-hidden group"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-primary/10 transition-colors" />

                <div className="flex justify-between items-start mb-8">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  {method.isDefault && (
                    <Badge className="bg-primary text-primary-foreground border-none">Default</Badge>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="text-white font-mono text-xl tracking-widest uppercase">
                    •••• •••• •••• {method.last4}
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">Card Holder</p>
                      <p className="text-white text-sm font-medium">{method.cardHolderName}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">Expires</p>
                      <p className="text-white text-sm font-medium">
                        {String(method.expMonth).padStart(2, '0')}/{String(method.expYear).slice(-2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delete overlay */}
                <button
                  onClick={() => handleDeleteMethod(method.id)}
                  className="absolute top-2 right-2 p-1.5 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* ADD MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-card p-8 rounded-2xl w-full max-w-md border border-border shadow-2xl relative"
            >
              <h2 className="text-2xl font-bold mb-6 text-foreground text-center">
                Add New Card
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Brand</Label>
                  <select
                    value={newCard.brand}
                    onChange={e => setNewCard({ ...newCard, brand: e.target.value })}
                    className="w-full h-11 bg-secondary/50 border border-border rounded-lg px-3 text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">Amex</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Card Holder Name</Label>
                  <Input
                    placeholder="JAMIE DOHERTY"
                    value={newCard.cardHolderName}
                    onChange={e => setNewCard({ ...newCard, cardHolderName: e.target.value.toUpperCase() })}
                    className="h-11 uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Last 4 Digits</Label>
                  <Input
                    placeholder="4242"
                    maxLength={4}
                    value={newCard.last4}
                    onChange={e => setNewCard({ ...newCard, last4: e.target.value.replace(/\D/g, '') })}
                    className="h-11 font-mono tracking-widest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Exp. Month</Label>
                    <Input
                      type="number"
                      placeholder="MM"
                      min={1}
                      max={12}
                      value={newCard.expMonth}
                      onChange={e => setNewCard({ ...newCard, expMonth: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Exp. Year</Label>
                    <Input
                      type="number"
                      placeholder="YYYY"
                      min={new Date().getFullYear()}
                      value={newCard.expYear}
                      onChange={e => setNewCard({ ...newCard, expYear: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="default-card"
                    checked={newCard.isDefault}
                    onCheckedChange={(checked) => setNewCard({ ...newCard, isDefault: !!checked })}
                  />
                  <Label htmlFor="default-card" className="text-sm cursor-pointer">Set as default payment method</Label>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 h-12 shadow-lg shadow-primary/20" onClick={handleSavePaymentMethod}>
                  Save Card
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* PAYMENT TABLE */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <DataTable<Payment>
            title="Transactions Payment History"
            data={payments}
            columns={columns}
          />
        </motion.div>
      </div>
    </DashboardLayout >
  );
};

export default PaymentsPage;

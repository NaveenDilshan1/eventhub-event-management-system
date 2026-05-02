// src/pages/dashboards/admin/BillingPage.tsx
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CreditCard, ArrowUpRight, Receipt, CheckCircle2, Package, History, ExternalLink, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import API from "@/services/api";
import { toast } from "sonner";
import { useRole } from "@/context/RoleContext";
import { useCurrency } from "@/context/CurrencyContext";

interface Plan {
  _id: string;
  plan: string;
  amount: number;
  currency: string;
  billingCycle: string;
  status: "active" | "inactive";
  lastPaymentDate: string;
  nextPaymentDate: string;
}

interface Invoice {
  _id: string;
  plan: string;
  amount: number;
  currency: string;
  date: string;
  status: "paid" | "overdue" | "pending";
}

const BillingPage = () => {
  const { organization } = useRole();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [plansRes, invoicesRes] = await Promise.all([
          API.get("/billing/plans"),
          API.get("/invoices")
        ]);
        setPlans(plansRes.data);
        setInvoices(invoicesRes.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load billing information");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { formatCurrency } = useCurrency();

  // Find active plan or fallback to defaults
  const activePlan = plans.find(p => p.status === "active") || {
    plan: "Free Starter",
    amount: 0,
    nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    billingCycle: "month"
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) return toast.error("No invoices to export");
    const headers = ["Invoice ID,Date,Plan,Amount,Currency,Status\n"];
    const rows = invoices.map(inv =>
      `INV-${inv._id.slice(-6)},${new Date(inv.date).toLocaleDateString()},${inv.plan},${inv.amount},${inv.currency},${inv.status}`
    ).join("\n");

    const blob = new Blob([...headers, rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Billing history exported as CSV");
  };

  const handleUpgradePlan = async (planId: string, planName: string) => {
    try {
      toast.info(`Upgrading to ${planName}...`);
      await API.put(`/billing/upgrade/${planId}`);

      // Refresh data
      const [plansRes, invoicesRes] = await Promise.all([
        API.get("/billing/plans"),
        API.get("/invoices")
      ]);
      setPlans(plansRes.data);
      setInvoices(invoicesRes.data);
      toast.success(`Successfully upgraded to ${planName}`);
    } catch (err) {
      toast.error("Failed to upgrade plan");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "paid":
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Paid</Badge>;
      case "overdue":
        return <Badge className="bg-rose-100 text-rose-700 border-rose-200">Overdue</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 p-1">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              Billing & Subscription
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage {organization}'s subscription tier, payment methods, and invoice history.
            </p>
          </motion.div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl gap-2 h-12 px-6">
              <ShieldCheck className="h-5 w-5" /> Security
            </Button>
          </div>
        </div>

        {/* Current Plan Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border-none shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <Package className="h-32 w-32" />
            </div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">Current Active Plan</CardTitle>
                  <CardDescription className="text-lg">You are currently on the {activePlan.plan} plan</CardDescription>
                </div>
                <Badge className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-bold animate-pulse">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Next Billing Date</p>
                  <p className="text-xl font-bold mt-1 text-primary">
                    {new Date(activePlan.nextPaymentDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Plan Amount</p>
                  <p className="text-xl font-bold mt-1">{formatCurrency(activePlan.amount)} / {activePlan.billingCycle}</p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Payment Method</p>
                  <p className="text-xl font-bold mt-1 flex items-center gap-2">•••• 4242 <span className="text-xs px-2 py-0.5 bg-background rounded-md border">VISA</span></p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-primary/5 border-t border-primary/10 mt-4 py-4">
              <Button
                className="rounded-xl gap-2 shadow-lg shadow-primary/20"
                onClick={() => document.getElementById('available-plans')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <ArrowUpRight className="h-5 w-5" /> Change My Plan
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-none shadow-xl rounded-3xl p-6 flex flex-col justify-center items-center text-center bg-card">
            <div className="h-16 w-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Receipt className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold">Download Reports</h3>
            <p className="text-muted-foreground mt-2 mb-6 px-4">Get a detailed breakdown of your usage for financial auditing.</p>
            <Button
              variant="secondary"
              className="w-full rounded-xl h-11"
              onClick={() => toast.success("Tax statement generation started. You will be notified when ready.")}
            >
              Generate Tax Statement
            </Button>
          </Card>
        </div>

        {/* Subscription Tiers */}
        <h2 id="available-plans" className="text-2xl font-bold mt-12 mb-6">Available Subscription Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan._id} className={`rounded-3xl border-2 transition-all hover:shadow-2xl ${plan.status === "active" ? "border-primary ring-4 ring-primary/5" : "border-border/50"}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-muted rounded-xl">
                    <Package className={`h-6 w-6 ${plan.status === "active" ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  {plan.status === "active" && <Badge variant="secondary" className="rounded-full">Selected</Badge>}
                </div>
                <CardTitle className="text-2xl font-bold mt-4">{plan.plan}</CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-3xl font-extrabold tracking-tight">{formatCurrency(plan.amount)}</span>
                  <span className="text-muted-foreground font-medium">/{plan.billingCycle}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium">All Events & Ticketing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium">Full Analytics Suite</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="text-sm font-medium">Priority Support</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.status === "active" ? "outline" : "default"}
                  className="w-full rounded-xl h-12 shadow-sm transition-all hover:scale-[1.02]"
                  disabled={plan.status === "active"}
                  onClick={() => handleUpgradePlan(plan._id, plan.plan)}
                >
                  {plan.status === "active" ? "Current Tier" : `Upgrade to ${plan.plan}`}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Payment History Table */}
        <Card className="border-none shadow-xl rounded-3xl overflow-hidden mt-12 bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-muted/10 border-b pb-6 px-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <History className="h-5 w-5 text-primary" /> Invoice History
                </CardTitle>
                <CardDescription>View and download your past subscription receipts</CardDescription>
              </div>
              <Button variant="ghost" className="rounded-xl gap-2 font-semibold hover:bg-primary/10" onClick={handleExportCSV}>
                Export CSV <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-8 py-4 font-bold text-foreground">Invoice ID</TableHead>
                  <TableHead className="font-bold text-foreground">Billing Period</TableHead>
                  <TableHead className="font-bold text-foreground">Tier Plan</TableHead>
                  <TableHead className="font-bold text-foreground">Amount</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="text-right px-8 font-bold text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="h-16 animate-pulse text-muted-foreground text-center">Loading transaction records...</TableCell>
                    </TableRow>
                  ))
                ) : invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center text-muted-foreground font-medium uppercase tracking-widest text-xs opacity-50">
                      No Billing History Available
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => (
                    <TableRow key={invoice._id} className="group hover:bg-primary/[0.02] transition-colors">
                      <TableCell className="px-8 font-mono text-sm uppercase">INV-{invoice._id.slice(-6)}</TableCell>
                      <TableCell className="font-medium">{new Date(invoice.date).toLocaleDateString("en-US", { month: 'long', year: 'numeric' })}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-lg">{invoice.plan}</Badge>
                      </TableCell>
                      <TableCell className="font-bold">{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        {getStatusBadge(invoice.status)}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button variant="ghost" size="sm" className="rounded-lg font-bold text-primary hover:text-primary hover:bg-primary/10">
                          View PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BillingPage;

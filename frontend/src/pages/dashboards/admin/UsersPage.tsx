// src/pages/dashboards/admin/UsersPage.tsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Users, UserPlus, Search, Filter, MoreVertical, Shield, UserX, Trash2, CheckCircle2, XCircle, Clock, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import API from "@/services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff" | "user";
  status: "active" | "suspended" | "pending";
  organization: string;
  joinedAt: string;
}

const roleConfig = {
  admin: { label: "Admin", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  manager: { label: "Manager", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  staff: { label: "Staff", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  user: { label: "Member", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
};

const statusConfig = {
  active: { label: "Active", icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" },
  suspended: { label: "Suspended", icon: XCircle, color: "text-red-500 bg-red-50" },
  pending: { label: "Pending", icon: Clock, color: "text-amber-500 bg-amber-50" },
};

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", role: "staff", organization: "HubPro" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/masterusers");
      const mappedUsers = res.data.map((u: any) => ({
        id: u._id,
        name: `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.name || "No Name",
        email: u.email || "No Email",
        role: u.role || "user",
        status: u.status || "active",
        organization: u.organization || "General",
        joinedAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Unknown",
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.firstName || !newUser.email) {
      toast.error("Required fields are missing");
      return;
    }

    try {
      await API.post("/masterusers", {
        ...newUser,
        password: "password123", // Secure default
      });
      toast.success("User created successfully");
      setIsCreateOpen(false);
      setNewUser({ firstName: "", lastName: "", email: "", role: "staff", organization: "HubPro" });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await API.patch(`/masterusers/${userId}/role`, { role: newRole });
      toast.success(`User promoted to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user role");
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      await API.patch(`/masterusers/${userId}/status`, { status: newStatus });
      toast.success(`User ${newStatus === "active" ? "activated" : "suspended"}`);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    try {
      await API.delete(`/masterusers/${userId}`);
      toast.success("User deleted");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8 p-1">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Users className="h-8 w-8 text-primary" />
              </div>
              User Management
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Manage permissions, roles, and system access for all members.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-xl px-8 shadow-lg shadow-primary/20 gap-2">
                <UserPlus className="h-5 w-5" /> Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">New User Account</DialogTitle>
                <DialogDescription>Enter user details to grant system access.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">First Name</Label>
                    <Input
                      placeholder="John"
                      className="rounded-xl h-11"
                      value={newUser.firstName}
                      onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Last Name</Label>
                    <Input
                      placeholder="Doe"
                      className="rounded-xl h-11"
                      value={newUser.lastName}
                      onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Email Address</Label>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    className="rounded-xl h-11"
                    value={newUser.email}
                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Access Role</Label>
                  <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v })}>
                    <SelectTrigger className="rounded-xl h-11">
                      <SelectValue placeholder="Select user role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="user">Member (Viewer)</SelectItem>
                      <SelectItem value="staff">Staff (Event Support)</SelectItem>
                      <SelectItem value="manager">Manager (Event Organizer)</SelectItem>
                      <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Organization</Label>
                  <Input
                    placeholder="Organization or Company Name"
                    className="rounded-xl h-11"
                    value={newUser.organization}
                    onChange={e => setNewUser({ ...newUser, organization: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateUser} className="rounded-xl px-6">Create Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters & Search Table Card */}
        <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
              <div className="relative flex-1 max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Search by name, email or org..."
                  className="pl-10 h-12 bg-background/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/50 shadow-inner"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-[180px] h-12 border-none bg-background/50 rounded-2xl shadow-inner font-medium">
                    <SelectValue placeholder="Role Filter" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="all">All Access levels</SelectItem>
                    <SelectItem value="admin">Administrators</SelectItem>
                    <SelectItem value="manager">Managers</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px] font-bold text-foreground">User Identity</TableHead>
                    <TableHead className="font-bold text-foreground text-center">Security Role</TableHead>
                    <TableHead className="font-bold text-foreground">Organization</TableHead>
                    <TableHead className="font-bold text-foreground">Account Status</TableHead>
                    <TableHead className="font-bold text-foreground">Registration</TableHead>
                    <TableHead className="text-right font-bold text-foreground pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6} className="h-16 text-center animate-pulse text-muted-foreground">Loading identity records...</TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-64 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users className="h-12 w-12 text-muted/30" />
                          <p className="text-muted-foreground font-medium text-lg">No Users Found</p>
                          <p className="text-sm text-muted-foreground/60">Try adjusting your search or filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="group transition-colors hover:bg-primary/[0.02]">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-base group-hover:text-primary transition-colors">{user.name}</span>
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={`rounded-xl px-3 py-1 font-semibold ${roleConfig[user.role as keyof typeof roleConfig]?.color}`}>
                            {roleConfig[user.role as keyof typeof roleConfig]?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-muted-foreground italic">
                          {user.organization}
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ring-1 ring-inset ring-current/10 ${statusConfig[user.status as keyof typeof statusConfig]?.color}`}>
                            <div className="h-1.5 w-1.5 rounded-full bg-current" />
                            {statusConfig[user.status as keyof typeof statusConfig]?.label}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm font-medium">
                          {user.joinedAt}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full hover:bg-muted group">
                                <MoreVertical className="h-5 w-5 text-muted-foreground transition-transform group-hover:scale-110" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[200px] rounded-2xl shadow-xl p-2 border-border/50">
                              <DropdownMenuLabel className="px-3 pt-2 text-xs font-bold text-muted-foreground uppercase opacity-60">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="my-2" />

                              <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer gap-2" onClick={() => handleToggleStatus(user.id, user.status)}>
                                {user.status === "suspended" ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <UserX className="h-4 w-4 text-amber-500" />}
                                {user.status === "suspended" ? "Reactivate User" : "Suspend Access"}
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="my-2" />
                              <DropdownMenuLabel className="px-3 text-xs font-bold text-muted-foreground uppercase opacity-60">Manage permissions</DropdownMenuLabel>

                              <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer gap-2" onClick={() => handleUpdateRole(user.id, "admin")}>
                                <Shield className="h-4 w-4 text-red-500" /> Set as Admin
                              </DropdownMenuItem>

                              <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer gap-2" onClick={() => handleUpdateRole(user.id, "manager")}>
                                <Shield className="h-4 w-4 text-blue-500" /> Set as Manager
                              </DropdownMenuItem>

                              <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer gap-2" onClick={() => handleUpdateRole(user.id, "staff")}>
                                <Activity className="h-4 w-4 text-emerald-500" /> Set as Staff
                              </DropdownMenuItem>

                              <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer gap-2" onClick={() => handleUpdateRole(user.id, "user")}>
                                <Users className="h-4 w-4 text-slate-500" /> Set as Regular Member
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="my-2" />
                              <DropdownMenuItem
                                className="rounded-xl px-3 py-2 cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" /> Delete Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UsersPage;

import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "@/services/api";
import {
  Users,
  Calendar,
  Ticket,
  DollarSign,
  Bot,
  Plus,
  Palette,
  TrendingUp,
  Settings,
  LogOut,
  QrCode,
  Clock,
  User as UserIcon,
  Bell,
} from "lucide-react";
import { useRole } from "@/context/RoleContext";
import { useTenant } from "@/context/TenantContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrency } from "@/context/CurrencyContext";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { role, userName, userEmail, userAvatar } = useRole();
  const { campusName } = useTenant();
  const { websiteName, websiteLogo, getFullImageUrl } = useCurrency();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (role === "user") {
      const fetchUnread = async () => {
        try {
          const res = await API.get("/notifications");
          const unread = res.data.filter((n: any) => !n.isRead).length;
          setUnreadCount(unread);
        } catch (err) {
          console.error("Failed to fetch unread notifications", err);
        }
      };
      fetchUnread();
    }
  }, [role]);

  // Redirect if not logged in
  if (!role) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // Sidebar links based on role
  const links =
    role === "admin"
      ? [
        { label: "Dashboard", to: "/dashboard/admin", icon: Calendar },
        { label: "Users", to: "/dashboard/admin/users", icon: Users },
        { label: "Events", to: "/dashboard/admin/events", icon: Calendar },
        { label: "Reports", to: "/dashboard/admin/reports", icon: TrendingUp },
        { label: "Billing", to: "/dashboard/admin/billing", icon: DollarSign },
        { label: "Settings", to: "/dashboard/admin/settings", icon: Settings },
        { label: "AI Assistant", to: "/dashboard/admin/ai", icon: Bot },
      ]
      : role === "manager"
        ? [
          { label: "Dashboard", to: "/dashboard/manager", icon: Calendar },
          { label: "My Events", to: "/dashboard/manager/events", icon: Calendar },
          { label: "Create Event", to: "/dashboard/manager/events/create", icon: Plus },
          { label: "Attendees", to: "/dashboard/manager/attendees", icon: Users },
          { label: "Tickets", to: "/dashboard/manager/tickets", icon: Ticket },
          { label: "Analytics", to: "/dashboard/manager/analytics", icon: TrendingUp },
        ]
        : role === "staff"
          ? [
            { label: "Dashboard", to: "/dashboard/staff", icon: Calendar },
            { label: "Events", to: "/dashboard/staff/events", icon: Calendar },
            { label: "Create Event", to: "/dashboard/staff/events/create", icon: Plus },
            { label: "Check-In", to: "/dashboard/staff/checkin", icon: Users },
            { label: "Live Stats", to: "/dashboard/staff/live-stats", icon: TrendingUp },
            { label: "QR Scanner", to: "/dashboard/staff/qr-scanner", icon: QrCode },
            { label: "Support", to: "/dashboard/staff/support", icon: Bot },
          ]
          : role === "user"
            ? [
              { label: "Dashboard", to: "/dashboard/user", icon: Calendar },
              { label: "Browse Events", to: "/dashboard/user/browse-events", icon: Calendar },
              { label: "My Tickets", to: "/dashboard/user/my-tickets", icon: Ticket },
              { label: "Payments", to: "/dashboard/user/payments", icon: DollarSign },
              { label: "Profile", to: "/dashboard/user/profile", icon: UserIcon },
              { label: "Notifications", to: "/dashboard/user/notifications", icon: Bell },
            ]
            : [];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col">
        <div className="p-4 flex flex-col items-center gap-2 border-b border-primary/30">
          {websiteLogo && (
            <img src={getFullImageUrl(websiteLogo)} alt="Logo" className="h-10 w-auto object-contain" />
          )}
          <span className="font-bold text-lg tracking-tight">
            {websiteName}
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {links.map(link => (
            <Link
              key={link.label}
              to={link.to}
              className="flex items-center justify-between p-2 rounded-md hover:bg-primary/20 transition group"
            >
              <div className="flex items-center gap-3">
                <link.icon className="h-5 w-5" />
                {link.label}
              </div>
              {link.label === "Notifications" && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-primary/30 text-sm space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-primary-foreground/20">
              <AvatarImage src={userAvatar || ""} className="object-cover" />
              <AvatarFallback className="bg-primary-foreground/10 text-xs">
                {userName?.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-medium truncate">{userName}</p>
              <p className="text-xs opacity-80 truncate">{userEmail}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm w-full p-2 rounded hover:bg-red-500/20 transition text-red-200"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {campusName ? `${campusName} Dashboard` : "EventHub Dashboard"}
          </h1>
          <p className="text-muted-foreground capitalize">Role: {role}</p>
        </header>

        {/* Content */}
        {children}

        <footer className="mt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} {campusName || "EventHub"}
        </footer>
      </main>
    </div>
  );
};

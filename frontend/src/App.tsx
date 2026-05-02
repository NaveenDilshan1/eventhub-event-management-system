import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= CONTEXT =================
import { RoleProvider } from "./context/RoleContext";
import { TenantProvider } from "./context/TenantContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";

// ================= AUTH =================
import Login from "./pages/Login";
import Register from "./pages/Register";

// ================= PUBLIC PAGES =================
import Index from "./pages/Index";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";

// ================= ADMIN DASHBOARD =================
import AdminDashboard from "./pages/dashboards/admin/AdminDashboard";
import UsersPage from "./pages/dashboards/admin/UsersPage";
import EventsPage from "./pages/dashboards/admin/EventsPage";
import BillingPage from "./pages/dashboards/admin/BillingPage";
import ReportsPage from "./pages/dashboards/admin/ReportsPage";
import SettingsPage from "./pages/dashboards/admin/SettingsPage";
import AIChatPage from "./pages/dashboards/admin/AIChatPage";

import EventViewPage from "./pages/dashboards/admin/EventViewPage";
import EditEventPage from "./pages/dashboards/admin/EditEventPage";

// ================= MANAGER DASHBOARD =================
import ManagerDashboard from "./pages/dashboards/manager/ManagerDashboard";
import MyEventsPage from "./pages/dashboards/manager/MyEventsPage";
import CreateEventPage from "./pages/dashboards/manager/CreateEventPage";
import EditEventPageManager from "./pages/dashboards/manager/EditEventPage";
import AttendeesPage from "./pages/dashboards/manager/AttendeesPage";
import TicketsPage from "./pages/dashboards/manager/TicketsPage";
import AnalyticsPage from "./pages/dashboards/manager/AnalyticsPage";

// ✅ Ticket View / Edit Pages
import TicketViewPage from "./pages/dashboards/manager/TicketViewPage";
import TicketEditPage from "./pages/dashboards/manager/TicketEditPage";
import EventGalleryPage from "./pages/dashboards/manager/EventGalleryPage";

// ================= STAFF DASHBOARD =================
import StaffDashboard from "./pages/dashboards/staff/StaffDashboardMain";
import CheckInPage from "./pages/dashboards/staff/CheckInPage";
import LiveStatsPage from "./pages/dashboards/staff/LiveStatsPage";
import QRScannerPage from "./pages/dashboards/staff/QRScannerPage";
import SupportPage from "./pages/dashboards/staff/SupportPage";

// ================= USER DASHBOARD =================
import UserDashboard from "./pages/dashboards/user/UserDashboard";
import BrowseEventsPage from "./pages/dashboards/user/BrowseEventsPage";
import UserEventDetailsPage from "./pages/dashboards/user/UserEventDetailsPage";
import MyTicketsPage from "./pages/dashboards/user/MyTicketsPage";
import PaymentsPage from "./pages/dashboards/user/PaymentsPage";
import ProfilePage from "./pages/dashboards/user/ProfilePage";
import NotificationsPage from "./pages/dashboards/user/NotificationsPage";

function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <RoleProvider>
          <TenantProvider>
            <BrowserRouter>
              <Routes>
                {/* ================= PUBLIC ROUTES ================= */}
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />

                {/* ================= AUTH ROUTES ================= */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* ================= ADMIN DASHBOARD ================= */}
                <Route
                  path="/dashboard/admin"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/admin/events"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <EventsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/admin/events/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <EventViewPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/admin/events/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <EditEventPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/admin/billing"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <BillingPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />


                <Route
                  path="/dashboard/admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/admin/ai"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AIChatPage />
                    </ProtectedRoute>
                  }
                />

                {/* ================= MANAGER DASHBOARD ================= */}
                <Route
                  path="/dashboard/manager"
                  element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <ManagerDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/manager/events"
                  element={
                    <ProtectedRoute allowedRoles={["manager", "staff"]}>
                      <MyEventsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/manager/events/create"
                  element={
                    <ProtectedRoute allowedRoles={["manager", "staff"]}>
                      <CreateEventPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/manager/events/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={["manager", "staff"]}>
                      <EditEventPageManager />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/manager/attendees"
                  element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <AttendeesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/manager/tickets"
                  element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <TicketsPage />
                    </ProtectedRoute>
                  }
                />

                {/* ✅ Ticket View */}
                <Route
                  path="/dashboard/manager/tickets/view/:id"
                  element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <TicketViewPage />
                    </ProtectedRoute>
                  }
                />

                {/* ✅ Ticket Edit */}
                <Route
                  path="/dashboard/manager/tickets/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <TicketEditPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/manager/analytics"
                  element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/manager/events/:eventId/gallery"
                  element={
                    <ProtectedRoute allowedRoles={["manager"]}>
                      <EventGalleryPage />
                    </ProtectedRoute>
                  }
                />

                {/* ================= STAFF DASHBOARD ================= */}
                <Route
                  path="/dashboard/staff"
                  element={
                    <ProtectedRoute allowedRoles={["staff"]}>
                      <StaffDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/staff/events"
                  element={
                    <ProtectedRoute allowedRoles={["staff"]}>
                      <MyEventsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/staff/events/create"
                  element={
                    <ProtectedRoute allowedRoles={["staff"]}>
                      <CreateEventPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/staff/events/edit/:id"
                  element={
                    <ProtectedRoute allowedRoles={["staff"]}>
                      <EditEventPageManager />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/staff/checkin"
                  element={
                    <ProtectedRoute allowedRoles={["staff"]}>
                      <CheckInPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/staff/events/:eventId/attendees"
                  element={
                    <ProtectedRoute allowedRoles={["staff"]}>
                      <CheckInPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/staff/live-stats"
                  element={
                    <ProtectedRoute allowedRoles={["staff"]}>
                      <LiveStatsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/staff/qr-scanner"
                  element={
                    <ProtectedRoute allowedRoles={["staff"]}>
                      <QRScannerPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/staff/support"
                  element={
                    <ProtectedRoute allowedRoles={["staff"]}>
                      <SupportPage />
                    </ProtectedRoute>
                  }
                />

                {/* ================= USER DASHBOARD ================= */}
                <Route
                  path="/dashboard/user"
                  element={
                    <ProtectedRoute allowedRoles={["user"]}>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/user/browse-events"
                  element={
                    <ProtectedRoute allowedRoles={["user"]}>
                      <BrowseEventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/user/events/:id"
                  element={
                    <ProtectedRoute allowedRoles={["user"]}>
                      <UserEventDetailsPage />
                    </ProtectedRoute>
                  }
                />


                <Route
                  path="/dashboard/user/my-tickets"
                  element={
                    <ProtectedRoute allowedRoles={["user"]}>
                      <MyTicketsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/user/payments"
                  element={
                    <ProtectedRoute allowedRoles={["user"]}>
                      <PaymentsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/user/profile"
                  element={
                    <ProtectedRoute allowedRoles={["user"]}>
                      <ProfilePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/dashboard/user/notifications"
                  element={
                    <ProtectedRoute allowedRoles={["user"]}>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* ================= FALLBACK ================= */}
                <Route path="*" element={<Index />} />
              </Routes>
            </BrowserRouter>
          </TenantProvider>
        </RoleProvider>

        <Toaster />
        <SonnerToaster position="top-right" richColors closeButton />
      </CurrencyProvider>
    </ThemeProvider>
  );
}

export default App;

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle, Trash2, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import API from "@/services/api";

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    isRead: boolean;
    createdAt: string;
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await API.get("/notifications");
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markRead = async (id: string) => {
        try {
            await API.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            toast.error("Failed to mark as read");
        }
    };

    const markAllRead = async () => {
        try {
            await API.put("/notifications/read-all");
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success("All notifications marked as read");
        } catch (err) {
            toast.error("Failed to mark all as read");
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "success": return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case "error": return <Trash2 className="h-5 w-5 text-red-500" />;
            default: return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    return (
        <DashboardLayout>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Bell className="h-6 w-6" /> Notifications
                </h2>
                {notifications.some(n => !n.isRead) && (
                    <Button variant="outline" size="sm" onClick={markAllRead}>
                        Mark all as read
                    </Button>
                )}
            </div>

            {loading ? (
                <p>Loading notifications...</p>
            ) : notifications.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        No notifications yet.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <Card key={n._id} className={`${!n.isRead ? "border-l-4 border-l-primary bg-primary/5" : ""}`}>
                            <CardContent className="p-4 flex gap-4 items-start">
                                <div className="mt-1">
                                    {getTypeIcon(n.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`font-semibold ${!n.isRead ? "text-primary" : ""}`}>{n.title}</h3>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm mt-1 text-muted-foreground">{n.message}</p>
                                </div>
                                {!n.isRead && (
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => markRead(n._id)}>
                                        <CheckCircle className="h-4 w-4" />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
};

export default NotificationsPage;

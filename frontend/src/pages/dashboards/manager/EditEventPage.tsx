// src/pages/dashboards/manager/EditEventPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, FormEvent } from "react";
// import axios from "axios"; // Removed direct axios
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { useRole } from "@/context/RoleContext";
import API from "@/services/api";

interface EventType {
    _id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    imageUrl?: string;
    category?: string;
    totalTickets?: number;
    price?: number;
    status?: string;
}

const EditEventPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { role } = useRole();
    const [event, setEvent] = useState<EventType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const dashPath = role === "staff" ? "staff" : "manager";
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await API.get(`/events/${id}`);
                const data = res.data;

                // Format date for input field (YYYY-MM-DD)
                let formattedDate = data.date;
                if (formattedDate && formattedDate.includes('T')) {
                    formattedDate = formattedDate.split('T')[0];
                }

                setEvent({
                    ...data,
                    date: formattedDate || data.date
                });

                // Handle imageUrl properly
                const fullImageUrl = data.imageUrl
                    ? (data.imageUrl.startsWith('http')
                        ? data.imageUrl
                        : `${API.defaults.baseURL?.replace('/api', '')}${data.imageUrl}`)
                    : "";
                setImagePreview(fullImageUrl);
            } catch (err: any) {
                console.error(err);
                toast.error(err.response?.data?.message || "Event not found");
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        const originalImageUrl = event?.imageUrl
            ? (event.imageUrl.startsWith('http')
                ? event.imageUrl
                : `${API.defaults.baseURL?.replace('/api', '')}${event.imageUrl}`)
            : "";
        setImagePreview(originalImageUrl);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        console.log("Submitting event update...", event);
        if (!event) return;

        // Simple validation
        if (!event.title || !event.description || !event.date || !event.time || !event.location) {
            return toast.error("Please fill all fields");
        }

        try {
            setSaving(true);
            const body = {
                title: event.title,
                description: event.description,
                date: event.date,
                time: event.time,
                location: event.location,
                category: event.category || "",
                totalTickets: Number(event.totalTickets) || 0,
                price: Number(event.price) || 0,
            };

            console.log("Update Body:", body);

            let res;
            if (imageFile) {
                const formData = new FormData();
                Object.entries(body).forEach(([key, value]) => {
                    formData.append(key, String(value));
                });
                formData.append("image", imageFile);

                res = await API.put(`/events/${id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                res = await API.put(`/events/${id}`, body);
            }

            console.log("Update Response:", res.data);

            const dashPath = role === "staff" ? "staff" : "manager";
            toast.success("Event updated successfully");

            // Short delay to ensure user sees toast
            setTimeout(() => {
                navigate(`/dashboard/${dashPath}/events`);
            }, 500);
        } catch (err: any) {
            console.error("Update Error:", err);
            toast.error(err.response?.data?.message || "Failed to update event");
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEvent = async () => {
        if (!event) return;

        const confirmCancel = window.confirm(
            "Are you sure you want to CANCEL this event? \n\nThis will: \n1. Mark the event as Cancelled \n2. Automatically REFUND all purchased tickets \n3. Send notifications to all attendees \n\nThis action cannot be undone."
        );

        if (!confirmCancel) return;

        try {
            setSaving(true);
            const res = await API.put(`/events/${id}`, {
                status: "cancelled"
            });

            toast.success("Event cancelled and refunds processed successfully");

            setTimeout(() => {
                navigate(`/dashboard/${dashPath}/events`);
            }, 1000);
        } catch (err: any) {
            console.error("Cancel Error:", err);
            toast.error(err.response?.data?.message || "Failed to cancel event");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <DashboardLayout>
            <div className="p-4 text-center">Loading event...</div>
        </DashboardLayout>
    );

    if (!event) return (
        <DashboardLayout>
            <div className="p-4 text-red-600 text-center">Event not found</div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-3xl mx-auto">
                <Button variant="outline" onClick={() => navigate(`/dashboard/${dashPath}/events`)}>
                    ← Back to My Events
                </Button>

                <Card className="mt-4 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">Edit Event</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Image Upload Section */}
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                                <label htmlFor="image-upload" className="block">
                                    <div className="text-center cursor-pointer">
                                        {imagePreview ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={imagePreview}
                                                    alt="Event"
                                                    className="h-32 w-32 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                                <p className="text-sm text-gray-600">Click to upload event image</p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <Input
                                placeholder="Title"
                                value={event.title}
                                onChange={e => setEvent({ ...event, title: e.target.value })}
                            />
                            <Input
                                placeholder="Description"
                                value={event.description}
                                onChange={e => setEvent({ ...event, description: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <Input
                                    type="date"
                                    value={event.date}
                                    onChange={e => setEvent({ ...event, date: e.target.value })}
                                />
                                <Input
                                    type="time"
                                    value={event.time}
                                    onChange={e => setEvent({ ...event, time: e.target.value })}
                                />
                            </div>
                            <Input
                                placeholder="Location"
                                value={event.location}
                                onChange={e => setEvent({ ...event, location: e.target.value })}
                            />
                            <Input
                                placeholder="Category"
                                value={event.category || ""}
                                onChange={e => setEvent({ ...event, category: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Total Tickets"
                                    value={event.totalTickets || ""}
                                    onChange={e => setEvent({ ...event, totalTickets: parseInt(e.target.value) || 0 })}
                                />
                                <Input
                                    type="number"
                                    placeholder="Price"
                                    value={event.price || ""}
                                    onChange={e => setEvent({ ...event, price: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                            <Button type="submit" disabled={saving || event.status === "cancelled"} className="w-full">
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>

                            {event.status !== "cancelled" && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleCancelEvent}
                                    disabled={saving}
                                    className="w-full mt-2"
                                >
                                    Cancel Event (Refund All Tickets)
                                </Button>
                            )}

                            {event.status === "cancelled" && (
                                <div className="p-3 bg-red-100 text-red-700 rounded-md text-center font-medium">
                                    This event has been cancelled and refunded.
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default EditEventPage;

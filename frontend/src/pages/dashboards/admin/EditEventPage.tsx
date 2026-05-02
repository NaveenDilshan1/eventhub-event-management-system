// src/pages/dashboards/admin/EditEventPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, FormEvent } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Upload, X, ArrowLeft, Save, Calendar, Clock, MapPin, Tag, Info } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
}

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    const fetchEvent = async () => {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("You must be logged in");

      try {
        const res = await axios.get(`http://localhost:5000/api/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Format date for input field (YYYY-MM-DD)
        let formattedDate = res.data.date;
        if (formattedDate && formattedDate.includes('T')) {
          formattedDate = formattedDate.split('T')[0];
        } else if (formattedDate && formattedDate.includes('/')) {
          // Handle DD/MM/YYYY or MM/DD/YYYY if present
          const parts = formattedDate.split('/');
          if (parts.length === 3) {
            // Assuming it might be in a weird format, but usually browsers want YYYY-MM-DD
          }
        }

        setEvent({
          ...res.data,
          date: formattedDate || res.data.date
        });

        // Handle imageUrl properly
        const fullImageUrl = res.data.imageUrl
          ? (res.data.imageUrl.startsWith('http')
            ? res.data.imageUrl
            : `http://localhost:5000${res.data.imageUrl}`)
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
        : `http://localhost:5000${event.imageUrl}`)
      : "";
    setImagePreview(originalImageUrl);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!event) return;

    // Simple validation
    if (!event.title || !event.description || !event.date || !event.time || !event.location) {
      return toast.error("Please fill all fields");
    }

    const token = localStorage.getItem("token");
    if (!token) return toast.error("You must be logged in");

    try {
      setSaving(true);

      if (imageFile) {
        // Use FormData to send image with other fields
        const formData = new FormData();
        formData.append("title", event.title);
        formData.append("description", event.description);
        formData.append("date", event.date);
        formData.append("time", event.time);
        formData.append("location", event.location);
        formData.append("category", event.category || "");
        formData.append("totalTickets", String(event.totalTickets || 0));
        formData.append("price", String(event.price || 0));
        formData.append("image", imageFile);

        await axios.put(`http://localhost:5000/api/events/${id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Send as JSON if no new image
        await axios.put(`http://localhost:5000/api/events/${id}`, event, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success("Event updated successfully");
      navigate("/dashboard/admin/events");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update event");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        <p className="ml-3 text-muted-foreground">Loading event details...</p>
      </div>
    </DashboardLayout>
  );

  if (!event) return (
    <DashboardLayout>
      <div className="text-center py-20">
        <Info className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Event Not Found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard/admin/events")}>
          Back to Events
        </Button>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/admin/events")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Event</h1>
              <p className="text-muted-foreground">Modify event information and settings.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-md border-muted/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" /> Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Event Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter event title"
                    value={event.title}
                    onChange={e => setEvent({ ...event, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide a detailed description"
                    className="min-h-[150px] resize-none"
                    value={event.description}
                    onChange={e => setEvent({ ...event, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="category"
                        className="pl-10"
                        placeholder="e.g. Music, Tech"
                        value={event.category || ""}
                        onChange={e => setEvent({ ...event, category: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        className="pl-10"
                        placeholder="Enter venue or online link"
                        value={event.location}
                        onChange={e => setEvent({ ...event, location: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md border-muted/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> Schedule & Capacity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <Input
                        id="date"
                        type="date"
                        className="pl-10"
                        value={event.date}
                        onChange={e => setEvent({ ...event, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <Input
                        id="time"
                        type="time"
                        className="pl-10"
                        value={event.time}
                        onChange={e => setEvent({ ...event, time: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <Label htmlFor="totalTickets">Total Tickets</Label>
                    <Input
                      id="totalTickets"
                      type="number"
                      placeholder="0"
                      value={event.totalTickets || ""}
                      onChange={e => setEvent({ ...event, totalTickets: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Ticket Price (INR)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={event.price || ""}
                      onChange={e => setEvent({ ...event, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Media & Actions */}
          <div className="space-y-6">
            <Card className="shadow-md border-muted/40 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-4 w-4 text-primary" /> Event Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="relative aspect-video rounded-lg border-2 border-dashed border-muted hover:border-primary/50 transition-colors bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="Event"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white text-xs font-medium">Click to change</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
                        className="absolute top-2 right-2 bg-destructive text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground font-medium">Click to upload cover</p>
                    </div>
                  )}
                </div>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-[10px] text-muted-foreground text-center italic">
                  Recommended size: 1200x630 (1.91:1 aspect ratio)
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button type="submit" disabled={saving} className="w-full gap-2 h-11 text-base shadow-lg shadow-primary/20">
                {saving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" /> Save Changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-11"
                onClick={() => navigate("/dashboard/admin/events")}
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default EditEventPage;

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Calendar,
  Clock,
  MapPin,
  Image,
  Ticket,
  DollarSign,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useRole } from "@/context/RoleContext";

interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description: string;
}

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { role } = useRole();

  const dashPath = role === "staff" ? "staff" : "manager";

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { id: "1", name: "General Admission", price: 49, quantity: 100, description: "Standard entry" },
  ]);
  const [isOnline, setIsOnline] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    date: "",
    time: "",
    location: "",
    link: "",
  });

  // ------------------ Fetch categories from backend ------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Category fetch error:", err);
        // Fallback categories
        setCategories([
          "Conference",
          "Concert",
          "Workshop",
          "Seminar",
          "Festival",
          "Sports",
          "Exhibition",
          "Networking",
          "Training",
          "Meetup",
        ]);
      }
    };
    fetchCategories();
  }, []);

  const addTicketType = () => {
    setTicketTypes([...ticketTypes, { id: Date.now().toString(), name: "", price: 0, quantity: 50, description: "" }]);
  };

  const removeTicketType = (id: string) => {
    setTicketTypes(ticketTypes.filter(t => t.id !== id));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }

      if (!formData.name || !formData.date) {
        toast.error("Event name and date are required");
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("date", formData.date);
      formDataToSend.append("time", formData.time);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("link", formData.link);
      formDataToSend.append("ticketTypes", JSON.stringify(ticketTypes));
      formDataToSend.append("isOnline", String(isOnline));

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      console.log("Creating event with image upload");

      const res = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const responseData = await res.json();
      console.log("Response:", res.status, responseData);

      if (!res.ok) {
        throw new Error(responseData.message || "Failed to create event");
      }

      const eventId = responseData.event.id || responseData.event._id;

      toast.success("Event created successfully!");
      navigate(`/dashboard/${dashPath}/events`);
    } catch (err) {
      console.error("Error creating event:", err);
      toast.error(err instanceof Error ? err.message : "Failed to create event");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Event</h1>
            <p className="text-muted-foreground mt-1">Fill in the details to create your event.</p>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
                <CardDescription>Basic information about your event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Event Name *</Label>
                    <Input id="name" placeholder="e.g., Tech Summit 2025" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select required value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" placeholder="Describe your event..." rows={4} value={formData.description} onChange={handleInputChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Event Image</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img src={imagePreview} alt="Preview" className="mx-auto max-h-64 rounded" />
                        <p className="text-sm text-muted-foreground">Click to change image</p>
                      </div>
                    ) : (
                      <div onClick={() => document.getElementById("image")?.click()} className="cursor-pointer">
                        <Image className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Date & Location */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle>Date & Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Event Date *</Label>
                    <Input id="date" type="date" value={formData.date} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Event Time *</Label>
                    <Input id="time" type="time" value={formData.time} onChange={handleInputChange} required />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-lg">
                  <Switch id="online" checked={isOnline} onCheckedChange={setIsOnline} />
                  <Label htmlFor="online" className="cursor-pointer">This is an online event</Label>
                </div>

                {!isOnline && (
                  <div className="space-y-2">
                    <Label htmlFor="location">Venue Address *</Label>
                    <Input id="location" placeholder="Enter venue address" value={formData.location} onChange={handleInputChange} required />
                  </div>
                )}

                {isOnline && (
                  <div className="space-y-2">
                    <Label htmlFor="link">Meeting Link</Label>
                    <Input id="link" placeholder="https://zoom.us/j/..." value={formData.link} onChange={handleInputChange} />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Ticket Types */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>Ticket Types</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addTicketType}>
                  <Plus className="h-4 w-4 mr-1" /> Add Ticket
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticketTypes.map((ticket, index) => (
                  <div key={ticket.id} className="p-4 border border-border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-primary" />
                        <span className="font-medium">Ticket Type {index + 1}</span>
                      </div>
                      {ticketTypes.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeTicketType(ticket.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Input placeholder="Name" defaultValue={ticket.name} />
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="number" min="0" className="pl-10" defaultValue={ticket.price} />
                      </div>
                      <Input type="number" min="1" defaultValue={ticket.quantity} />
                    </div>
                    <Input placeholder="Description" defaultValue={ticket.description} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" /> Create Event
            </Button>
          </motion.div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateEventPage;

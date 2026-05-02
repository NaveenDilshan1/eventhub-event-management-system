import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface TicketData {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  sold: number;
  description: string;
  eventId: string;
}

const TicketEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState<TicketData | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/tickets/${id}`
        );

        setForm(res.data);
      } catch (err) {
        toast.error("Failed to load ticket");
      }
    };

    loadTicket();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    if (!form) return;

    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!form) return;

    try {
      setSaving(true);

      await axios.put(
        `http://localhost:5000/api/tickets/${id}`,
        form
      );

      toast.success("Ticket updated!");

      navigate(
        `/dashboard/manager/tickets/${id}`
      );
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <DashboardLayout>
        <p>Loading ticket...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle>✏️ Edit Ticket</CardTitle>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div>
                <Label>Ticket Name</Label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Price</Label>
                <Input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Quantity</Label>
                <Input
                  name="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Sold</Label>
                <Input
                  name="sold"
                  type="number"
                  value={form.sold}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label>Event ID</Label>
                <Input
                  name="eventId"
                  value={form.eventId}
                  disabled
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : "Update Ticket"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default TicketEditPage;

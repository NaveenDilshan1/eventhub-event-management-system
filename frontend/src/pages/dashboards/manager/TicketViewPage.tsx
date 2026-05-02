import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TicketData {
  _id: string;
  name: string;
  type?: string;
  price?: number;
  quantity?: number;
  sold?: number;
  description?: string;
  eventId?: string | { _id: string; title?: string }; // event can be populated object
  image?: { buffer: Buffer; contentType: string }; // if using image
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // for any extra fields
}

const TicketViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/tickets/${id}`);
        setTicket(res.data);
      } catch (err) {
        toast.error("Failed to load ticket");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading) return <DashboardLayout><p>Loading ticket...</p></DashboardLayout>;
  if (!ticket) return <DashboardLayout><p>Ticket not found.</p></DashboardLayout>;

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle>🎟 Ticket Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Render fields safely */}
            <Detail label="Name" value={ticket.name} />
            {ticket.type && <Detail label="Type" value={ticket.type} />}
            {ticket.price !== undefined && <Detail label="Price" value={`$${ticket.price}`} />}
            {ticket.quantity !== undefined && <Detail label="Quantity" value={ticket.quantity} />}
            {ticket.sold !== undefined && <Detail label="Sold" value={ticket.sold} />}
            
            {/* Event: handle populated or string */}
            <Detail 
              label="Event" 
              value={typeof ticket.eventId === "object" ? ticket.eventId.title || ticket.eventId._id : ticket.eventId || "-"} 
            />

            {ticket.description && <Detail label="Description" value={ticket.description} />}

            {/* Image */}
            {ticket.image && (
              <div>
                <span className="font-medium text-muted-foreground">Image</span>
                <img
                  src={`data:${ticket.image.contentType};base64,${Buffer.from(ticket.image.buffer).toString("base64")}`}
                  alt="Ticket"
                  className="mt-2 max-h-48"
                />
              </div>
            )}

            {/* Dates */}
            <Detail
              label="Created"
              value={new Date(ticket.createdAt).toLocaleString()}
            />
            <Detail
              label="Updated"
              value={new Date(ticket.updatedAt).toLocaleString()}
            />

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
              <Button onClick={() => navigate(`/dashboard/manager/tickets/edit/${ticket._id}`)}>Edit Ticket</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default TicketViewPage;

// Safe Detail component: converts objects to string or handles buffers
const Detail = ({ label, value }: { label: string; value: any }) => {
  let displayValue: string | JSX.Element = "";

  if (value === null || value === undefined) {
    displayValue = "-";
  } else if (typeof value === "object") {
    // Handle image buffer
    if ("buffer" in value) {
      displayValue = "[Image/Buffer]";
    } else {
      displayValue = JSON.stringify(value, null, 2);
    }
  } else {
    displayValue = value.toString();
  }

  return (
    <div className="flex justify-between border-b pb-2">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="break-all">{displayValue}</span>
    </div>
  );
};

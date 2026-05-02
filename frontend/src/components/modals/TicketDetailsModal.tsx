import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Download, Share2, X, QrCode, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface TicketDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: {
    id: string;
    eventName: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    ticketType: string;
    price: number;
    status: string;
    qrCode?: string;
    seatNumber?: string;
  };
}

export const TicketDetailsModal = ({ open, onOpenChange, ticket }: TicketDetailsModalProps) => {
  const { toast } = useToast();

  if (!ticket) return null;

  const handleDownload = () => {
    toast({
      title: "Downloading Ticket",
      description: "Your ticket PDF is being generated...",
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: ticket.eventName,
        text: `Check out my ticket for ${ticket.eventName}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Ticket link copied to clipboard!",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Ticket Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Info */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6">
            <h3 className="text-xl font-bold text-foreground mb-4">{ticket.eventName}</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{ticket.eventDate}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{ticket.eventTime}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{ticket.venue}</span>
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="w-48 h-48 bg-gradient-to-br from-foreground to-foreground/80 rounded-lg flex items-center justify-center">
                <QrCode className="h-32 w-32 text-white" />
              </div>
              <p className="text-center text-xs text-muted-foreground mt-3">
                Ticket ID: {ticket.id}
              </p>
            </div>
          </div>

          <Separator />

          {/* Ticket Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Ticket Type</p>
              <p className="font-medium">{ticket.ticketType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="font-medium">₹{ticket.price}</p>
            </div>
            {ticket.seatNumber && (
              <div>
                <p className="text-sm text-muted-foreground">Seat Number</p>
                <p className="font-medium">{ticket.seatNumber}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge variant={ticket.status === "valid" ? "default" : "secondary"}>
                {ticket.status}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button className="flex-1" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsModal;

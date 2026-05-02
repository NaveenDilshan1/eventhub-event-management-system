import { useState } from "react";
import { Calendar, MapPin, Clock, Ticket, CreditCard, Minus, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface BookTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: {
    id: number;
    title: string;
    date: string;
    time: string;
    venue: string;
    regularPrice: number;
    vipPrice: number;
  };
}

export const BookTicketModal = ({ open, onOpenChange, event }: BookTicketModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketType, setTicketType] = useState("regular");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");

  if (!event) return null;

  const ticketPrice = ticketType === "vip" ? event.vipPrice : event.regularPrice;
  const subtotal = ticketPrice * quantity;
  const serviceFee = subtotal * 0.05;
  const total = subtotal + serviceFee;

  const handleBook = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    toast({
      title: "Booking Successful! 🎉",
      description: `${quantity} ticket(s) booked for ${event.title}. Check your email for confirmation.`,
    });
    
    setIsLoading(false);
    onOpenChange(false);
    setStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            Book Tickets
          </DialogTitle>
          <DialogDescription>
            {event.title}
          </DialogDescription>
        </DialogHeader>

        {/* Event Summary */}
        <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{event.date}</span>
            <Clock className="h-4 w-4 ml-2" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{event.venue}</span>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Ticket Type Selection */}
            <div className="space-y-3">
              <Label>Select Ticket Type</Label>
              <RadioGroup value={ticketType} onValueChange={setTicketType} className="space-y-3">
                <div 
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    ticketType === "regular" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setTicketType("regular")}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="regular" id="regular" />
                    <div>
                      <Label htmlFor="regular" className="font-medium cursor-pointer">Regular</Label>
                      <p className="text-sm text-muted-foreground">General admission</p>
                    </div>
                  </div>
                  <span className="font-bold text-lg">₹{event.regularPrice}</span>
                </div>

                <div 
                  className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    ticketType === "vip" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setTicketType("vip")}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value="vip" id="vip" />
                    <div>
                      <Label htmlFor="vip" className="font-medium cursor-pointer">VIP</Label>
                      <p className="text-sm text-muted-foreground">Premium seating + perks</p>
                    </div>
                  </div>
                  <span className="font-bold text-lg">₹{event.vipPrice}</span>
                </div>
              </RadioGroup>
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <Label>Number of Tickets</Label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  disabled={quantity >= 10}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Price Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{ticketType === "vip" ? "VIP" : "Regular"} × {quantity}</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee (5%)</span>
                <span>₹{serviceFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={() => setStep(2)}>
              Continue to Payment
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            {/* Payment Method */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                <div 
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === "card" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => setPaymentMethod("card")}
                >
                  <RadioGroupItem value="card" id="card" />
                  <CreditCard className="h-5 w-5" />
                  <Label htmlFor="card" className="cursor-pointer">Credit/Debit Card</Label>
                </div>

                <div 
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => setPaymentMethod("upi")}
                >
                  <RadioGroupItem value="upi" id="upi" />
                  <div className="w-5 h-5 bg-green-500 rounded text-white text-xs flex items-center justify-center font-bold">₹</div>
                  <Label htmlFor="upi" className="cursor-pointer">UPI Payment</Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === "card" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVV</Label>
                    <Input placeholder="123" type="password" />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "upi" && (
              <div className="space-y-2">
                <Label>UPI ID</Label>
                <Input placeholder="yourname@upi" />
              </div>
            )}

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span>Amount to Pay</span>
              <span className="text-primary">₹{total.toFixed(2)}</span>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={handleBook} disabled={isLoading}>
                {isLoading ? "Processing..." : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Pay ₹{total.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookTicketModal;

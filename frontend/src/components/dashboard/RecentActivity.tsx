import { motion } from "framer-motion";
import { Calendar, Ticket, Users, CreditCard, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "event" | "ticket" | "user" | "payment" | "checkin";
  message: string;
  time: string;
}

const activities: Activity[] = [
  { id: "1", type: "ticket", message: "New ticket purchased for Tech Summit 2025", time: "2 min ago" },
  { id: "2", type: "user", message: "New user registered: Sarah Johnson", time: "15 min ago" },
  { id: "3", type: "event", message: "Event 'Startup Night' was updated", time: "1 hour ago" },
  { id: "4", type: "payment", message: "Payment received: $299.00", time: "2 hours ago" },
  { id: "5", type: "checkin", message: "45 attendees checked in to Design Workshop", time: "3 hours ago" },
  { id: "6", type: "ticket", message: "Bulk tickets generated for Conference A", time: "5 hours ago" },
];

const iconMap = {
  event: Calendar,
  ticket: Ticket,
  user: Users,
  payment: CreditCard,
  checkin: CheckCircle,
};

const colorMap = {
  event: "bg-blue-100 text-blue-600",
  ticket: "bg-primary/10 text-primary",
  user: "bg-green-100 text-green-600",
  payment: "bg-amber-100 text-amber-600",
  checkin: "bg-purple-100 text-purple-600",
};

export const RecentActivity = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl border border-border p-6"
    >
      <h3 className="font-display font-semibold text-lg text-foreground mb-6">
        Recent Activity
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = iconMap[activity.type];
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-4"
            >
              <div className={cn("p-2 rounded-lg", colorMap[activity.type])}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground line-clamp-1">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

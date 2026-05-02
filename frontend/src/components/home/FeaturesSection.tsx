import { motion } from "framer-motion";
import {
  Calendar,
  TicketCheck,
  BarChart3,
  Users,
  Shield,
  Sparkles,
  CreditCard,
  Globe,
  Palette,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Event Management",
    description: "Create, edit, and manage events with ease. Support for online and offline events with flexible scheduling.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: TicketCheck,
    title: "Smart Ticketing",
    description: "Real-time ticket availability with QR-code generation. Seamless booking experience for your attendees.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive reports on sales, revenue, and attendee behavior. Export to PDF and Excel.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Users,
    title: "Multi-Tenant SaaS",
    description: "Each organization gets their own isolated instance with separate database and complete data privacy.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Integrated payment gateways with automatic refund handling and financial reconciliation.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description: "Intelligent chatbot to answer queries, generate reports, and provide actionable insights.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Palette,
    title: "Custom Branding",
    description: "White-label your platform with custom logos, colors, email templates, and landing pages.",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption, automated backups, and compliance with industry security standards.",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "Cloud-native infrastructure designed to handle millions of attendees worldwide.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Everything You Need to
            <span className="text-gradient"> Scale Events</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive suite of tools designed for modern event organizers.
            From ticketing to analytics, we've got you covered.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.bgColor} mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>

              {/* Hover gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 transition-all duration-300 pointer-events-none" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Mail, Lock, Building2, ArrowRight, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const benefits = [
  "Unlimited event creation",
  "Real-time analytics dashboard",
  "Multi-role user management",
  "QR code ticketing system",
  "Secure payment processing",
  "14-day free trial included",
];

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationName: "",
    role: "admin",
    terms: false,
    newsletter: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({ title: "Missing Info", description: "Please fill all required fields.", variant: "destructive" });
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
      return false;
    }
    if (formData.password.length < 8) {
      toast({ title: "Weak Password", description: "Password must be at least 8 characters.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.organizationName) {
      toast({ title: "Missing Info", description: "Please fill organization name.", variant: "destructive" });
      return;
    }
    if (!formData.terms) {
      toast({ title: "Terms Not Accepted", description: "You must accept terms to continue.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          organization: formData.organizationName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Use specific error if available, else fallback to message
        const errorMsg = data.error || data.message || "Registration failed";
        throw new Error(errorMsg);
      }

      toast({ title: "Registration Successful 🎉", description: `Welcome, ${formData.fullName}!` });
      navigate("/login");
    } catch (err: any) {
      console.error("Registration UI Error:", err);
      toast({
        title: "Registration Failed",
        description: err.message || "An unexpected error occurred. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:block lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-primary/30" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-lg">
            <div className="flex items-center gap-3 mb-8">
              <img src={logo} alt="Event Hub" className="h-14 w-14" />
              <span className="font-display font-bold text-3xl text-background">
                Event<span className="text-primary">Hub</span>
              </span>
            </div>
            <h2 className="font-display text-4xl font-bold text-background mb-4">Register Your Organization</h2>
            <p className="text-background/70 text-lg mb-10">Join thousands of organizations using Event Hub to create extraordinary event experiences.</p>
            <div className="space-y-4">
              {benefits.map((b, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-background/90 text-lg">{b}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8 bg-background overflow-y-auto">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-xl">
          <Link to="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <img src={logo} alt="Event Hub" className="h-10 w-10" />
            <span className="font-display font-bold text-2xl text-foreground">Event<span className="text-primary">Hub</span></span>
          </Link>

          {/* Steps */}
          <div className="flex items-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {step > 1 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="font-medium hidden sm:inline">Personal Info</span>
            </div>
            <div className="flex-1 h-0.5 bg-muted">
              <div className={`h-full bg-primary transition-all ${step >= 2 ? "w-full" : "w-0"}`} />
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div>
              <span className="font-medium hidden sm:inline">Organization</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">Create Your Account</h1>
                  <p className="text-muted-foreground">Start with your personal information</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} placeholder="Enter name" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter email" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} placeholder="Min 8 characters" className="pl-10 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Select Role *</Label>
                  <select id="role" name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border border-muted rounded">
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="user">User</option>
                  </select>
                </div>

                <Button type="button" variant="hero" size="lg" className="w-full flex items-center justify-center gap-2" onClick={handleNextStep}>
                  Continue to Organization
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <div>
                  <h1 className="font-display text-3xl font-bold text-foreground mb-2">Organization Details</h1>
                  <p className="text-muted-foreground">Tell us about your organization</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="organizationName" name="organizationName" type="text" value={formData.organizationName} onChange={handleChange} placeholder="Your Company Name" className="pl-10" />
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox id="terms" checked={formData.terms} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, terms: !!checked }))} className="mt-1" />
                  <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    I agree to the <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy</Link>
                  </label>
                </div>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                  <Button type="submit" variant="hero" size="lg" className="flex-1" disabled={isLoading}>
                    {isLoading ? "Creating Organization..." : "Register Organization"} <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="text-center text-muted-foreground mt-8">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;

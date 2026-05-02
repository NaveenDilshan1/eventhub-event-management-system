import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { Calendar, Menu, X, ChevronDown, Sparkles, User, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useCurrency } from "@/context/CurrencyContext";

const navLinks = [

  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHeroPage = location.pathname === "/";
  const { theme, toggleTheme } = useTheme();
  const { websiteName, websiteLogo, getFullImageUrl } = useCurrency();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 ${isHeroPage
        ? "bg-transparent"
        : "bg-background/80 backdrop-blur-xl border-b border-border"
        }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 blur-xl rounded-full group-hover:bg-primary/30 transition-all duration-300" />
              <div className="relative p-1 rounded-xl">
                <img src={websiteLogo ? getFullImageUrl(websiteLogo) : logo} alt="Logo" className="h-8 w-8 object-contain" />
              </div>
            </div>
            <span className={`text-xl font-display font-bold ${isHeroPage ? "text-white" : "text-foreground"}`}>
              {websiteName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isHeroPage
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {/* 🌙 Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>

            <Link to="/login">
              <Button variant={isHeroPage ? "hero-outline" : "ghost"} size="sm">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>

            <Link to="/register">
              <Button variant={isHeroPage ? "hero" : "default"} size="sm">
                <Sparkles className="h-4 w-4" />
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg ${isHeroPage ? "text-white hover:bg-white/10" : "text-foreground hover:bg-accent"
              }`}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <div className="container mx-auto px-4 py-4 space-y-2">

              {/* 🌙 Theme Toggle (Mobile) */}
              <Button variant="outline" className="w-full mb-2" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="mr-2" /> : <Moon className="mr-2" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </Button>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 rounded-lg text-foreground hover:bg-accent transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              <div className="pt-4 space-y-2">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="default" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logoFull from "@/assets/smartbooks-logo-full.png.asset.json";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black-deep/90 backdrop-blur-md border-b border-border/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" aria-label="SmartBooks by ReFurrm" className="flex items-center">
          <img src={logoFull.url} alt="SmartBooks by ReFurrm — Bookkeeping, Taxx, Payroll" className="h-12 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-primary-foreground/70">
          <a href="#features" className="hover:text-gold transition-colors">Features</a>
          <Link to="/pricing" className="hover:text-gold transition-colors">Pricing</Link>
          <Link to="/login">
            <Button variant="ghost" className="text-primary-foreground/70 hover:text-gold hover:bg-gold/10">Sign In</Button>
          </Link>
          <Link to="/signup">
            <Button variant="gold" size="sm">Get Started</Button>
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-primary-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav className="md:hidden bg-black-deep border-t border-border/20 px-4 py-4 flex flex-col gap-3">
          <a href="#features" className="text-primary-foreground/70 hover:text-gold py-2" onClick={() => setOpen(false)}>Features</a>
          <Link to="/pricing" className="text-primary-foreground/70 hover:text-gold py-2" onClick={() => setOpen(false)}>Pricing</Link>
          <Link to="/login" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full text-primary-foreground/70 hover:text-gold hover:bg-gold/10">Sign In</Button>
          </Link>
          <Link to="/signup" onClick={() => setOpen(false)}>
            <Button variant="gold" className="w-full">Get Started</Button>
          </Link>
        </nav>
      )}
    </header>
  );
}

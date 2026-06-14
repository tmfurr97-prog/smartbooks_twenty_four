import { Link } from "react-router-dom";
import logoFull from "@/assets/smartbooks-logo-full.png.asset.json";

export default function Footer() {
  return (
    <footer className="bg-black-deep py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <img src={logoFull.url} alt="SmartBooks by ReFurrm" className="h-14 w-auto" />

          <nav className="flex gap-6 text-sm text-primary-foreground/60">
            <Link to="/pricing" className="hover:text-gold transition-colors">Pricing</Link>
            <Link to="/terms" className="hover:text-gold transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-gold transition-colors">Privacy</Link>
          </nav>
          <p className="text-xs text-primary-foreground/40">
            © {new Date().getFullYear()} ReFurrm. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

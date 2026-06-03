import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  MessageSquare,
  Bot,
  Users,
  CreditCard,
  Car,
  ClipboardCheck,
  Link2,
  User,
  LogOut,
  Receipt,
  Shield,
  Send,
  Database,
  HeartPulse,
  Building2,
  Bitcoin,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: UserCog, label: "Taxx Profile", path: "/dashboard/taxx-profile" },
  { icon: Upload, label: "Documents", path: "/dashboard/documents" },
  { icon: CreditCard, label: "Transactions", path: "/dashboard/transactions" },
  { icon: Link2, label: "Matching", path: "/dashboard/matching" },
  { icon: Car, label: "Mileage & Vehicle", path: "/dashboard/mileage" },
  { icon: Receipt, label: "Quarterly Taxes", path: "/dashboard/quarterly-taxes" },
  { icon: MessageSquare, label: "Messages", path: "/dashboard/messages" },
  { icon: Bot, label: "AI Assistant", path: "/dashboard/ai" },
  { icon: Users, label: "Collaboration", path: "/dashboard/collaboration" },
  { icon: ClipboardCheck, label: "Year-End Checklist", path: "/dashboard/checklist" },
  { icon: Shield, label: "Audit Defense", path: "/dashboard/audit-defense" },
  { icon: Send, label: "E-File", path: "/dashboard/efile" },
  { icon: Database, label: "Backups", path: "/dashboard/backups" },
  { icon: HeartPulse, label: "Health Check", path: "/dashboard/health-check" },
  { icon: Building2, label: "Business Entities", path: "/dashboard/business-entities" },
  { icon: Bitcoin, label: "Crypto Taxes", path: "/dashboard/crypto-taxes" },
];

interface DashboardSidebarProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export default function DashboardSidebar({ mobile, onNavigate }: DashboardSidebarProps = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleNav = () => {
    onNavigate?.();
  };

  return (
    <aside className={cn(
      "w-64 bg-black-deep border-r border-sidebar-border flex flex-col",
      mobile
        ? "h-full"
        : "fixed left-0 top-0 bottom-0 hidden lg:flex"
    )}>
      <div className="p-6">
        <Link to="/" className="font-heading text-xl font-bold text-sidebar-foreground">
          Smart<span className="text-gradient-gold">Books</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleNav}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-1">
        {profile && (
          <div className="px-4 py-2 text-xs text-sidebar-foreground/50">
            {profile.first_name} {profile.last_name}
          </div>
        )}
        <Link
          to="/dashboard/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <User className="w-5 h-5" />
          Profile
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

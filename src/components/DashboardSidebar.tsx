import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  MessageSquare,
  Bot,
  Video,
  FolderLock,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Upload, label: "Documents", path: "/dashboard/documents" },
  { icon: MessageSquare, label: "Messages", path: "/dashboard/messages" },
  { icon: Bot, label: "AI Assistant", path: "/dashboard/ai" },
  { icon: Video, label: "Meetings", path: "/dashboard/meetings" },
  { icon: FolderLock, label: "Vault", path: "/dashboard/vault" },
];

export default function DashboardSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border hidden lg:flex flex-col">
      <div className="p-6">
        <Link to="/" className="font-heading text-xl font-bold text-sidebar-foreground">
          Smart<span className="text-gradient-gold">Books</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
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
        <Link
          to="/dashboard/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <User className="w-5 h-5" />
          Profile
        </Link>
        <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors w-full">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

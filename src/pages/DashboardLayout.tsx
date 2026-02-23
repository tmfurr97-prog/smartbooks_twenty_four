import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar />

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-black-deep border-b border-sidebar-border flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? (
            <X className="w-6 h-6 text-sidebar-foreground" />
          ) : (
            <Menu className="w-6 h-6 text-sidebar-foreground" />
          )}
        </button>
        <span className="font-heading text-lg font-bold text-sidebar-foreground">
          Smart<span className="text-gradient-gold">Books</span>
        </span>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed top-14 left-0 bottom-0 z-50 w-64">
            <DashboardSidebar mobile onNavigate={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      <main className="lg:ml-64 pt-14 lg:pt-0 min-h-screen">
        <div className="p-6 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

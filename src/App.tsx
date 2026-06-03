import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Signup from "./pages/Signup";
import DashboardLayout from "./pages/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import Messages from "./pages/Messages";
import AIAssistant from "./pages/AIAssistant";
import Collaboration from "./pages/Collaboration";
import Transactions from "./pages/Transactions";
import TransactionMatching from "./pages/TransactionMatching";
import Mileage from "./pages/Mileage";
import YearEndChecklist from "./pages/YearEndChecklist";
import QuarterlyTaxes from "./pages/QuarterlyTaxes";
import AuditDefense from "./pages/AuditDefense";
import EFile from "./pages/EFile";
import Backups from "./pages/Backups";
import HealthCheck from "./pages/HealthCheck";
import BusinessEntities from "./pages/BusinessEntities";
import CryptoTaxes from "./pages/CryptoTaxes";
import TaxxProfile from "./pages/TaxxProfile";
import ReturnPreview from "./pages/ReturnPreview";
import Recommendations from "./pages/Recommendations";
import AdminConsole from "./pages/AdminConsole";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import Features from "./pages/Features";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/features" element={<Features />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="documents" element={<Documents />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="matching" element={<TransactionMatching />} />
              <Route path="mileage" element={<Mileage />} />
              <Route path="messages" element={<Messages />} />
              <Route path="ai" element={<AIAssistant />} />
              <Route path="collaboration" element={<Collaboration />} />
              <Route path="checklist" element={<YearEndChecklist />} />
              <Route path="quarterly-taxes" element={<QuarterlyTaxes />} />
              <Route path="audit-defense" element={<AuditDefense />} />
              <Route path="efile" element={<EFile />} />
              <Route path="backups" element={<Backups />} />
              <Route path="health-check" element={<HealthCheck />} />
              <Route path="business-entities" element={<BusinessEntities />} />
              <Route path="crypto-taxes" element={<CryptoTaxes />} />
              <Route path="profile" element={<TaxxProfile />} />
              <Route path="taxx-profile" element={<TaxxProfile />} />
              <Route path="return-preview" element={<ReturnPreview />} />
              <Route path="recommendations" element={<Recommendations />} />
              <Route path="admin" element={<AdminConsole />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

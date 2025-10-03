import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/dashboard/Clients";
import Projects from "./pages/dashboard/Projects";
import TimeEntry from "./pages/dashboard/TimeEntry";
import Invoices from "./pages/dashboard/Invoices";
import Approvals from "./pages/dashboard/Approvals";
import Reports from "./pages/dashboard/Reports";
import Settings from "./pages/dashboard/Settings";
import Expenses from "./pages/dashboard/Expenses";
import Team from "./pages/dashboard/Team";
import ClientPortal from "./pages/dashboard/ClientPortal";
import ClientPortalView from "./pages/ClientPortalView";
import AuditLogs from "./pages/dashboard/AuditLogs";
import Security from "./pages/dashboard/Security";
import NotFound from "./pages/NotFound";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { FeaturesPage } from "./pages/FeaturesPage";
import { PricingPage } from "./pages/PricingPage";
import { FAQPage } from "./pages/FAQPage";
// Importeer hier je andere pagina's, bijvoorbeeld de Homepage

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineIndicator />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/clients" element={<Clients />} />
            <Route path="/dashboard/projects" element={<Projects />} />
            <Route path="/dashboard/time" element={<TimeEntry />} />
            <Route path="/dashboard/invoices" element={<Invoices />} />
            <Route path="/dashboard/expenses" element={<Expenses />} />
            <Route path="/dashboard/approvals" element={<Approvals />} />
            <Route path="/dashboard/reports" element={<Reports />} />
            <Route path="/dashboard/team" element={<Team />} />
            <Route path="/dashboard/client-portal" element={<ClientPortal />} />
            <Route path="/dashboard/audit-logs" element={<AuditLogs />} />
            <Route path="/dashboard/security" element={<Security />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/client-portal" element={<ClientPortalView />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

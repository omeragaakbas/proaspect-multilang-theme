import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
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
import RecurringInvoices from "./pages/dashboard/RecurringInvoices";
import NotFound from "./pages/NotFound";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { FeaturesPage } from "./pages/FeaturesPage";
import { PricingPage } from "./pages/PricingPage";
import { FAQPage } from "./pages/FAQPage";
import { TimeTrackingPage } from "./pages/features/TimeTrackingPage";
import { InvoicingPage } from "./pages/features/InvoicingPage";
import { ReportingPage } from "./pages/features/ReportingPage";
import { MobileAppPage } from "./pages/features/MobileAppPage";
import { HelpCenterPage } from "./pages/support/HelpCenterPage";
import { ApiDocsPage } from "./pages/support/ApiDocsPage";
import { StatusPage } from "./pages/StatusPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";

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
            <Route path="/features/time-tracking" element={<TimeTrackingPage />} />
            <Route path="/features/invoicing" element={<InvoicingPage />} />
            <Route path="/features/reporting" element={<ReportingPage />} />
            <Route path="/features/mobile-app" element={<MobileAppPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/support/help-center" element={<HelpCenterPage />} />
            <Route path="/support/api-docs" element={<ApiDocsPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/client-portal" element={<ClientPortalView />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/dashboard/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/dashboard/time" element={<ProtectedRoute><TimeEntry /></ProtectedRoute>} />
            <Route path="/dashboard/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
            <Route path="/dashboard/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/dashboard/approvals" element={<ProtectedRoute><Approvals /></ProtectedRoute>} />
            <Route path="/dashboard/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
            <Route path="/dashboard/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
            <Route path="/dashboard/client-portal" element={<ProtectedRoute><ClientPortal /></ProtectedRoute>} />
            <Route path="/dashboard/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
            <Route path="/dashboard/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
            <Route path="/dashboard/recurring-invoices" element={<ProtectedRoute><RecurringInvoices /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

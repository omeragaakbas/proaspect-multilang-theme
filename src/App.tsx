import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Clients = lazy(() => import("./pages/dashboard/Clients"));
const Projects = lazy(() => import("./pages/dashboard/Projects"));
const TimeEntry = lazy(() => import("./pages/dashboard/TimeEntry"));
const Invoices = lazy(() => import("./pages/dashboard/Invoices"));
const Approvals = lazy(() => import("./pages/dashboard/Approvals"));
const Reports = lazy(() => import("./pages/dashboard/Reports"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const Expenses = lazy(() => import("./pages/dashboard/Expenses"));
const Team = lazy(() => import("./pages/dashboard/Team"));
const ClientPortal = lazy(() => import("./pages/dashboard/ClientPortal"));
const ClientPortalView = lazy(() => import("./pages/ClientPortalView"));
const AuditLogs = lazy(() => import("./pages/dashboard/AuditLogs"));
const Security = lazy(() => import("./pages/dashboard/Security"));
const RecurringInvoices = lazy(() => import("./pages/dashboard/RecurringInvoices"));
const Contractors = lazy(() => import("./pages/dashboard/Contractors"));

const AboutPage = lazy(() => import("./pages/AboutPage").then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import("./pages/ContactPage").then(m => ({ default: m.ContactPage })));
const FeaturesPage = lazy(() => import("./pages/FeaturesPage").then(m => ({ default: m.FeaturesPage })));
const PricingPage = lazy(() => import("./pages/PricingPage").then(m => ({ default: m.PricingPage })));
const FAQPage = lazy(() => import("./pages/FAQPage").then(m => ({ default: m.FAQPage })));
const TimeTrackingPage = lazy(() => import("./pages/features/TimeTrackingPage").then(m => ({ default: m.TimeTrackingPage })));
const InvoicingPage = lazy(() => import("./pages/features/InvoicingPage").then(m => ({ default: m.InvoicingPage })));
const ReportingPage = lazy(() => import("./pages/features/ReportingPage").then(m => ({ default: m.ReportingPage })));
const MobileAppPage = lazy(() => import("./pages/features/MobileAppPage").then(m => ({ default: m.MobileAppPage })));
const HelpCenterPage = lazy(() => import("./pages/support/HelpCenterPage").then(m => ({ default: m.HelpCenterPage })));
const ApiDocsPage = lazy(() => import("./pages/support/ApiDocsPage").then(m => ({ default: m.ApiDocsPage })));
const StatusPage = lazy(() => import("./pages/StatusPage").then(m => ({ default: m.StatusPage })));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import("./pages/TermsPage").then(m => ({ default: m.TermsPage })));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <ErrorBoundary>
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <Router>
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/dashboard" element={<ProtectedRoute><ErrorBoundary><Dashboard /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/clients" element={<ProtectedRoute><ErrorBoundary><Clients /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/projects" element={<ProtectedRoute><ErrorBoundary><Projects /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/time" element={<ProtectedRoute><ErrorBoundary><TimeEntry /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/invoices" element={<ProtectedRoute><ErrorBoundary><Invoices /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/expenses" element={<ProtectedRoute><ErrorBoundary><Expenses /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/approvals" element={<ProtectedRoute><ErrorBoundary><Approvals /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/reports" element={<ProtectedRoute><ErrorBoundary><Reports /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/team" element={<ProtectedRoute><ErrorBoundary><Team /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/client-portal" element={<ProtectedRoute><ErrorBoundary><ClientPortal /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/audit-logs" element={<ProtectedRoute><ErrorBoundary><AuditLogs /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/security" element={<ProtectedRoute><ErrorBoundary><Security /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/recurring-invoices" element={<ProtectedRoute><ErrorBoundary><RecurringInvoices /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/contractors" element={<ProtectedRoute><ErrorBoundary><Contractors /></ErrorBoundary></ProtectedRoute>} />
                <Route path="/dashboard/settings" element={<ProtectedRoute><ErrorBoundary><Settings /></ErrorBoundary></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </ErrorBoundary>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

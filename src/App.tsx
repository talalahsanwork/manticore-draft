import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AppLogin from "./pages/app/Login.tsx";
import AdminLogin from "./pages/admin/Login.tsx";
import ClientLogin from "./pages/client/Login.tsx";
import Dashboard from "./pages/app/Dashboard.tsx";
import WorkOrders from "./pages/app/WorkOrders.tsx";
import Maintenance from "./pages/app/Maintenance.tsx";
import Assets from "./pages/app/Assets.tsx";
import Reports from "./pages/app/Reports.tsx";
import Settings from "./pages/app/Settings.tsx";
import SuperAdmin from "./pages/admin/SuperAdmin.tsx";
import ClientPortal from "./pages/client/ClientPortal.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<SuperAdmin />} />
          <Route path="/app" element={<AppLogin />} />
          <Route path="/app/dashboard" element={<Dashboard />} />
          <Route path="/app/work-orders" element={<WorkOrders />} />
          <Route path="/app/maintenance" element={<Maintenance />} />
          <Route path="/app/assets" element={<Assets />} />
          <Route path="/app/reports" element={<Reports />} />
          <Route path="/app/settings" element={<Settings />} />
          <Route path="/client" element={<ClientLogin />} />
          <Route path="/client/dashboard" element={<ClientPortal />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

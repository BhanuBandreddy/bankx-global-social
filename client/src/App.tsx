
import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
// BlinkConcierge removed - coordination happens backend-only
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Demo from "./pages/Demo";
import About from "./pages/About";
import Redirect from "./pages/Redirect";
import Logistics from "./pages/Logistics";
import Workflow from "./pages/Workflow";
import AgentDashboardPage from "./pages/AgentDashboardPage";
import TravelerDiscoveryFixed from "./pages/TravelerDiscoveryFixed";
import MultiAgentDiagram from "./components/MultiAgentDiagram";
import TravelerWorldMap from "./pages/TravelerWorldMap";
import TravelerWorldMapNew from "./pages/TravelerWorldMapNew";
import NotFound from "./pages/NotFound";

// Create QueryClient outside of component to prevent recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // BlinkConcierge state removed - coordination happens backend-only

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/about" element={<About />} />
              <Route path="/redirect" element={<Redirect />} />
              <Route path="/logistics" element={<Logistics />} />
              <Route path="/workflow" element={<Workflow />} />
              <Route path="/agent-dashboard" element={<AgentDashboardPage />} />
              <Route path="/traveler-discovery" element={<TravelerDiscoveryFixed />} />
              <Route path="/traveler-world-map" element={<TravelerWorldMapNew />} />
              <Route path="/multi-agent-diagram" element={<MultiAgentDiagram />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Global UI Components - BlinkConcierge removed, coordination is backend-only */}
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

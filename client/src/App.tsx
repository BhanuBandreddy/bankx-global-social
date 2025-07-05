
import React, { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConductorDashboard } from "@/components/ConductorDashboard";
import { BlinkConcierge } from "@/components/BlinkConcierge";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Demo from "./pages/Demo";
import Logistics from "./pages/Logistics";
import Workflow from "./pages/Workflow";
import AgentDashboardPage from "./pages/AgentDashboardPage";
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
  const [isBlinkMinimized, setIsBlinkMinimized] = useState(true);

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
              <Route path="/logistics" element={<Logistics />} />
              <Route path="/workflow" element={<Workflow />} />
              <Route path="/agent-dashboard" element={<AgentDashboardPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Global UI Components */}
            <ConductorDashboard />
            <BlinkConcierge 
              isMinimized={isBlinkMinimized}
              onToggle={() => setIsBlinkMinimized(!isBlinkMinimized)}
            />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

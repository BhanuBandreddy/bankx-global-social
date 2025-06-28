import React from "react";
import { AgentDashboard } from "@/components/AgentDashboard";
import { AuthNavbar } from "@/components/AuthNavbar";

const AgentDashboardPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <AuthNavbar />
      <AgentDashboard />
    </div>
  );
};

export default AgentDashboardPage;
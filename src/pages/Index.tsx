
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SocialFeed } from "@/components/SocialFeed";
import { TrustMetrics } from "@/components/TrustMetrics";
import { AgentDashboard } from "@/components/AgentDashboard";

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Main Navigation Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          {[
            { id: "feed", label: "Global Feed", icon: "🌐" },
            { id: "agents", label: "AI Agents", icon: "🤖" },
            { id: "trust", label: "Trust Network", icon: "🔐" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="transition-all duration-500 ease-in-out">
          {activeTab === "feed" && <SocialFeed />}
          {activeTab === "agents" && <AgentDashboard />}
          {activeTab === "trust" && <TrustMetrics />}
        </div>
      </div>
    </div>
  );
};

export default Index;

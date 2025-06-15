
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SocialFeed } from "@/components/SocialFeed";
import { TrustMetrics } from "@/components/TrustMetrics";
import { AgentDashboard } from "@/components/AgentDashboard";
import { CustomIcons } from "@/components/CustomIcons";

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Main Navigation Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-6 mb-8 justify-center">
          {[
            { id: "feed", label: "Global Feed", icon: "🌐" },
            { id: "agents", label: "AI Agents", icon: <CustomIcons.Sparkle className="w-6 h-6" /> },
            { id: "trust", label: "Trust Network", icon: "🔐" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-8 py-4 font-black text-lg border-4 transition-all duration-200 transform ${
                activeTab === tab.id
                  ? "bg-lime-400 text-black border-black shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#000] translate-x-[-4px] translate-y-[-4px]"
                  : "bg-white text-black border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
              }`}
            >
              <span className="mr-3 flex items-center">
                {typeof tab.icon === 'string' ? (
                  <span className="text-xl">{tab.icon}</span>
                ) : (
                  tab.icon
                )}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="transition-all duration-300">
          {activeTab === "feed" && <SocialFeed />}
          {activeTab === "agents" && <AgentDashboard />}
          {activeTab === "trust" && <TrustMetrics />}
        </div>
      </div>
    </div>
  );
};

export default Index;

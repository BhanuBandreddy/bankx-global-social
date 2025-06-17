
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SocialFeed } from "@/components/SocialFeed";
import { EnhancedTrustMetrics } from "@/components/EnhancedTrustMetrics";
import { AgentDashboard } from "@/components/AgentDashboard";
import { BlinkConcierge } from "@/components/BlinkConcierge";
import { CustomIcons } from "@/components/CustomIcons";
import { ItineraryUpload } from "@/components/ItineraryUpload";
import { LocalIntelRequest } from "@/components/LocalIntelRequest";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

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
            { id: "itinerary", label: "Share Itinerary", icon: "✈️" },
            { id: "local", label: "Local Intel", icon: "🗺️" },
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
          {activeTab === "trust" && <EnhancedTrustMetrics />}
          {activeTab === "itinerary" && <ItineraryUpload />}
          {activeTab === "local" && <LocalIntelRequest />}
        </div>
      </div>

      {/* Floating Blink Concierge - Only show on non-feed tabs as a contextual helper */}
      {activeTab !== "feed" && (
        <BlinkConcierge 
          contextType="generic"
          isFloating={true}
        />
      )}
    </div>
  );
};

export default Index;

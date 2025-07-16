
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import MusicReactiveHero from "@/components/MusicReactiveHero";
import { SocialFeed } from "@/components/SocialFeed";
import { TrustMetrics } from "@/components/TrustMetrics";
import { AgentDashboard } from "@/components/AgentDashboard";
import { BlinkChatPanel } from "@/components/BlinkChatPanel";
import { LeftSideMenu } from "@/components/LeftSideMenu";
import { CustomIcons } from "@/components/CustomIcons";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Handle tab navigation from hamburger menu
  useEffect(() => {
    if (location.state?.activeTab && location.state.activeTab !== activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location.state, activeTab]);

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
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      <Navbar />
      
      {/* Music Reactive Hero Section wrapped in neobrutalist container */}
      <div className="p-6 bg-gray-100">
        <div className="neo-brutalist bg-white">
          <MusicReactiveHero userName={user?.fullName || user?.email?.split('@')[0]?.toUpperCase() || "WELCOME"} />
        </div>
      </div>
      
      {/* Main Content with Left Menu and Right Blink Panel */}
      <div className="flex min-h-screen">
        {/* Left Side Menu */}
        <LeftSideMenu activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Main Content Area - Always centered */}
        <div className="flex-1 flex justify-center">
          <div className="w-full max-w-4xl p-6">
            {/* Current Tab Indicator */}
            <div className="mb-8 text-center">
              <div className="neo-brutalist bg-white text-black px-6 py-3 inline-block">
                <span className="font-black text-xl uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                  {activeTab === "feed" && "🌐 GLOBAL FEED"}
                  {activeTab === "agents" && "🤖 AI AGENTS"}
                  {activeTab === "trust" && "🔐 TRUST NETWORK"}
                  {activeTab === "travelers" && "✈️ CONNECTIONS"}
                </span>
              </div>
            </div>

            {/* Tab Content */}
            <div>
              {activeTab === "feed" && <SocialFeed />}
              {activeTab === "agents" && <AgentDashboard />}
              {activeTab === "trust" && <TrustMetrics />}
              {activeTab === "travelers" && (
                <div className="text-center py-12">
                  <div className="neo-brutalist bg-white p-8">
                    <h2 className="text-3xl font-black text-black mb-4 uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                      Traveler Connections
                    </h2>
                    <p className="text-black font-bold mb-8">Interactive 3D map to discover travelers coming to any city worldwide</p>
                    <Button 
                      onClick={() => navigate('/traveler-world-map')}
                      className="neo-brutalist bg-lime-400 text-black hover:bg-lime-500 px-8 py-4 font-black uppercase"
                      style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}
                    >
                      🌍 Launch 3D Map
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


      </div>


    </div>
  );
};

export default Index;

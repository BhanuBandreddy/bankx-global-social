
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
import { Volume2, VolumeX } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
// Reddit integration runs invisibly in backend - no frontend UI needed

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [heroAudioMuted, setHeroAudioMuted] = useState(false);
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

  const toggleHeroAudio = () => {
    // This will communicate with the MusicReactiveHero component
    // Since the component manages its own audio, we'll add a global context or event
    setHeroAudioMuted(!heroAudioMuted);
    
    // Dispatch custom event to communicate with the hero component
    window.dispatchEvent(new CustomEvent('toggleHeroAudio', { 
      detail: { muted: !heroAudioMuted } 
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      <Navbar />
      
      {/* Global Audio Mute Button */}
      <button
        onClick={toggleHeroAudio}
        className="fixed top-6 left-6 neo-brutalist bg-white bg-opacity-90 hover:bg-opacity-100 p-3 z-50 transition-all duration-200"
        title={heroAudioMuted ? "Unmute Hero Audio" : "Mute Hero Audio"}
      >
        {heroAudioMuted ? (
          <VolumeX className="w-6 h-6 text-black" />
        ) : (
          <Volume2 className="w-6 h-6 text-black" />
        )}
      </button>
      
      {/* Music Reactive Hero Section wrapped in neobrutalist container */}
      <div className="p-6 bg-gray-100">
        <div className="neo-brutalist bg-white">
          <MusicReactiveHero userName={user?.fullName || user?.email?.split('@')[0]?.toUpperCase() || "WELCOME"} />
        </div>
      </div>
      
      {/* Main Content with Left Menu */}
      <div className="flex h-screen">
        {/* Left Side Menu */}
        <LeftSideMenu activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
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

            {/* Content Based on Active Tab */}
            <div className="max-w-7xl mx-auto">
              {activeTab === "feed" && (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                  {/* Main Feed - larger and centered */}
                  <div className="xl:col-span-3">
                    <SocialFeed />
                  </div>
                  
                  {/* Right Side Panel - larger */}
                  <div className="xl:col-span-1">
                    <div className="sticky top-6">
                      <BlinkChatPanel />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === "agents" && (
                <div className="max-w-6xl mx-auto">
                  <AgentDashboard />
                </div>
              )}
              
              {activeTab === "trust" && (
                <div className="max-w-6xl mx-auto">
                  <TrustMetrics />
                </div>
              )}
              
              {activeTab === "travelers" && (
                <div className="max-w-4xl mx-auto text-center py-12">
                  <div className="neo-brutalist bg-white p-12">
                    <h2 className="text-4xl font-black text-black mb-6 uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
                      Traveler Connections
                    </h2>
                    <p className="text-black font-bold mb-12 text-lg">Interactive 3D map to discover travelers coming to any city worldwide</p>
                    <Button 
                      onClick={() => navigate('/traveler-world-map')}
                      className="neo-brutalist bg-lime-400 text-black hover:bg-lime-500 px-12 py-6 font-black uppercase text-lg"
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

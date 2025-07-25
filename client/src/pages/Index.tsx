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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <Navbar />

      {/* Global Audio Mute Button - Fixed Position Below Navbar */}
      <button
        onClick={toggleHeroAudio}
        className="fixed top-20 right-4 neo-brutalist bg-white bg-opacity-90 hover:bg-opacity-100 p-3 z-[9999] transition-all duration-200"
        title={heroAudioMuted ? "Unmute Hero Audio" : "Mute Hero Audio"}
        style={{ position: 'fixed' }}
      >
        {heroAudioMuted ? (
          <VolumeX className="w-6 h-6 text-black" />
        ) : (
          <Volume2 className="w-6 h-6 text-black" />
        )}
      </button>

      {/* Compressed Hero Section - Desktop 550px, Mobile 350px */}
      <div className="px-6 pt-6 pb-4 bg-gray-100">
        <div className="neo-card bg-white h-[550px] md:h-[550px] sm:h-[350px] overflow-hidden">
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
              <div className="neo-button neo-button-yellow text-black px-8 py-4 inline-block">
                <span className="font-black text-2xl uppercase" style={{ fontFamily: 'Archivo Black, sans-serif', letterSpacing: '2px' }}>
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
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Main Feed - 66% width with 40px margins on desktop */}
                  <div className="flex-1 lg:max-w-[66%] mx-0 lg:mx-10">
                    <SocialFeed />
                  </div>

                  {/* Divider between menu and chat - 32px spacing (desktop only) */}
                  <div className="hidden lg:block w-1 bg-black mr-8"></div>

                  {/* Right Side Panel with proper spacing */}
                  <div className="w-full lg:w-80">
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
                    <button 
                      onClick={() => navigate('/traveler-discovery')}
                      className="neo-button neo-button-green px-12 py-6 font-black text-lg"
                      style={{ fontFamily: 'Archivo Black, sans-serif', letterSpacing: '1px' }}
                    >
                      🌍 View Connections
                    </button>
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
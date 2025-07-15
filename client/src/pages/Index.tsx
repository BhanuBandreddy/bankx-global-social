
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SocialFeed } from "@/components/SocialFeed";
import { TrustMetrics } from "@/components/TrustMetrics";
import { AgentDashboard } from "@/components/AgentDashboard";
import { ChatSidebar } from "@/components/ChatSidebar";
import { CustomIcons } from "@/components/CustomIcons";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, loading } = useAuth();
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
      
      {/* Hero Section */}
      <Hero />
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
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
        <div className={`relative transition-all duration-300 ${isChatOpen ? 'mr-96' : ''}`}>
          {activeTab === "feed" && <SocialFeed />}
          {activeTab === "agents" && <AgentDashboard />}
          {activeTab === "trust" && <TrustMetrics />}
          {activeTab === "travelers" && (
            <div className="text-center py-12">
              <div className="neo-brutalist bg-white p-8 max-w-2xl mx-auto">
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

      {/* Floating Blink Button */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsChatOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] font-black uppercase rounded-none"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            BLINK
          </Button>
        </div>
      )}

      {/* Chat Sidebar */}
      <ChatSidebar 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)} 
      />
    </div>
  );
};

export default Index;

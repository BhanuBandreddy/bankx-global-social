
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
            { id: "travelers", label: "3D Traveler Discovery", icon: "✈️" },
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

        {/* Content Based on Active Tab */}
        <div className={`relative transition-all duration-300 ${isChatOpen ? 'mr-96' : ''}`}>
          {activeTab === "feed" && <SocialFeed />}
          {activeTab === "agents" && <AgentDashboard />}
          {activeTab === "trust" && <TrustMetrics />}
          {activeTab === "travelers" && (
            <div className="text-center py-12">
              <h2 className="text-3xl font-bold text-white mb-4">Connections</h2>
              <p className="text-gray-300 mb-8">Interactive 3D map to discover travelers coming to any city worldwide</p>
              <Button 
                onClick={() => navigate('/traveler-world-map')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 border-4 border-black shadow-[4px_4px_0px_0px_#000] font-black uppercase rounded-none"
              >
                🌍 Launch 3D Map
              </Button>
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

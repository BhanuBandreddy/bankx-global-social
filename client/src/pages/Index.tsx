
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { MusicReactiveHero } from "@/components/MusicReactiveHero";
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
    <div className="min-h-screen bg-black" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      {/* Music Reactive Hero Section - Full Screen */}
      <MusicReactiveHero />
      
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

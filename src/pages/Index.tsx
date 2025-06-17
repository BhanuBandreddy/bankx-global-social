
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { SocialFeed } from "@/components/SocialFeed";
import { TrustMetrics } from "@/components/TrustMetrics";
import { AgentDashboard } from "@/components/AgentDashboard";
import { CustomIcons } from "@/components/CustomIcons";
import { LogisticsActivity } from "@/components/LogisticsActivity";
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

  // Mock logistics activities for social feed integration
  const logisticsActivities = [
    {
      type: 'delivery_request' as const,
      title: 'Delivery Request: Paris → London',
      description: 'Need someone traveling from Paris to London to carry a handmade scarf. Small package, high trust required.',
      route: 'Paris → London',
      trustScore: 95,
      timeframe: 'Next 3 days',
      price: '€25',
      badges: ['Fragile', 'Handmade', 'Express']
    },
    {
      type: 'delivery_offer' as const,
      title: 'Offering Delivery: Tokyo → NYC',
      description: 'Frequent business traveler offering delivery service for small items. Verified carrier with 98% success rate.',
      route: 'Tokyo → New York',
      trustScore: 98,
      timeframe: 'Weekly trips',
      price: '$40',
      badges: ['Business Traveler', 'Verified', 'Electronics OK']
    }
  ];

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
          {activeTab === "feed" && (
            <div className="space-y-6">
              <SocialFeed />
              
              {/* Logistics Activities Section */}
              <div className="bg-gray-900 border-4 border-orange-400 p-6">
                <h2 className="text-2xl font-black text-orange-400 mb-4 uppercase">
                  🚚 PathSync Logistics Activity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {logisticsActivities.map((activity, idx) => (
                    <LogisticsActivity key={idx} {...activity} />
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === "agents" && <AgentDashboard />}
          {activeTab === "trust" && <TrustMetrics />}
        </div>
      </div>
    </div>
  );
};

export default Index;

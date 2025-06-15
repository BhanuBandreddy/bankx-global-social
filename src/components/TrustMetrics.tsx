
import { useState } from "react";
import { Shield, TrendingUp, Users, Globe, Zap, Eye } from "lucide-react";

export const TrustMetrics = () => {
  const [selectedMetric, setSelectedMetric] = useState("global");

  const trustData = {
    global: {
      score: 94.2,
      trend: "+2.4%",
      connections: "2.8M",
      volume: "$12.4M",
      description: "Global network health"
    },
    personal: {
      score: 87.6,
      trend: "+5.1%", 
      connections: "847",
      volume: "$24.6K",
      description: "Your trust network"
    },
    ai: {
      score: 96.8,
      trend: "+1.2%",
      connections: "∞",
      volume: "Real-time",
      description: "AI agent reliability"
    }
  };

  const recentActivity = [
    { user: "Maya Chen", action: "Verified purchase", trust: "+0.3", time: "2m ago", location: "Tokyo" },
    { user: "Alex Rivers", action: "Completed delivery", trust: "+0.8", time: "5m ago", location: "São Paulo" },
    { user: "Zara Okafor", action: "Positive review", trust: "+0.2", time: "8m ago", location: "Lagos" },
    { user: "Kim Park", action: "Dispute resolved", trust: "+1.2", time: "12m ago", location: "Seoul" },
    { user: "Riley Johnson", action: "Payment confirmed", trust: "+0.5", time: "15m ago", location: "NYC" }
  ];

  const currentData = trustData[selectedMetric as keyof typeof trustData];

  return (
    <div className="max-w-4xl mx-auto bg-white border-4 border-black">
      {/* Header */}
      <div className="p-6 border-b-4 border-black bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-black uppercase tracking-tight">Trust Network</h2>
            <p className="text-gray-600 font-medium mt-1">Real-time trust flows across Global Social</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-400 border-2 border-black rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-black">LIVE TRACKING</span>
          </div>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="p-6 bg-gray-50 border-b-4 border-black">
        <div className="flex space-x-4">
          {[
            { key: "global", label: "Global Network", icon: Globe },
            { key: "personal", label: "Your Network", icon: Users },
            { key: "ai", label: "AI Reliability", icon: Zap }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key)}
              className={`px-6 py-3 font-bold border-4 border-black transition-all duration-200 transform ${
                selectedMetric === key
                  ? "bg-lime-400 text-black shadow-[8px_8px_0px_0px_#000] translate-x-[-4px] translate-y-[-4px]"
                  : "bg-white text-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Trust Display */}
      <div className="p-6 bg-white">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Trust Score Circle */}
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 bg-gray-100 border-8 border-black rounded-full flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-4xl font-black text-black">{currentData.score}%</div>
                <div className="text-sm font-bold text-gray-600 uppercase">{currentData.description}</div>
              </div>
              <div className={`absolute -top-2 -right-2 px-2 py-1 border-2 border-black font-bold text-xs ${
                currentData.trend.startsWith('+') ? 'bg-green-400 text-green-800' : 'bg-red-400 text-red-800'
              }`}>
                {currentData.trend}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-4 bg-gray-50 border-4 border-black text-center">
                <div className="text-xl font-bold text-black">{currentData.connections}</div>
                <div className="text-sm font-medium text-gray-600">CONNECTIONS</div>
              </div>
              <div className="p-4 bg-gray-50 border-4 border-black text-center">
                <div className="text-xl font-bold text-black">{currentData.volume}</div>
                <div className="text-sm font-medium text-gray-600">VOLUME</div>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="w-5 h-5 text-black" />
              <h3 className="text-xl font-bold text-black uppercase">Live Trust Activity</h3>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-4 bg-gray-50 border-3 border-gray-300 hover:border-black transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-black">{activity.user}</span>
                        <span className="text-sm text-gray-500">• {activity.location}</span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{activity.action}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">{activity.trust}</div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust Insights */}
      <div className="p-6 bg-lime-50 border-t-4 border-black">
        <div className="flex items-start space-x-4">
          <Shield className="w-8 h-8 text-lime-600 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-black mb-2">AI Trust Insights</h3>
            <p className="text-black leading-relaxed">
              Your trust network is performing <span className="font-bold">87% above average</span>. 
              Recent positive interactions in Tokyo and São Paulo have strengthened your global connections. 
              <span className="font-bold text-lime-700"> AI agents suggest expanding into African markets</span> based on emerging trust patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

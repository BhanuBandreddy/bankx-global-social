
import { useState } from "react";
import { TrendingUp, Eye, Zap, Users, Trophy, Star } from "lucide-react";
import { CustomIcons } from "./CustomIcons";

export const TrustMetrics = () => {
  const [selectedMetric, setSelectedMetric] = useState("global");
  const [userLevel, setUserLevel] = useState(7);
  const [trustPoints, setTrustPoints] = useState(2847);

  const trustData = {
    global: {
      score: 94.2,
      trend: "+2.4%",
      connections: "2.8M",
      volume: "$12.4M",
      description: "Global vibe check",
      level: "Oracle Master"
    },
    personal: {
      score: 87.6,
      trend: "+5.1%", 
      connections: "847",
      volume: "$24.6K",
      description: "Your trust energy",
      level: "Trust Warrior"
    },
    ai: {
      score: 96.8,
      trend: "+1.2%",
      connections: "∞",
      volume: "Real-time",
      description: "AI trust vibes",
      level: "Digital Sage"
    }
  };

  const trustChallenges = [
    { id: 1, title: "First Purchase Power", description: "Make your first verified purchase", reward: "+50 TP", completed: true, icon: "🎯" },
    { id: 2, title: "Global Connector", description: "Connect with 3 different countries", reward: "+100 TP", completed: true, icon: "🌍" },
    { id: 3, title: "Review Royalty", description: "Leave 5 helpful reviews", reward: "+75 TP", completed: false, icon: "⭐" },
    { id: 4, title: "Dispute Resolver", description: "Help resolve community disputes", reward: "+200 TP", completed: false, icon: "🤝" }
  ];

  const recentVibes = [
    { user: "Maya Chen", action: "just copped that vintage cam", trust: "+0.3", time: "2m", location: "Tokyo", vibe: "🔥" },
    { user: "Alex Rivers", action: "shipped grandma's brigadeiros worldwide", trust: "+0.8", time: "5m", location: "São Paulo", vibe: "❤️" },
    { user: "Zara Okafor", action: "saving oceans one earring at a time", trust: "+0.2", time: "8m", location: "Lagos", vibe: "🌊" },
    { user: "Kim Park", action: "resolved payment drama like a boss", trust: "+1.2", time: "12m", location: "Seoul", vibe: "👑" },
    { user: "Riley Johnson", action: "payment confirmed, trust flowing", trust: "+0.5", time: "15m", location: "NYC", vibe: "💰" }
  ];

  const currentData = trustData[selectedMetric as keyof typeof trustData];

  return (
    <div className="max-w-4xl mx-auto bg-white border-4 border-black">
      {/* Header with Gamification */}
      <div className="p-6 border-b-4 border-black bg-gradient-to-r from-lime-100 to-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-black uppercase tracking-tight">Trust Oracle 🔮</h2>
            <p className="text-gray-600 font-medium mt-1">Your trust energy in the global vibe network</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-black">{trustPoints}</div>
              <div className="text-xs font-bold text-gray-600">TRUST POINTS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-black">L{userLevel}</div>
              <div className="text-xs font-bold text-gray-600">LEVEL</div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 border-2 border-black h-4">
          <div className="bg-lime-400 h-full border-r-2 border-black" style={{width: '73%'}}></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-600 mt-1">
          <span>Level {userLevel}</span>
          <span>730/1000 XP to Level {userLevel + 1}</span>
        </div>
      </div>

      {/* Trust Challenges */}
      <div className="p-6 border-b-4 border-black bg-gray-50">
        <h3 className="text-xl font-bold text-black mb-4 flex items-center">
          <Trophy className="w-6 h-6 mr-2" />
          DAILY TRUST CHALLENGES
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trustChallenges.map((challenge) => (
            <div key={challenge.id} className={`p-4 border-4 border-black ${challenge.completed ? 'bg-lime-200' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{challenge.icon}</span>
                  <div>
                    <div className="font-bold text-black">{challenge.title}</div>
                    <div className="text-sm text-gray-600">{challenge.description}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-green-600">{challenge.reward}</div>
                  {challenge.completed && <div className="text-xs text-green-800">COMPLETED ✓</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metric Selector */}
      <div className="p-6 bg-gray-50 border-b-4 border-black">
        <div className="flex space-x-4">
          {[
            { key: "global", label: "Global Vibes", icon: CustomIcons.Globe },
            { key: "personal", label: "Your Energy", icon: CustomIcons.Trust },
            { key: "ai", label: "AI Wisdom", icon: CustomIcons.Lightning }
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
            <div className="relative w-48 h-48 bg-gradient-to-br from-lime-100 to-blue-100 border-8 border-black rounded-full flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-4xl font-black text-black">{currentData.score}%</div>
                <div className="text-sm font-bold text-gray-600 uppercase">{currentData.description}</div>
                <div className="text-xs font-bold text-lime-700 mt-1">{currentData.level}</div>
              </div>
              <div className={`absolute -top-2 -right-2 px-2 py-1 border-2 border-black font-bold text-xs ${
                currentData.trend.startsWith('+') ? 'bg-green-400 text-green-800' : 'bg-red-400 text-red-800'
              }`}>
                {currentData.trend}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-4 bg-lime-50 border-4 border-black text-center">
                <div className="text-xl font-bold text-black">{currentData.connections}</div>
                <div className="text-sm font-medium text-gray-600">CONNECTIONS</div>
              </div>
              <div className="p-4 bg-blue-50 border-4 border-black text-center">
                <div className="text-xl font-bold text-black">{currentData.volume}</div>
                <div className="text-sm font-medium text-gray-600">VOLUME</div>
              </div>
            </div>
          </div>

          {/* Live Vibe Feed */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Eye className="w-5 h-5 text-black" />
              <h3 className="text-xl font-bold text-black uppercase">Live Trust Vibes</h3>
            </div>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentVibes.map((vibe, index) => (
                <div key={index} className="p-4 bg-gray-50 border-3 border-gray-300 hover:border-black transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{vibe.vibe}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-black">{vibe.user}</span>
                          <span className="text-sm text-gray-500">• {vibe.location}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{vibe.action}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">{vibe.trust}</div>
                      <div className="text-xs text-gray-500">{vibe.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Trust Insights */}
      <div className="p-6 bg-lime-50 border-t-4 border-black">
        <div className="flex items-start space-x-4">
          <CustomIcons.Sparkle className="w-8 h-8 text-lime-600 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-black mb-2">AI Oracle Insights ✨</h3>
            <p className="text-black leading-relaxed">
              Your trust energy is <span className="font-bold">absolutely vibing</span> at 87% above average! 
              Recent connections in Tokyo and São Paulo are <span className="font-bold text-lime-700">boosting your global aura</span>. 
              The AI Oracle suggests <span className="font-bold text-blue-700">diving into African markets</span> - 
              major trust waves are building there! 🌊
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

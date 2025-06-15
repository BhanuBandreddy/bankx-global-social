
import { useState } from "react";
import { TrendingUp, MessageSquare } from "lucide-react";
import { CustomIcons } from "./CustomIcons";

export const AgentDashboard = () => {
  const [selectedAgent, setSelectedAgent] = useState("trust");

  const agents = {
    trust: {
      name: "Trust Oracle",
      status: "Active",
      icon: CustomIcons.Trust,
      color: "lime",
      description: "Analyzing trust patterns across 2.8M users",
      actions: ["Verified 847 transactions", "Detected 3 anomalies", "Updated 234 trust scores"],
      efficiency: 98.7
    },
    commerce: {
      name: "Commerce Conductor", 
      status: "Active",
      icon: CustomIcons.Shop,
      color: "blue",
      description: "Orchestrating seamless global payments",
      actions: ["Processed $12.4K payments", "Optimized 156 routes", "Saved $890 in fees"],
      efficiency: 96.3
    },
    discovery: {
      name: "Discovery Engine",
      status: "Learning",
      icon: CustomIcons.Globe, 
      color: "purple",
      description: "Connecting users with perfect matches",
      actions: ["Made 1,247 recommendations", "Matched 89 interests", "Found 23 rare items"],
      efficiency: 94.8
    },
    logistics: {
      name: "Logistics Wizard",
      status: "Active",
      icon: CustomIcons.Lightning,
      color: "orange", 
      description: "Optimizing delivery routes globally",
      actions: ["Coordinated 234 shipments", "Reduced 12 delays", "Cut costs by 18%"],
      efficiency: 97.1
    }
  };

  const currentAgent = agents[selectedAgent as keyof typeof agents];

  const recentActions = [
    { agent: "Trust Oracle", action: "Verified Maya Chen's camera purchase", impact: "Trust +0.3", time: "Just now" },
    { agent: "Commerce Conductor", action: "Optimized payment route via São Paulo", impact: "Saved $12", time: "2m ago" },
    { agent: "Discovery Engine", action: "Found rare vinyl for @musiclover", impact: "Perfect match", time: "3m ago" },
    { agent: "Logistics Wizard", action: "Rerouted Lagos shipment", impact: "2 days faster", time: "5m ago" },
    { agent: "Trust Oracle", action: "Analyzed network patterns", impact: "94.2% healthy", time: "7m ago" }
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white border-4 border-black">
      {/* Header */}
      <div className="p-6 border-b-4 border-black bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-black uppercase tracking-tight">AI Agent Control</h2>
            <p className="text-gray-600 font-medium mt-1">Your invisible workforce making magic happen</p>
          </div>
          <div className="flex items-center space-x-2">
            <CustomIcons.Sparkle className="w-6 h-6 text-black" />
            <span className="text-sm font-bold text-black">4 AGENTS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Agent Selector */}
      <div className="p-6 bg-gray-50 border-b-4 border-black">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(agents).map(([key, agent]) => {
            const IconComponent = agent.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedAgent(key)}
                className={`p-4 border-4 border-black transition-all duration-200 transform ${
                  selectedAgent === key
                    ? `bg-${agent.color}-400 shadow-[8px_8px_0px_0px_#000] translate-x-[-4px] translate-y-[-4px]`
                    : "bg-white shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                }`}
              >
                <div className="text-center">
                  <IconComponent className={`w-8 h-8 mx-auto mb-2 ${selectedAgent === key ? 'text-black' : 'text-gray-600'}`} />
                  <div className={`text-sm font-bold ${selectedAgent === key ? 'text-black' : 'text-gray-600'}`}>
                    {agent.name}
                  </div>
                  <div className={`text-xs mt-1 px-2 py-1 border-2 border-black ${
                    agent.status === 'Active' ? 'bg-green-300' : 'bg-yellow-300'
                  }`}>
                    {agent.status}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Agent Details */}
      <div className="p-6 bg-white">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Agent Info */}
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <div className={`w-16 h-16 bg-${currentAgent.color}-400 border-4 border-black flex items-center justify-center`}>
                <currentAgent.icon className="w-8 h-8 text-black" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black">{currentAgent.name}</h3>
                <p className="text-gray-600 font-medium">{currentAgent.description}</p>
              </div>
            </div>

            {/* Efficiency Meter */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-black uppercase">Efficiency</span>
                <span className="text-lg font-bold text-black">{currentAgent.efficiency}%</span>
              </div>
              <div className="w-full bg-gray-200 border-4 border-black h-6">
                <div 
                  className={`h-full bg-${currentAgent.color}-400 border-r-4 border-black transition-all duration-1000`}
                  style={{ width: `${currentAgent.efficiency}%` }}
                ></div>
              </div>
            </div>

            {/* Recent Actions */}
            <div>
              <h4 className="text-lg font-bold text-black mb-4 uppercase">Recent Actions</h4>
              <div className="space-y-3">
                {currentAgent.actions.map((action, index) => (
                  <div key={index} className="p-3 bg-gray-50 border-3 border-gray-300">
                    <div className="flex items-center space-x-2">
                      <CustomIcons.Lightning className="w-4 h-4 text-black" />
                      <span className="text-black font-medium">{action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Activity Stream */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-black" />
              <h3 className="text-xl font-bold text-black uppercase">Live Agent Activity</h3>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentActions.map((action, index) => (
                <div key={index} className="p-4 bg-gray-50 border-3 border-gray-300 hover:border-black transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-black text-sm">{action.agent}</div>
                      <div className="text-black mt-1 leading-relaxed">{action.action}</div>
                      <div className="text-sm font-medium text-green-600 mt-2">{action.impact}</div>
                    </div>
                    <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {action.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Agent Insights */}
      <div className="p-6 bg-purple-50 border-t-4 border-black">
        <div className="flex items-start space-x-4">
          <TrendingUp className="w-8 h-8 text-purple-600 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-black mb-2">AI Network Insights</h3>
            <p className="text-black leading-relaxed">
              Your AI agents are operating at <span className="font-bold">96.7% collective efficiency</span>. 
              The Trust Oracle has identified new patterns in Asian markets, while the Commerce Conductor 
              has optimized payment routes saving users an average of <span className="font-bold text-purple-700">23% on fees</span>. 
              Discovery Engine is learning your preferences and improving recommendations daily.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};



import { useState } from "react";
import { TrendingUp, MessageSquare, Globe2, LockKeyhole, SearchCheck, Navigation2 } from "lucide-react";
import { useNandaAgents } from "@/lib/useNandaAgents";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap = {
  "globe-2": Globe2,
  "lock-keyhole": LockKeyhole,
  "search-check": SearchCheck,
  "navigation-2": Navigation2,
};

export const AgentDashboard = () => {
  const [selectedAgent, setSelectedAgent] = useState(0);
  const { data: agents, error } = useNandaAgents("travel_commerce");

  // Show skeleton loader while data is loading
  if (!agents || agents.length === 0) {
    return (
      <div className="max-w-6xl mx-auto bg-white border-4 border-black">
        <div className="p-6 border-b-4 border-black bg-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-black uppercase tracking-tight">Global Socials AI Agents</h2>
              <p className="text-gray-600 font-medium mt-1">Loading agents from Nanda registry...</p>
            </div>
            <Skeleton className="h-6 w-32" />
          </div>
        </div>
        
        <div className="p-6 bg-gray-50 border-b-4 border-black">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
        
        <div className="p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto bg-white border-4 border-black">
        <div className="p-6 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Agents</h2>
          <p className="text-gray-600">Failed to load agents from Nanda registry</p>
        </div>
      </div>
    );
  }

  const currentAgent = agents[selectedAgent] || agents[0];

  const recentActions = [
    { agent: "GlobeGuides™ Concierge", action: "Auto-booked local ramen spot in Shibuya", impact: "Zero tourist traps", time: "Just now" },
    { agent: "TrustPay Orchestrator", action: "Funds released after merchant confirmation", impact: "Safe transaction", time: "2m ago" },
    { agent: "LocaleLens AI", action: "Found hidden jazz club via quilt data", impact: "Perfect local match", time: "3m ago" },
    { agent: "PathSync Social Logistics", action: "Fellow traveller collecting your package", impact: "Crowd-sourced delivery", time: "5m ago" },
  ];

  return (
    <div className="max-w-6xl mx-auto bg-white border-4 border-black">
      {/* Header */}
      <div className="p-6 border-b-4 border-black bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-black uppercase tracking-tight">Global Socials AI Agents</h2>
            <p className="text-gray-600 font-medium mt-1">Neo-brutalist agent ecosystem from Nanda registry</p>
          </div>
          <div className="flex items-center space-x-2">
            <Globe2 className="w-6 h-6 text-black stroke-[2.5]" />
            <span className="text-sm font-bold text-black">{agents.length} AGENTS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Agent Selector */}
      <div className="p-6 bg-gray-50 border-b-4 border-black">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {agents.map((agent, index) => {
            const IconComponent = iconMap[agent.icon] || Globe2;
            return (
              <button
                key={agent.id || index}
                onClick={() => setSelectedAgent(index)}
                className={`p-4 border-4 border-black transition-all duration-200 transform ${
                  selectedAgent === index
                    ? "bg-lime-400 shadow-[8px_8px_0px_0px_#000] translate-x-[-4px] translate-y-[-4px]"
                    : "bg-white shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                }`}
              >
                <div className="text-center">
                  <IconComponent className={`w-8 h-8 mx-auto mb-2 stroke-[2.5] ${
                    selectedAgent === index ? 'text-black' : 'text-gray-600'
                  }`} />
                  <div className={`text-sm font-bold ${selectedAgent === index ? 'text-black' : 'text-gray-600'}`}>
                    {agent.name || `Agent ${index + 1}`}
                  </div>
                  <div className={`text-xs mt-1 px-2 py-1 border-2 border-black ${
                    agent.status === 'active' ? 'bg-green-300' : 'bg-yellow-300'
                  }`}>
                    {agent.status || 'Active'}
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
              {(() => {
                const IconComponent = iconMap[currentAgent?.icon] || Globe2;
                return (
                  <div className="w-16 h-16 bg-lime-400 border-4 border-black flex items-center justify-center">
                    <IconComponent className="w-8 h-8 text-black stroke-[2.5]" />
                  </div>
                );
              })()}
              <div>
                <h3 className="text-2xl font-bold text-black">{currentAgent?.name || 'Agent'}</h3>
                <p className="text-purple-700 font-bold text-lg italic">"{currentAgent?.tagline || 'Tagline'}"</p>
                <p className="text-gray-600 font-medium mt-1">{currentAgent?.description || 'Description'}</p>
              </div>
            </div>

            {/* Capabilities */}
            {currentAgent?.capabilities && (
              <div className="mb-6">
                <h4 className="text-lg font-bold text-black mb-4 uppercase">Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {currentAgent.capabilities.map((capability, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 border-2 border-gray-300 text-sm font-medium">
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Agent Details */}
            <div>
              <h4 className="text-lg font-bold text-black mb-4 uppercase">Agent Info</h4>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 border-3 border-gray-300">
                  <strong>ID:</strong> {currentAgent?.id || 'N/A'}
                </div>
                <div className="p-3 bg-gray-50 border-3 border-gray-300">
                  <strong>Version:</strong> {currentAgent?.version || 'N/A'}
                </div>
                <div className="p-3 bg-gray-50 border-3 border-gray-300">
                  <strong>Performance:</strong> {currentAgent?.performance_score || 'N/A'}%
                </div>
                <div className="p-3 bg-gray-50 border-3 border-gray-300">
                  <strong>Region:</strong> {currentAgent?.region || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Live Activity Stream */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="w-5 h-5 text-black stroke-[2.5]" />
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

      {/* Global Socials Insights */}
      <div className="p-6 bg-purple-50 border-t-4 border-black">
        <div className="flex items-start space-x-4">
          <TrendingUp className="w-8 h-8 text-purple-600 mt-1 stroke-[2.5]" />
          <div>
            <h3 className="text-lg font-bold text-black mb-2">Global Socials Network Insights</h3>
            <p className="text-black leading-relaxed">
              Currently showing <span className="font-bold">{agents.length} neo-brutalist agents</span> from the Nanda registry. 
              These agents form the backbone of Global Socials' crowd-sourced travel and commerce ecosystem. 
              The registry provides <span className="font-bold text-purple-700">real-time agent discovery</span> 
              for seamless integration with zero tourist traps.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

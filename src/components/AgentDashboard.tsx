
import { Bot, Zap, Shield, TrendingUp, Activity, CheckCircle } from "lucide-react";

export const AgentDashboard = () => {
  const agents = [
    {
      id: 1,
      name: "Commerce Navigator",
      type: "Product Discovery",
      status: "active",
      description: "Intelligent product matching and price optimization across global markets",
      metrics: {
        accuracy: 98.7,
        transactions: 1420,
        saved: "$12,450"
      },
      icon: <Bot className="w-6 h-6" />,
      color: "from-emerald-400 to-emerald-500"
    },
    {
      id: 2,
      name: "Trust Guardian",
      type: "Security & Verification",
      status: "active",
      description: "Advanced identity verification and transaction monitoring for maximum security",
      metrics: {
        accuracy: 99.2,
        blocked: 47,
        verified: 892
      },
      icon: <Shield className="w-6 h-6" />,
      color: "from-blue-400 to-blue-500"
    },
    {
      id: 3,
      name: "Social Catalyst",
      type: "Community Building",
      status: "active",
      description: "Facilitates meaningful connections and curates personalized social commerce experiences",
      metrics: {
        connections: 2341,
        engagement: 94.8,
        communities: 28
      },
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-purple-400 to-purple-500"
    },
    {
      id: 4,
      name: "Journey Optimizer",
      type: "Travel Integration",
      status: "learning",
      description: "Analyzes travel patterns to suggest relevant products and local experiences",
      metrics: {
        routes: 156,
        suggestions: 834,
        satisfaction: 96.1
      },
      icon: <Activity className="w-6 h-6" />,
      color: "from-amber-400 to-amber-500"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">AI Agent Ecosystem</h2>
        <p className="text-white/70 text-lg">Your personal AI collective working 24/7 to enhance your commerce experience</p>
        
        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-emerald-400">1.2M+</div>
            <div className="text-sm text-white/70">Transactions Processed</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-blue-400">99.7%</div>
            <div className="text-sm text-white/70">Trust Accuracy</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-purple-400">45K+</div>
            <div className="text-sm text-white/70">Active Agents</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="text-2xl font-bold text-amber-400">178</div>
            <div className="text-sm text-white/70">Countries Served</div>
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-300">
            {/* Agent Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${agent.color} rounded-xl flex items-center justify-center`}>
                  {agent.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{agent.name}</h3>
                  <p className="text-sm text-white/70">{agent.type}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${agent.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                <span className="text-sm text-white/70 capitalize">{agent.status}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/80 mb-6 leading-relaxed">{agent.description}</p>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(agent.metrics).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-lg font-bold text-white">
                    {typeof value === 'number' && key.includes('accuracy') ? `${value}%` : 
                     typeof value === 'number' && key.includes('saved') ? `$${value.toLocaleString()}` :
                     typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                  <div className="text-xs text-white/60 capitalize">{key}</div>
                </div>
              ))}
            </div>

            {/* Action Button */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <button className="w-full px-4 py-2 bg-gradient-to-r from-white/10 to-white/20 backdrop-blur-sm text-white rounded-lg border border-white/20 hover:from-white/20 hover:to-white/30 transition-all duration-300 flex items-center justify-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Configure Agent</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Communication Visualization */}
      <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Real-Time Agent Network</h3>
        <div className="relative">
          {/* Network Visualization */}
          <div className="flex justify-center items-center space-x-8 mb-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="flex-1 h-0.5 bg-gradient-to-r from-emerald-400 to-blue-400 animate-pulse"></div>
            
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Communication Log */}
          <div className="bg-black/30 rounded-xl p-4 max-h-32 overflow-y-auto">
            <div className="space-y-2 text-sm">
              <div className="text-emerald-400">→ Commerce Agent: Product verification complete for item #2847</div>
              <div className="text-blue-400">→ Trust Guardian: Identity verified for user @elena_travels</div>
              <div className="text-purple-400">→ Social Catalyst: Matching completed - 3 new connections</div>
              <div className="text-amber-400">→ Journey Optimizer: Route analysis updated for Tokyo region</div>
              <div className="text-emerald-400">→ Commerce Agent: Price optimization saved user $45.20</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

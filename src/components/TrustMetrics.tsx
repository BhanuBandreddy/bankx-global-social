
import { Shield, Users, Globe, TrendingUp, CheckCircle, AlertCircle, Activity, Award } from "lucide-react";

export const TrustMetrics = () => {
  const trustStats = {
    globalScore: 94.7,
    totalTransactions: 2847392,
    verifiedUsers: 156834,
    trustBridges: 45231,
    fraudPrevented: 99.8
  };

  const recentVerifications = [
    {
      id: 1,
      user: "Elena Rodriguez",
      type: "Identity Verification",
      status: "verified",
      timestamp: "2 minutes ago",
      trustIncrease: 2.4
    },
    {
      id: 2,
      user: "Marcus Thompson", 
      type: "Transaction Validation",
      status: "verified",
      timestamp: "5 minutes ago",
      trustIncrease: 1.8
    },
    {
      id: 3,
      user: "Sofia Chen",
      type: "Community Endorsement",
      status: "verified", 
      timestamp: "8 minutes ago",
      trustIncrease: 3.1
    },
    {
      id: 4,
      user: "Anonymous User",
      type: "Suspicious Activity",
      status: "blocked",
      timestamp: "12 minutes ago",
      riskLevel: "high"
    }
  ];

  const trustNetworkNodes = [
    { name: "Asia-Pacific", users: 45231, score: 96.2, growth: 12.4 },
    { name: "Europe", users: 38947, score: 94.8, growth: 8.7 },
    { name: "North America", users: 42156, score: 95.3, growth: 15.2 },
    { name: "Latin America", users: 18674, score: 93.1, growth: 22.8 },
    { name: "Africa", users: 11826, score: 91.4, growth: 28.3 }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-white mb-4">Global Trust Network</h2>
        <p className="text-white/70 text-lg">Decentralized trust infrastructure powering secure global commerce</p>
      </div>

      {/* Global Trust Score */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8 text-center">
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
              <div className="w-28 h-28 bg-slate-900 rounded-full flex items-center justify-center">
                <div className="text-4xl font-bold text-white">{trustStats.globalScore}</div>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 w-12 h-12 bg-emerald-400 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Global Trust Score</h3>
        <p className="text-white/70">Verified by decentralized AI agent network</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-2xl font-bold text-white">{trustStats.verifiedUsers.toLocaleString()}</div>
              <div className="text-sm text-white/70">Verified Users</div>
            </div>
          </div>
          <div className="text-xs text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12.4% this month</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Activity className="w-8 h-8 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{trustStats.totalTransactions.toLocaleString()}</div>
              <div className="text-sm text-white/70">Transactions</div>
            </div>
          </div>
          <div className="text-xs text-blue-400 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+8.7% this week</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="w-8 h-8 text-purple-400" />
            <div>
              <div className="text-2xl font-bold text-white">{trustStats.trustBridges.toLocaleString()}</div>
              <div className="text-sm text-white/70">Trust Bridges</div>
            </div>
          </div>
          <div className="text-xs text-purple-400 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+15.2% this month</span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-8 h-8 text-amber-400" />
            <div>
              <div className="text-2xl font-bold text-white">{trustStats.fraudPrevented}%</div>
              <div className="text-sm text-white/70">Fraud Prevention</div>
            </div>
          </div>
          <div className="text-xs text-amber-400 flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Industry leading</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Trust Activities */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Real-Time Trust Activity</span>
          </h3>
          
          <div className="space-y-4">
            {recentVerifications.map((verification) => (
              <div key={verification.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    verification.status === 'verified' ? 'bg-emerald-400' : 'bg-red-400'
                  }`}>
                    {verification.status === 'verified' ? 
                      <CheckCircle className="w-4 h-4 text-white" /> : 
                      <AlertCircle className="w-4 h-4 text-white" />
                    }
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{verification.user}</div>
                    <div className="text-xs text-white/70">{verification.type}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  {verification.status === 'verified' ? (
                    <div className="text-emerald-400 text-sm font-medium">+{verification.trustIncrease}</div>
                  ) : (
                    <div className="text-red-400 text-sm font-medium">BLOCKED</div>
                  )}
                  <div className="text-xs text-white/50">{verification.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Trust Network */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Regional Trust Networks</span>
          </h3>
          
          <div className="space-y-4">
            {trustNetworkNodes.map((region) => (
              <div key={region.name} className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-white">{region.name}</div>
                  <div className="text-emerald-400 font-bold">{region.score}%</div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="text-white/70">{region.users.toLocaleString()} users</div>
                  <div className="text-emerald-400 flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{region.growth}%</span>
                  </div>
                </div>
                
                {/* Trust Score Bar */}
                <div className="mt-3 bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-blue-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${region.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Bridge Visualization */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Trust Bridge Network</h3>
        <p className="text-white/70 text-center mb-8">Decentralized verification creates unbreakable trust connections</p>
        
        <div className="relative overflow-hidden h-32">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center space-x-8">
              {/* Trust Nodes */}
              {[1, 2, 3, 4, 5].map((node) => (
                <div key={node} className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full flex items-center justify-center animate-pulse">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  {node < 5 && (
                    <div className="absolute top-1/2 -right-6 w-8 h-0.5 bg-gradient-to-r from-emerald-400 to-blue-400 animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <div className="text-emerald-400 font-medium">45,231 Active Trust Bridges</div>
          <div className="text-white/60 text-sm">Connecting 178 countries worldwide</div>
        </div>
      </div>
    </div>
  );
};

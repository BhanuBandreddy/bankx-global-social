
import { useTrustMetricsEngine } from "@/hooks/useTrustMetricsEngine";
import { useWorkflowOrchestrator } from "@/hooks/useWorkflowOrchestrator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  TrendingUp, 
  Network, 
  Zap, 
  Users, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react";

export const ComprehensiveTrustDashboard = () => {
  const { metrics, agentPerformance, realTimeUpdates, loading } = useTrustMetricsEngine();
  const { workflows, agentCommunications } = useWorkflowOrchestrator();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-lime-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading comprehensive trust metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-4 border-black">
        <CardHeader className="bg-gradient-to-r from-lime-400 to-blue-400 border-b-4 border-black">
          <CardTitle className="text-3xl font-bold text-black uppercase tracking-tight">
            🌍 Comprehensive Trust Intelligence Dashboard
          </CardTitle>
          <p className="text-black font-medium">Real-time trust metrics, agent orchestration & workflow intelligence</p>
        </CardHeader>
      </Card>

      {/* Core Trust Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-4 border-black shadow-[4px_4px_0px_0px_#000]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-black">
              <Shield className="w-5 h-5" />
              Global Trust
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{metrics?.globalScore}%</div>
            <div className="text-sm text-green-600 flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4" />
              +2.4% this week
            </div>
            <Progress value={metrics?.globalScore || 0} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[4px_4px_0px_0px_#000]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-black">
              <Users className="w-5 h-5" />
              Personal Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{metrics?.personalScore}%</div>
            <div className="text-sm text-green-600 flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4" />
              +{metrics?.reputationTrend}% growth
            </div>
            <Progress value={metrics?.personalScore || 0} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[4px_4px_0px_0px_#000]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-black">
              <Network className="w-5 h-5" />
              Network Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{metrics?.networkHealth}%</div>
            <div className="text-sm text-gray-600 mt-2">
              {metrics?.connectionStrength} connections
            </div>
            <Progress value={metrics?.networkHealth || 0} className="mt-3" />
          </CardContent>
        </Card>

        <Card className="border-4 border-black shadow-[4px_4px_0px_0px_#000]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-black">
              <Zap className="w-5 h-5" />
              AI Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-black">{metrics?.aiScore}%</div>
            <div className="text-sm text-blue-600 mt-2">
              Risk Assessment: {metrics?.riskAssessment}%
            </div>
            <Progress value={metrics?.aiScore || 0} className="mt-3" />
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance Dashboard */}
      <Card className="border-4 border-black">
        <CardHeader className="bg-purple-100 border-b-4 border-black">
          <CardTitle className="flex items-center gap-2 text-black">
            <Activity className="w-6 h-6" />
            Multi-Agent Performance Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agentPerformance.map((agent) => (
              <Card key={agent.agentId} className="border-2 border-gray-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Efficiency</div>
                      <div className="text-2xl font-bold text-green-600">{agent.efficiency}%</div>
                      <Progress value={agent.efficiency} className="mt-1" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Accuracy</div>
                      <div className="text-2xl font-bold text-blue-600">{agent.accuracy}%</div>
                      <Progress value={agent.accuracy} className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-xs text-gray-500">Response Time</div>
                      <div className="font-bold">{agent.responseTime}s</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Trust Impact</div>
                      <div className="font-bold text-purple-600">+{agent.trustImpact}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Active</div>
                      <div className="font-bold">{agent.activeWorkflows}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Workflow Orchestration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-4 border-black">
          <CardHeader className="bg-orange-100 border-b-4 border-black">
            <CardTitle className="flex items-center gap-2 text-black">
              <Clock className="w-6 h-6" />
              Active Workflows
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {workflows.slice(0, 5).map((workflow) => (
                <div key={workflow.id} className="p-4 border-2 border-gray-300 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      className={`${
                        workflow.status === 'completed' ? 'bg-green-500' :
                        workflow.status === 'active' ? 'bg-blue-500' :
                        workflow.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                      } text-white`}
                    >
                      {workflow.type.replace('_', ' ')}
                    </Badge>
                    <div className="text-sm text-gray-500">
                      Progress: {workflow.progress}%
                    </div>
                  </div>
                  <div className="text-sm font-medium text-black mb-2">
                    Current: {workflow.currentAgent}
                    {workflow.nextAgent && ` → ${workflow.nextAgent}`}
                  </div>
                  <Progress value={workflow.progress} className="mb-2" />
                  <div className="text-xs text-gray-600">
                    Trust Impact: +{workflow.trustImpact.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-4 border-black">
          <CardHeader className="bg-green-100 border-b-4 border-black">
            <CardTitle className="flex items-center gap-2 text-black">
              <Network className="w-6 h-6" />
              Agent Communications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {agentCommunications.slice(0, 8).map((comm, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">
                      {comm.fromAgent} → {comm.toAgent}
                    </div>
                    <Badge 
                      className={`text-xs ${
                        comm.priority === 'high' ? 'bg-red-500' :
                        comm.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                      } text-white`}
                    >
                      {comm.priority}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">{comm.message}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(comm.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Trust Updates */}
      <Card className="border-4 border-black">
        <CardHeader className="bg-lime-100 border-b-4 border-black">
          <CardTitle className="flex items-center gap-2 text-black">
            <TrendingUp className="w-6 h-6" />
            Real-time Trust Intelligence Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-bold text-black">Trust Transactions</h4>
              {[
                { user: "Maya Chen", action: "Verified purchase", impact: "+2.1", location: "Tokyo" },
                { user: "Alex Rivers", action: "Completed delivery", impact: "+1.8", location: "São Paulo" },
                { user: "Zara Okafor", action: "Dispute resolution", impact: "+3.2", location: "Lagos" }
              ].map((item, index) => (
                <div key={index} className="p-3 bg-green-50 border-l-4 border-green-500 rounded">
                  <div className="font-medium text-sm">{item.user}</div>
                  <div className="text-xs text-gray-600">{item.action} • {item.location}</div>
                  <div className="text-sm font-bold text-green-600">{item.impact}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-black">Network Alerts</h4>
              {[
                { type: "Security", message: "New trust verification protocol active", level: "info" },
                { type: "Performance", message: "Agent response time improved 15%", level: "success" },
                { type: "Risk", message: "Unusual pattern detected in Lagos hub", level: "warning" }
              ].map((alert, index) => (
                <div key={index} className={`p-3 rounded border-l-4 ${
                  alert.level === 'success' ? 'bg-green-50 border-green-500' :
                  alert.level === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}>
                  <div className="font-medium text-sm">{alert.type}</div>
                  <div className="text-xs text-gray-600">{alert.message}</div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-black">AI Insights</h4>
              <div className="p-4 bg-purple-50 border-2 border-purple-300 rounded">
                <div className="text-sm font-medium text-purple-800 mb-2">
                  🔮 Oracle Prediction
                </div>
                <div className="text-xs text-purple-700 leading-relaxed">
                  Trust network expansion detected in Southeast Asia. 
                  Agent efficiency up 12% this week. 
                  Optimal time for high-value transactions: Next 6 hours.
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

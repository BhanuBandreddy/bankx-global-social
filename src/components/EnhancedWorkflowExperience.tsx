
import { useState } from "react";
import { useWorkflowOrchestrator } from "@/hooks/useWorkflowOrchestrator";
import { useTrustMetricsEngine } from "@/hooks/useTrustMetricsEngine";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  MapPin, 
  CreditCard, 
  Users, 
  Zap, 
  Network,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const EnhancedWorkflowExperience = () => {
  const { workflows, agentCommunications, initiateWorkflow, activeWorkflow } = useWorkflowOrchestrator();
  const { updateTrustScore } = useTrustMetricsEngine();
  const [selectedWorkflowType, setSelectedWorkflowType] = useState<string>('');
  const { toast } = useToast();

  const workflowTypes = [
    {
      id: 'product_inquiry',
      name: 'Product Discovery',
      description: 'LocaleLens AI analyzes and verifies local products',
      icon: MapPin,
      color: 'bg-blue-500',
      agents: ['LocaleLens AI', 'TrustPay'],
      estimatedTime: '2-5 minutes'
    },
    {
      id: 'product_purchase',
      name: 'Secure Purchase',
      description: 'TrustPay orchestrates secure payment & escrow',
      icon: CreditCard,
      color: 'bg-green-500',
      agents: ['TrustPay', 'PathSync'],
      estimatedTime: '5-10 minutes'
    },
    {
      id: 'itinerary_upload',
      name: 'Travel Intelligence',
      description: 'GlobeGuides™ processes and enriches itinerary data',
      icon: Upload,
      color: 'bg-purple-500',
      agents: ['GlobeGuides™', 'LocaleLens AI'],
      estimatedTime: '1-3 minutes'
    },
    {
      id: 'logistics_request',
      name: 'Smart Logistics',
      description: 'PathSync optimizes peer-to-peer delivery networks',
      icon: Users,
      color: 'bg-orange-500',
      agents: ['PathSync'],
      estimatedTime: '3-8 minutes'
    }
  ];

  const handleWorkflowStart = async (workflowType: string) => {
    try {
      const workflowId = await initiateWorkflow(workflowType, {
        timestamp: new Date().toISOString(),
        source: 'enhanced_experience'
      });

      toast({
        title: "🚀 Workflow Initiated",
        description: `${workflowTypes.find(w => w.id === workflowType)?.name} workflow started`,
      });

      // Award trust points for initiating workflow
      await updateTrustScore(5, `Initiated ${workflowType} workflow`);

    } catch (error) {
      console.error('Error starting workflow:', error);
      toast({
        title: "Error",
        description: "Failed to start workflow. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'active': return <Clock className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-4 border-black">
        <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-400 border-b-4 border-black">
          <CardTitle className="text-3xl font-bold text-black uppercase tracking-tight">
            🤖 Enhanced Multi-Agent Workflow Experience
          </CardTitle>
          <p className="text-black font-medium">
            Experience next-generation AI agent orchestration with real-time trust optimization
          </p>
        </CardHeader>
      </Card>

      {/* Workflow Type Selection */}
      <Card className="border-4 border-black">
        <CardHeader className="bg-lime-100 border-b-4 border-black">
          <CardTitle className="flex items-center gap-2 text-black">
            <Zap className="w-6 h-6" />
            Select Workflow Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflowTypes.map((workflow) => {
              const IconComponent = workflow.icon;
              return (
                <Card 
                  key={workflow.id} 
                  className={`cursor-pointer border-4 transition-all duration-200 hover:shadow-[8px_8px_0px_0px_#000] ${
                    selectedWorkflowType === workflow.id 
                      ? 'border-black shadow-[4px_4px_0px_0px_#000]' 
                      : 'border-gray-300'
                  }`}
                  onClick={() => setSelectedWorkflowType(workflow.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3">
                      <div className={`p-2 rounded ${workflow.color} text-white`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-lg font-bold">{workflow.name}</div>
                        <div className="text-sm text-gray-600 font-normal">
                          {workflow.estimatedTime}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 mb-3">{workflow.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {workflow.agents.map((agent) => (
                        <Badge key={agent} variant="outline" className="text-xs">
                          {agent}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedWorkflowType && (
            <div className="mt-6 text-center">
              <Button
                onClick={() => handleWorkflowStart(selectedWorkflowType)}
                className="bg-black text-white border-4 border-black hover:bg-gray-800 px-8 py-3 text-lg font-bold"
              >
                🚀 Launch {workflowTypes.find(w => w.id === selectedWorkflowType)?.name}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Workflow Monitor */}
      {activeWorkflow && (
        <Card className="border-4 border-black">
          <CardHeader className="bg-blue-100 border-b-4 border-black">
            <CardTitle className="flex items-center gap-2 text-black">
              <Network className="w-6 h-6" />
              Active Workflow Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(activeWorkflow.status)}
                  <div>
                    <div className="font-bold text-lg">{activeWorkflow.type.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-600">
                      Current Agent: {activeWorkflow.currentAgent}
                    </div>
                  </div>
                </div>
                <Badge className={`${
                  activeWorkflow.status === 'completed' ? 'bg-green-500' :
                  activeWorkflow.status === 'active' ? 'bg-blue-500' :
                  'bg-gray-500'
                } text-white`}>
                  {activeWorkflow.status.toUpperCase()}
                </Badge>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{activeWorkflow.progress}%</span>
                </div>
                <Progress value={activeWorkflow.progress} className="h-3" />
              </div>

              {activeWorkflow.nextAgent && (
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <div className="text-sm font-medium">Next: {activeWorkflow.nextAgent}</div>
                  <div className="text-xs text-gray-600">Preparing for handoff...</div>
                </div>
              )}

              <div className="text-sm text-green-600">
                Trust Impact: +{activeWorkflow.trustImpact.toFixed(1)} points
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Workflows */}
      <Card className="border-4 border-black">
        <CardHeader className="bg-gray-100 border-b-4 border-black">
          <CardTitle className="flex items-center gap-2 text-black">
            <Clock className="w-6 h-6" />
            Recent Workflow History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {workflows.slice(0, 5).map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(workflow.status)}
                  <div>
                    <div className="font-medium">{workflow.type.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(workflow.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-green-600">
                    +{workflow.trustImpact.toFixed(1)}
                  </div>
                  <div className="text-xs text-gray-500">{workflow.progress}%</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Agent Communications */}
      <Card className="border-4 border-black">
        <CardHeader className="bg-purple-100 border-b-4 border-black">
          <CardTitle className="flex items-center gap-2 text-black">
            <Network className="w-6 h-6" />
            Live Agent Communications
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {agentCommunications.slice(0, 6).map((comm, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded border-l-4 border-purple-500">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium">
                    {comm.fromAgent} → {comm.toAgent}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(comm.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-sm text-gray-700">{comm.message}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Conductor Dashboard - Real-time view of orchestration activity

import { useState } from "react";
import { useConductorContext } from "@/hooks/useConductorContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Brain, 
  Activity, 
  TrendingUp, 
  Zap, 
  Users, 
  MessageSquare, 
  Clock,
  Wifi,
  WifiOff,
  RefreshCw
} from "lucide-react";

const agentIcons = {
  trustpay: "🔒",
  localelens: "🔍", 
  pathsync: "🚚",
  globeguides: "✈️"
};

const priorityColors = {
  critical: "bg-red-500",
  high: "bg-orange-500", 
  medium: "bg-yellow-500",
  low: "bg-green-500"
};

export const ConductorDashboard = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const {
    insights,
    crowdHeatBadges,
    isConnected,
    lastUpdate,
    hasRecentActivity,
    totalWorkflows,
    getConductorStatus,
    triggerAgentTorchBatch,
    getLatestInsight,
    getAgentActivitySummary
  } = useConductorContext();

  const handleTriggerBatch = async () => {
    try {
      const result = await triggerAgentTorchBatch();
      toast({
        title: "🔄 AgentTorch Batch Triggered",
        description: `Processed ${result.processed} events and generated ${result.insights?.length || 0} insights`,
      });
    } catch (error) {
      toast({
        title: "❌ Batch Processing Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const latestInsight = getLatestInsight();
  const agentActivity = getAgentActivitySummary();

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="relative bg-purple-600 hover:bg-purple-700 text-white border-4 border-black shadow-[4px_4px_0px_0px_#000]"
        >
          <Brain className="w-5 h-5 mr-2" />
          Conductor
          {hasRecentActivity && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-lime-400 border-2 border-black rounded-full animate-pulse" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000] bg-white">
        {/* Header */}
        <CardHeader className="pb-4 border-b-4 border-black bg-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-purple-600" />
              <div>
                <CardTitle className="text-lg font-black text-black uppercase">Conductor</CardTitle>
                <CardDescription className="text-sm text-gray-700">
                  AI Orchestration Engine
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-black hover:bg-gray-200"
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 border-2 border-black p-2">
              <div className="text-xs font-bold text-gray-600 uppercase">Workflows</div>
              <div className="text-xl font-black text-black">{totalWorkflows}</div>
            </div>
            <div className="bg-gray-50 border-2 border-black p-2">
              <div className="text-xs font-bold text-gray-600 uppercase">Insights</div>
              <div className="text-xl font-black text-black">{insights.length}</div>
            </div>
          </div>

          {/* Latest Insight */}
          {latestInsight ? (
            <div className="bg-lime-100 border-2 border-black p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-lime-600" />
                <span className="text-xs font-bold text-black uppercase">Latest Analysis</span>
                <Badge variant="outline" className="text-xs">
                  {latestInsight.workflows.length} agents
                </Badge>
              </div>
              <p className="text-sm text-black font-medium leading-tight">
                {latestInsight.reasoning.slice(0, 120)}...
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {latestInsight.workflows.map((workflow, idx) => (
                  <Badge key={idx} className="text-xs bg-white border-black">
                    {agentIcons[workflow.agent as keyof typeof agentIcons] || "🤖"} {workflow.agent}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <Skeleton className="h-20 border-2 border-black" />
          )}

          {/* Agent Activity */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-black uppercase flex items-center">
              <Activity className="w-4 h-4 mr-1" />
              Agent Activity
            </h4>
            {agentActivity.length > 0 ? (
              <div className="space-y-1">
                {agentActivity.slice(0, 4).map(({ agent, count }) => (
                  <div key={agent} className="flex items-center justify-between bg-gray-50 border border-black p-2">
                    <span className="text-sm font-medium">
                      {agentIcons[agent]} {agent}
                    </span>
                    <Badge className="bg-black text-white text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No recent activity</div>
            )}
          </div>

          {/* Crowd Heat Badges */}
          {crowdHeatBadges.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-black uppercase flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                Crowd Heat
              </h4>
              <div className="grid grid-cols-2 gap-1">
                {crowdHeatBadges.slice(0, 4).map((badge, idx) => (
                  <div key={idx} className="bg-orange-100 border border-black p-2">
                    <div className="text-xs font-bold text-black">{badge.location}</div>
                    <div className="text-xs text-gray-600">{badge.category}</div>
                    <div className="text-xs font-medium">
                      {badge.intensity > 70 ? "🔥" : badge.intensity > 40 ? "📈" : "📊"} {badge.intensity}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              onClick={handleTriggerBatch}
              size="sm"
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Batch Process
            </Button>
          </div>

          {/* Connection Status */}
          <div className="text-xs text-gray-500 flex items-center justify-between">
            <span>
              {lastUpdate ? (
                <>
                  <Clock className="w-3 h-3 inline mr-1" />
                  {new Date(lastUpdate).toLocaleTimeString()}
                </>
              ) : (
                "No updates yet"
              )}
            </span>
            <span className={`px-2 py-1 rounded ${isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
              {isConnected ? "LIVE" : "OFFLINE"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
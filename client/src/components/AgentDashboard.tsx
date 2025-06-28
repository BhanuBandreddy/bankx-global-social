
import { useState, useEffect } from "react";
import { TrendingUp, MessageSquare, Globe2, LockKeyhole, SearchCheck, Navigation2, Activity, Wifi, WifiOff } from "lucide-react";
import { useNandaAgents } from "@/lib/useNandaAgents";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const iconMap = {
  "globe-2": Globe2,
  "lock-keyhole": LockKeyhole,
  "search-check": SearchCheck,
  "navigation-2": Navigation2,
};

interface HeartbeatStatus {
  isRunning: boolean;
  heartbeatAge: number | null;
  pingAge: number | null;
  indicator: '🟢' | '🟡' | '🔴';
  lastHeartbeat?: string;
  lastPing?: string;
  did?: string;
}

export const AgentDashboard = () => {
  const [selectedAgent, setSelectedAgent] = useState(0);
  const [heartbeatStatus, setHeartbeatStatus] = useState<HeartbeatStatus>({
    isRunning: false,
    heartbeatAge: null,
    pingAge: null,
    indicator: '🔴'
  });
  const [isHeartbeatActive, setIsHeartbeatActive] = useState(false);
  const { data: agents, error } = useNandaAgents("travel_commerce");

  // Phase 2: Heartbeat Management
  useEffect(() => {
    let heartbeatInterval: NodeJS.Timeout;
    
    if (isHeartbeatActive) {
      // Start heartbeat
      heartbeatInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/nanda/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              agentId: 'agent-globalsocial',
              status: 'active'
            })
          });
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          
          const status = await response.json();
          console.log('✅ Heartbeat successful:', status);
          setHeartbeatStatus(status);
        } catch (error) {
          console.error('Heartbeat failed:', error);
          setHeartbeatStatus(prev => ({ 
            ...prev, 
            indicator: '🔴', 
            isRunning: false,
            lastHeartbeat: new Date().toISOString()
          }));
        }
      }, 15000); // Every 15 seconds (faster for demo)

      // Initial heartbeat
      const sendInitialHeartbeat = async () => {
        try {
          const response = await fetch('/api/nanda/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              agentId: 'agent-globalsocial',
              status: 'active'
            })
          });
          
          if (response.ok) {
            const status = await response.json();
            console.log('✅ Initial heartbeat successful:', status);
            setHeartbeatStatus(status);
          }
        } catch (error) {
          console.error('Initial heartbeat failed:', error);
        }
      };
      
      sendInitialHeartbeat();
    }

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
    };
  }, [isHeartbeatActive]);

  const handleStartHeartbeat = () => {
    setIsHeartbeatActive(true);
  };

  const handleStopHeartbeat = () => {
    setIsHeartbeatActive(false);
    setHeartbeatStatus({
      isRunning: false,
      heartbeatAge: null,
      pingAge: null,
      indicator: '🔴'
    });
  };

  const handlePingTest = async () => {
    try {
      const response = await fetch('/api/nanda/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: 'https://globeguides-concierge.nanda.ai/api/v1' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Ping test result:', result);
      
      // Update heartbeat status with ping result
      setHeartbeatStatus(prev => ({
        ...prev,
        lastPing: new Date().toISOString(),
        pingAge: 0
      }));
      
      // Show success/failure feedback
      if (result.success) {
        console.log('✅ Ping successful:', result.response);
      } else {
        console.warn('⚠️ Ping failed:', result.error);
      }
      
    } catch (error) {
      console.error('Ping test failed:', error);
      // Still update the ping timestamp to show attempt was made
      setHeartbeatStatus(prev => ({
        ...prev,
        lastPing: new Date().toISOString(),
        pingAge: 0
      }));
    }
  };

  const currentAgent = agents[selectedAgent] || agents[0];

  const recentActions = [
    { agent: "GlobeGuides™ Concierge", action: "Auto-booked local ramen spot in Shibuya", impact: "Zero tourist traps", time: "Just now" },
    { agent: "TrustPay Orchestrator", action: "Funds released after merchant confirmation", impact: "Safe transaction", time: "2m ago" },
    { agent: "LocaleLens AI", action: "Found hidden jazz club via quilt data", impact: "Perfect local match", time: "3m ago" },
    { agent: "PathSync Social Logistics", action: "Fellow traveller collecting your package", impact: "Crowd-sourced delivery", time: "5m ago" },
  ];

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

  return (
    <div className="max-w-6xl mx-auto bg-white border-4 border-black">
      {/* Header */}
      <div className="p-6 border-b-4 border-black bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-black uppercase tracking-tight">Global Socials AI Agents</h2>
            <p className="text-gray-600 font-medium mt-1">Smart agent ecosystem powered by Nanda registry</p>
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
            const isOwnAgent = agent.isOwnAgent || agent.owner?.includes('globalsocial');
            
            return (
              <button
                key={agent.id || index}
                onClick={() => setSelectedAgent(index)}
                className={`p-4 border-4 transition-all duration-200 transform ${
                  isOwnAgent 
                    ? 'border-yellow-500 bg-yellow-50' 
                    : 'border-black bg-white'
                } ${
                  selectedAgent === index
                    ? "shadow-[8px_8px_0px_0px_#000] translate-x-[-4px] translate-y-[-4px]"
                    : "shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                }`}
              >
                <div className="text-center">
                  <IconComponent className={`w-8 h-8 mx-auto mb-2 stroke-[2.5] ${
                    selectedAgent === index ? 'text-black' : 'text-gray-600'
                  }`} />
                  <div className={`text-sm font-bold ${selectedAgent === index ? 'text-black' : 'text-gray-600'}`}>
                    {agent.name || `Agent ${index + 1}`}
                  </div>
                  {isOwnAgent && (
                    <div className="text-xs font-bold text-yellow-700 uppercase">OUR AGENT</div>
                  )}
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

      {/* NANDA Phase 2 - Cryptographic Heartbeat */}
      <div className="mb-8">
        <Card className="border-4 border-black bg-gradient-to-r from-yellow-400 to-orange-400">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black font-black">
              <Activity className="w-6 h-6" />
              NANDA PHASE 2 • CRYPTOGRAPHIC HEARTBEAT
            </CardTitle>
            <CardDescription className="text-black font-bold">
              Live connection to NANDA registry • DID authentication • Real-time status monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Heartbeat Controls */}
              <div className="flex flex-wrap gap-4">
                {!isHeartbeatActive ? (
                  <Button 
                    onClick={handleStartHeartbeat}
                    className="bg-green-500 hover:bg-green-600 text-white border-2 border-black font-bold"
                  >
                    <Wifi className="w-4 h-4 mr-2" />
                    START HEARTBEAT
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStopHeartbeat}
                    className="bg-red-500 hover:bg-red-600 text-white border-2 border-black font-bold"
                  >
                    <WifiOff className="w-4 h-4 mr-2" />
                    STOP HEARTBEAT
                  </Button>
                )}
                
                <Button 
                  onClick={handlePingTest}
                  variant="outline"
                  className="border-2 border-black text-black hover:bg-black hover:text-yellow-400 font-bold"
                >
                  🏓 JSON-RPC PING
                </Button>
              </div>

              {/* Status Indicators */}
              <div className="flex flex-wrap gap-4">
                <Badge variant="outline" className="border-2 border-black text-black font-bold">
                  Status: {heartbeatStatus.indicator} {heartbeatStatus.isRunning ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
                <Badge variant="outline" className="border-2 border-black text-black font-bold">
                  🔄 Heartbeat: 15s
                </Badge>
                <Badge variant="outline" className="border-2 border-black text-black font-bold">
                  🎯 Agents: {agents?.length || 0}
                </Badge>
                {heartbeatStatus.did && (
                  <Badge variant="outline" className="border-2 border-black text-black font-bold">
                    🔑 DID: {heartbeatStatus.did.substring(0, 20)}...
                  </Badge>
                )}
              </div>

              {/* Live Metrics */}
              {isHeartbeatActive && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-black/10 p-2 rounded border border-black">
                    <strong>Last Heartbeat:</strong><br/>
                    {heartbeatStatus.lastHeartbeat ? new Date(heartbeatStatus.lastHeartbeat).toLocaleTimeString() : 'Never'}
                  </div>
                  <div className="bg-black/10 p-2 rounded border border-black">
                    <strong>Last Ping:</strong><br/>
                    {heartbeatStatus.lastPing ? new Date(heartbeatStatus.lastPing).toLocaleTimeString() : 'Never'}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* NANDA Registry Status */}
      <div className="p-6 bg-purple-50 border-t-4 border-black">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <TrendingUp className="w-8 h-8 text-purple-600 mt-1 stroke-[2.5]" />
            <div>
              <h3 className="text-lg font-bold text-black mb-2">NANDA Registry Status</h3>
              <p className="text-black leading-relaxed">
                Currently showing <span className="font-bold">{agents.length} specialized agents</span> from the registry. 
                <span className="font-bold text-purple-700"> Real-time agent discovery</span> active.
              </p>
            </div>
          </div>
          
          {/* Live Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 border-2 border-black rounded-full animate-pulse"></div>
              <span className="text-sm font-bold text-green-700">NANDA LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

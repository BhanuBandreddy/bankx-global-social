// React hook for accessing Conductor context and real-time updates

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface ConductorInsight {
  reasoning: string;
  workflows: Array<{
    agent: string;
    action: string;
    priority: string;
  }>;
  contextUpdates: number;
  timestamp: Date;
}

interface CrowdHeatBadge {
  location: string;
  category: string;
  intensity: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  badge: string;
}

interface ConductorContextState {
  insights: ConductorInsight[];
  crowdHeatBadges: CrowdHeatBadge[];
  isConnected: boolean;
  lastUpdate: Date | null;
}

export const useConductorContext = () => {
  const [state, setState] = useState<ConductorContextState>({
    insights: [],
    crowdHeatBadges: [],
    isConnected: false,
    lastUpdate: null
  });

  // Real-time WebSocket connection for conductor updates
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws/conductor`;
        
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('🎯 Conductor WebSocket connected');
          setState(prev => ({ ...prev, isConnected: true }));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'conductor_insight') {
              setState(prev => ({
                ...prev,
                insights: [data.payload, ...prev.insights.slice(0, 9)], // Keep last 10
                lastUpdate: new Date()
              }));
            }
            
            if (data.type === 'crowd_heat_update') {
              setState(prev => ({
                ...prev,
                crowdHeatBadges: data.payload,
                lastUpdate: new Date()
              }));
            }
          } catch (error) {
            console.error('Conductor WebSocket message error:', error);
          }
        };

        ws.onclose = () => {
          console.log('🎯 Conductor WebSocket disconnected');
          setState(prev => ({ ...prev, isConnected: false }));
          
          // Reconnect after 5 seconds
          reconnectTimer = setTimeout(connect, 5000);
        };

        ws.onerror = (error) => {
          console.error('Conductor WebSocket error:', error);
        };

      } catch (error) {
        console.error('Failed to connect to Conductor WebSocket:', error);
        reconnectTimer = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
    };
  }, []);

  // Fetch conductor status
  const getConductorStatus = useCallback(async () => {
    try {
      const status = await apiClient.get('/api/conductor/status');
      return status;
    } catch (error) {
      console.error('Failed to fetch conductor status:', error);
      return null;
    }
  }, []);

  // Trigger manual AgentTorch batch processing
  const triggerAgentTorchBatch = useCallback(async () => {
    try {
      const result = await apiClient.post('/api/agenttorch/batch', {});
      console.log('🔄 AgentTorch batch processing triggered:', result);
      return result;
    } catch (error) {
      console.error('Failed to trigger AgentTorch batch:', error);
      throw error;
    }
  }, []);

  // Send webhook to conductor (for external integrations)
  const sendWebhook = useCallback(async (payload: any) => {
    try {
      const result = await apiClient.post('/api/conductor/webhook', payload);
      return result;
    } catch (error) {
      console.error('Failed to send webhook to conductor:', error);
      throw error;
    }
  }, []);

  // Get most recent conductor insight
  const getLatestInsight = useCallback((): ConductorInsight | null => {
    return state.insights.length > 0 ? state.insights[0] : null;
  }, [state.insights]);

  // Get crowd heat badges for current location
  const getCrowdHeatForLocation = useCallback((location: string): CrowdHeatBadge[] => {
    return state.crowdHeatBadges.filter(badge => 
      badge.location.toLowerCase().includes(location.toLowerCase())
    );
  }, [state.crowdHeatBadges]);

  // Get agent activity summary
  const getAgentActivitySummary = useCallback(() => {
    const agentCounts = state.insights.reduce((acc, insight) => {
      insight.workflows.forEach(workflow => {
        acc[workflow.agent] = (acc[workflow.agent] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(agentCounts)
      .map(([agent, count]) => ({ agent, count }))
      .sort((a, b) => b.count - a.count);
  }, [state.insights]);

  return {
    // State
    ...state,
    
    // Methods
    getConductorStatus,
    triggerAgentTorchBatch,
    sendWebhook,
    getLatestInsight,
    getCrowdHeatForLocation,
    getAgentActivitySummary,
    
    // Computed values
    hasRecentActivity: state.lastUpdate && (Date.now() - state.lastUpdate.getTime()) < 30000,
    totalWorkflows: state.insights.reduce((sum, insight) => sum + insight.workflows.length, 0)
  };
};
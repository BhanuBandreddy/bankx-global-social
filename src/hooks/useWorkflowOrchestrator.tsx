
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface WorkflowState {
  id: string;
  type: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  currentAgent: string;
  nextAgent?: string;
  progress: number;
  data: any;
  trustImpact: number;
  created_at: string;
}

interface AgentCommunication {
  fromAgent: string;
  toAgent: string;
  message: string;
  workflowId: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
}

export const useWorkflowOrchestrator = () => {
  const [workflows, setWorkflows] = useState<WorkflowState[]>([]);
  const [agentCommunications, setAgentCommunications] = useState<AgentCommunication[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowState | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    loadWorkflows();
    
    // Set up real-time workflow monitoring
    const subscription = supabase
      .channel('workflow_orchestration')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'blink_workflows'
      }, (payload) => {
        handleWorkflowUpdate(payload);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const loadWorkflows = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('blink_workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedWorkflows: WorkflowState[] = (data || []).map(workflow => ({
        id: workflow.id,
        type: workflow.workflow_type,
        status: workflow.status as any,
        currentAgent: getCurrentAgent(workflow.workflow_type, workflow.status),
        nextAgent: getNextAgent(workflow.workflow_type, workflow.status),
        progress: calculateProgress(workflow.status),
        data: workflow.context_data,
        trustImpact: calculateTrustImpact(workflow.workflow_type, workflow.status),
        created_at: workflow.created_at
      }));

      setWorkflows(transformedWorkflows);
      setLoading(false);
    } catch (error) {
      console.error('Error loading workflows:', error);
      setLoading(false);
    }
  };

  const handleWorkflowUpdate = (payload: any) => {
    console.log('Workflow update received:', payload);
    
    // Simulate agent-to-agent communication
    const communication: AgentCommunication = {
      fromAgent: getCurrentAgent(payload.new.workflow_type, payload.old?.status || 'pending'),
      toAgent: getCurrentAgent(payload.new.workflow_type, payload.new.status),
      message: generateAgentMessage(payload.new.workflow_type, payload.new.status),
      workflowId: payload.new.id,
      timestamp: new Date().toISOString(),
      priority: 'medium'
    };

    setAgentCommunications(prev => [communication, ...prev.slice(0, 19)]);
    loadWorkflows(); // Refresh workflows
  };

  const getCurrentAgent = (workflowType: string, status: string): string => {
    const agentMap: Record<string, Record<string, string>> = {
      'product_inquiry': {
        'pending': 'LocaleLens AI',
        'active': 'LocaleLens AI',
        'completed': 'TrustPay'
      },
      'product_purchase': {
        'pending': 'TrustPay',
        'active': 'TrustPay',
        'completed': 'PathSync'
      },
      'itinerary_upload': {
        'pending': 'GlobeGuides™',
        'active': 'GlobeGuides™',
        'completed': 'LocaleLens AI'
      },
      'logistics_request': {
        'pending': 'PathSync',
        'active': 'PathSync',
        'completed': 'PathSync'
      }
    };

    return agentMap[workflowType]?.[status] || 'System';
  };

  const getNextAgent = (workflowType: string, status: string): string | undefined => {
    const nextAgentMap: Record<string, Record<string, string>> = {
      'product_inquiry': {
        'pending': 'TrustPay',
        'active': 'TrustPay'
      },
      'product_purchase': {
        'pending': 'PathSync',
        'active': 'PathSync'
      },
      'itinerary_upload': {
        'pending': 'LocaleLens AI',
        'active': 'LocaleLens AI'
      }
    };

    return nextAgentMap[workflowType]?.[status];
  };

  const calculateProgress = (status: string): number => {
    const progressMap: Record<string, number> = {
      'pending': 25,
      'active': 60,
      'completed': 100,
      'failed': 0
    };

    return progressMap[status] || 0;
  };

  const calculateTrustImpact = (workflowType: string, status: string): number => {
    const baseImpact = {
      'product_inquiry': 2.1,
      'product_purchase': 5.3,
      'itinerary_upload': 1.8,
      'logistics_request': 3.2
    };

    const statusMultiplier = {
      'pending': 0.2,
      'active': 0.6,
      'completed': 1.0,
      'failed': -0.5
    };

    return (baseImpact[workflowType as keyof typeof baseImpact] || 1.0) * 
           (statusMultiplier[status as keyof typeof statusMultiplier] || 0);
  };

  const generateAgentMessage = (workflowType: string, status: string): string => {
    const messages: Record<string, Record<string, string>> = {
      'product_inquiry': {
        'active': 'LocaleLens analyzing product authenticity and local availability',
        'completed': 'Product verified ✓ Transferring to TrustPay for secure transaction'
      },
      'product_purchase': {
        'active': 'TrustPay securing escrow and processing payment verification',
        'completed': 'Payment secured ✓ Initiating PathSync logistics coordination'
      },
      'itinerary_upload': {
        'active': 'GlobeGuides parsing travel data and extracting key insights',
        'completed': 'Itinerary processed ✓ LocaleLens ready for destination analysis'
      },
      'logistics_request': {
        'active': 'PathSync optimizing delivery routes and peer connections',
        'completed': 'Logistics optimized ✓ Ready for execution'
      }
    };

    return messages[workflowType]?.[status] || 'Agent processing workflow step';
  };

  const initiateWorkflow = async (type: string, data: any) => {
    if (!user) return;

    try {
      const { data: workflow, error } = await supabase
        .from('blink_workflows')
        .insert({
          user_id: user.id,
          workflow_type: type,
          context_data: data,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setActiveWorkflow({
        id: workflow.id,
        type: workflow.workflow_type,
        status: 'pending',
        currentAgent: getCurrentAgent(workflow.workflow_type, 'pending'),
        nextAgent: getNextAgent(workflow.workflow_type, 'pending'),
        progress: 25,
        data: workflow.context_data,
        trustImpact: calculateTrustImpact(workflow.workflow_type, 'pending'),
        created_at: workflow.created_at
      });

      return workflow.id;
    } catch (error) {
      console.error('Error initiating workflow:', error);
      throw error;
    }
  };

  return {
    workflows,
    agentCommunications,
    activeWorkflow,
    loading,
    initiateWorkflow,
    setActiveWorkflow
  };
};

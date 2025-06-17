
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Agent {
  name: string;
  instructions: string;
  emoji: string;
}

interface UserContext {
  profile: any;
  recentTransactions: any[];
  trustScore: number;
  conversationHistory: any[];
}

interface BlinkRequest {
  query: string;
  userId: string;
  sessionId: string;
  contextType: 'generic' | 'feed';
  feedContext?: {
    postId: string;
    action: string;
    productData?: any;
    userAction?: string;
  };
}

const agents: Agent[] = [
  {
    name: "TrustPay",
    emoji: "🔐",
    instructions: "You are TrustPay, an AI expert in secure banking and payments. You have access to user's transaction history, trust score, and payment patterns. Focus on financial security, payment methods, fraud prevention, and compliance aspects. Consider user's trust level and past transactions when making recommendations. Keep responses concise and practical."
  },
  {
    name: "GlobeGuides", 
    emoji: "🌍",
    instructions: "You are GlobeGuides, an AI expert in international information and travel regulations. You understand user's location, travel history, and preferences. Provide geopolitical context, cultural insights, currency exchange, and cross-border considerations. Keep responses informative and relevant to user's travel patterns."
  },
  {
    name: "LocaleLens",
    emoji: "📍", 
    instructions: "You are LocaleLens, an AI with deep local knowledge. You know user's current location and local preferences. Provide specific regional insights, local regulations, cultural nuances, and on-ground practical details for specific locations. Focus on actionable local information based on user's context."
  },
  {
    name: "PathSync",
    emoji: "⚡",
    instructions: "You are PathSync, an AI coordinator that synthesizes information from other agents and user context. You understand user's complete profile, trust score, transaction history, and current situation. Create comprehensive action plans, summarize key points, and provide final recommendations with specific next steps tailored to the user."
  }
];

async function getUserContext(userId: string): Promise<UserContext> {
  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Get recent transactions
  const { data: transactions } = await supabase
    .from('escrow_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  // Get recent conversation history
  const { data: history } = await supabase
    .from('blink_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    profile: profile || {},
    recentTransactions: transactions || [],
    trustScore: profile?.trust_score || 0,
    conversationHistory: history || []
  };
}

async function saveConversation(userId: string, sessionId: string, speaker: string, content: string, contextData: any = {}) {
  await supabase
    .from('blink_conversations')
    .insert({
      user_id: userId,
      session_id: sessionId,
      message_type: speaker === 'User' ? 'user' : 'agent',
      speaker,
      content,
      context_data: contextData
    });
}

async function createWorkflow(userId: string, workflowType: string, contextData: any, feedPostId?: string) {
  const { data, error } = await supabase
    .from('blink_workflows')
    .insert({
      user_id: userId,
      workflow_type: workflowType,
      context_data: contextData,
      feed_post_id: feedPostId
    })
    .select()
    .single();

  return data;
}

async function createNotification(userId: string, workflowId: string, title: string, message: string, type: string = 'info') {
  await supabase
    .from('blink_notifications')
    .insert({
      user_id: userId,
      workflow_id: workflowId,
      title,
      message,
      type
    });
}

function buildContextPrompt(userContext: UserContext, feedContext?: any): string {
  let contextPrompt = `
User Context:
- Trust Score: ${userContext.trustScore}%
- Trust Level: ${userContext.profile?.level || 'Unknown'}
- Location: ${userContext.profile?.location || 'Unknown'}
- Recent Activity: ${userContext.recentTransactions.length} transactions
`;

  if (userContext.conversationHistory.length > 0) {
    contextPrompt += `
Recent Conversation History:
${userContext.conversationHistory.slice(0, 3).map(msg => `${msg.speaker}: ${msg.content}`).join('\n')}
`;
  }

  if (feedContext) {
    contextPrompt += `
Feed Context:
- Action: ${feedContext.action}
- Post ID: ${feedContext.postId}
- Product: ${feedContext.productData?.name || 'N/A'}
`;
  }

  return contextPrompt;
}

async function callOpenAI(systemPrompt: string, userMessage: string, context: string = ""): Promise<string> {
  const messages = [
    { role: "system", content: systemPrompt },
  ];
  
  if (context) {
    messages.push({ role: "user", content: `Context: ${context}` });
  }
  
  messages.push({ role: "user", content: userMessage });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 400,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: BlinkRequest = await req.json();
    const { query, userId, sessionId, contextType, feedContext } = requestData;
    
    if (!query || !userId) {
      return new Response(JSON.stringify({ error: 'Query and userId are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user context
    const userContext = await getUserContext(userId);
    
    // Save user message
    await saveConversation(userId, sessionId, 'User', query, { contextType, feedContext });

    // Create workflow if this is a feed action
    let workflow = null;
    if (contextType === 'feed' && feedContext) {
      workflow = await createWorkflow(userId, feedContext.action, { query, feedContext }, feedContext.postId);
    }

    // Build context for agents
    const contextPrompt = buildContextPrompt(userContext, feedContext);
    
    const conversation = [
      { speaker: "User", content: query, emoji: "👤" }
    ];

    let agentContext = contextPrompt;
    
    // Process through each agent
    for (const agent of agents) {
      console.log(`Processing with ${agent.name}...`);
      
      const agentResponse = await callOpenAI(
        agent.instructions,
        query,
        agentContext
      );
      
      // Save agent response
      await saveConversation(userId, sessionId, agent.name, agentResponse, { contextType, feedContext });
      
      conversation.push({
        speaker: agent.name,
        content: agentResponse,
        emoji: agent.emoji
      });
      
      // Build context for next agent
      agentContext += `\n${agent.name}: ${agentResponse}`;
    }

    // Get the final answer from PathSync (last agent)
    const finalAnswer = conversation[conversation.length - 1].content;

    // Create notification if workflow was created
    if (workflow) {
      await createNotification(
        userId,
        workflow.id,
        "Blink Action Complete",
        `Your ${feedContext?.action} request has been processed by our AI agents.`,
        "success"
      );
    }

    return new Response(JSON.stringify({ 
      finalAnswer,
      conversation,
      workflow: workflow?.id,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in multi-agent-orchestrator:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Agent {
  name: string;
  instructions: string;
  emoji: string;
}

const agents: Agent[] = [
  {
    name: "TrustPay",
    emoji: "🔐",
    instructions: "You are TrustPay, an AI expert in secure banking and payments. Focus on financial security, payment methods, fraud prevention, and compliance aspects. Keep responses concise and practical."
  },
  {
    name: "GlobeGuides", 
    emoji: "🌍",
    instructions: "You are GlobeGuides, an AI expert in international information and travel regulations. Provide geopolitical context, cultural insights, currency exchange, and cross-border considerations. Keep responses informative and relevant."
  },
  {
    name: "LocaleLens",
    emoji: "📍", 
    instructions: "You are LocaleLens, an AI with deep local knowledge. Provide specific regional insights, local regulations, cultural nuances, and on-ground practical details for specific locations. Focus on actionable local information."
  },
  {
    name: "PathSync",
    emoji: "⚡",
    instructions: "You are PathSync, an AI coordinator that synthesizes information from other agents. You create comprehensive action plans, summarize key points, and provide final recommendations. Focus on clear next steps and integration."
  }
];

interface ConversationMessage {
  speaker: string;
  content: string;
  emoji?: string;
}

async function callOpenAI(systemPrompt: string, userMessage: string, context: string = ""): Promise<string> {
  const messages = [
    { role: "system", content: systemPrompt },
  ];
  
  if (context) {
    messages.push({ role: "user", content: `Context from previous agents: ${context}` });
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
      max_tokens: 300,
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
    const { query } = await req.json();
    
    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const conversation: ConversationMessage[] = [
      { speaker: "User", content: query }
    ];

    let context = "";
    
    // Process through each agent
    for (const agent of agents) {
      console.log(`Processing with ${agent.name}...`);
      
      const agentResponse = await callOpenAI(
        agent.instructions,
        query,
        context
      );
      
      conversation.push({
        speaker: agent.name,
        content: agentResponse,
        emoji: agent.emoji
      });
      
      // Build context for next agent
      context += `\n${agent.name}: ${agentResponse}`;
    }

    // Get the final answer from PathSync (last agent)
    const finalAnswer = conversation[conversation.length - 1].content;

    return new Response(JSON.stringify({ 
      finalAnswer,
      conversation,
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

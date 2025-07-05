// Blink Conversational Concierge - Interaction-Centric Multi-Agent System
// Following MIT principles: interaction patterns drive intelligence, not individual agent sophistication

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useConductorContext } from "@/hooks/useConductorContext";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Send, 
  Clock, 
  MapPin, 
  ShoppingBag, 
  Plane,
  Brain,
  Zap,
  History,
  Eye,
  Calendar,
  X
} from "lucide-react";

interface BlinkMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  eventType?: 'past' | 'current' | 'future';
  triggerredAgents?: string[];
  conductorInsights?: any;
  metadata?: {
    location?: string;
    intent?: string;
    confidence?: number;
  };
}

interface BlinkConversation {
  id: string;
  title: string;
  messages: BlinkMessage[];
  lastActivity: Date;
  eventTypes: ('past' | 'current' | 'future')[];
}

// Predefined test scenarios based on the three event types
const TEST_SCENARIOS = {
  past: [
    "Show me my recent purchases from Tokyo",
    "What was on my wishlist last month?",
    "Check if my refund for the electronics purchase went through",
    "Review my travel expenses from my Europe trip",
    "What products did I save but never bought?"
  ],
  current: [
    "What's trending in my current city right now?",
    "Find the nearest train station to my location",
    "What are the best restaurants within walking distance?",
    "Show me local events happening today",
    "What's the current crowd heat in electronics stores nearby?"
  ],
  future: [
    "Here's my flight itinerary, help me plan my trip",
    "Check my flight status for tomorrow",
    "Book me a cab to the airport at 6 AM",
    "What do I need to know about my destination city?",
    "Set up delivery for my purchases to arrive after I return"
  ]
};

export const BlinkConcierge = ({ isMinimized = false, onToggle }: { 
  isMinimized?: boolean; 
  onToggle?: () => void; 
}) => {
  const [conversations, setConversations] = useState<BlinkConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTestMode, setIsTestMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { getLatestInsight, sendWebhook } = useConductorContext();

  // Send message to Blink conversation API
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, conversationId }: { message: string; conversationId?: string }) => {
      const response = await fetch('/api/blink/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationId,
          includeContext: true,
          requestConductorAnalysis: true
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Update conversation with response
      const conversationId = variables.conversationId || generateConversationId();
      
      const userMessage: BlinkMessage = {
        id: generateMessageId(),
        role: 'user',
        content: variables.message,
        timestamp: new Date(),
        eventType: detectEventType(variables.message),
        metadata: {
          intent: variables.message.slice(0, 50),
          confidence: 0.9
        }
      };

      const assistantMessage: BlinkMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.finalAnswer || data.response || "I understand. Let me help you with that.",
        timestamp: new Date(),
        triggerredAgents: data.agentsUsed || [],
        conductorInsights: data._conductor,
        metadata: {
          confidence: data.confidence || 0.8
        }
      };

      setConversations(prev => {
        const existingIndex = prev.findIndex(c => c.id === conversationId);
        
        if (existingIndex >= 0) {
          // Update existing conversation
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            messages: [...updated[existingIndex].messages, userMessage, assistantMessage],
            lastActivity: new Date(),
            eventTypes: [...new Set([...updated[existingIndex].eventTypes, userMessage.eventType].filter(Boolean))] as ('past' | 'current' | 'future')[]
          };
          return updated;
        } else {
          // Create new conversation
          const newConversation: BlinkConversation = {
            id: conversationId,
            title: generateConversationTitle(variables.message),
            messages: [userMessage, assistantMessage],
            lastActivity: new Date(),
            eventTypes: [userMessage.eventType].filter(Boolean) as ('past' | 'current' | 'future')[]
          };
          return [newConversation, ...prev];
        }
      });

      setActiveConversationId(conversationId);
      
      // Send to Conductor via webhook for additional analysis
      if (data._conductor) {
        sendWebhook({
          type: 'blink_conversation',
          conversationId,
          userMessage: variables.message,
          assistantResponse: data.finalAnswer,
          conductorInsights: data._conductor,
          timestamp: new Date()
        }).catch(err => console.warn('Webhook failed:', err));
      }
    },
    onError: (error) => {
      toast({
        title: "Conversation Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      });
    }
  });

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeConversationId]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    await sendMessageMutation.mutateAsync({
      message: currentMessage,
      conversationId: activeConversationId || undefined
    });

    setCurrentMessage("");
  };

  const handleTestScenario = async (scenario: string, eventType: 'past' | 'current' | 'future') => {
    await sendMessageMutation.mutateAsync({
      message: `[TEST ${eventType.toUpperCase()}] ${scenario}`,
      conversationId: activeConversationId || undefined
    });
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const latestConductorInsight = getLatestInsight();

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 left-4 z-50">
        <Button
          onClick={onToggle}
          className="relative bg-cyan-500 hover:bg-cyan-600 text-white border-4 border-black shadow-[4px_4px_0px_0px_#000]"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Blink
          {conversations.length > 0 && (
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-orange-400 border-2 border-black rounded-full text-xs flex items-center justify-center font-bold">
              {conversations.length}
            </div>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 max-h-[80vh] flex flex-col">
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000] bg-white flex-1 flex flex-col">
        {/* Header */}
        <CardHeader className="pb-4 border-b-4 border-black bg-cyan-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-6 h-6 text-cyan-600" />
              <div>
                <CardTitle className="text-lg font-black text-black uppercase">Blink</CardTitle>
                <div className="text-sm text-gray-700">Conversational Concierge</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTestMode(!isTestMode)}
                className={`text-xs border-2 border-black ${isTestMode ? 'bg-yellow-200' : 'bg-gray-100'}`}
              >
                {isTestMode ? 'TEST ON' : 'TEST OFF'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-black hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
          {/* Test Scenarios Panel */}
          {isTestMode && (
            <div className="p-3 bg-yellow-50 border-b-2 border-black">
              <div className="text-xs font-bold text-black uppercase mb-2">Test Scenarios</div>
              <div className="grid grid-cols-3 gap-1 text-xs">
                {/* Past Events */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <History className="w-3 h-3 text-blue-600" />
                    <span className="font-bold text-blue-600">PAST</span>
                  </div>
                  {TEST_SCENARIOS.past.slice(0, 2).map((scenario, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTestScenario(scenario, 'past')}
                      className="block w-full text-left p-1 bg-blue-100 border border-black text-xs hover:bg-blue-200 truncate"
                      title={scenario}
                    >
                      {scenario.slice(0, 20)}...
                    </button>
                  ))}
                </div>

                {/* Current Events */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3 text-green-600" />
                    <span className="font-bold text-green-600">NOW</span>
                  </div>
                  {TEST_SCENARIOS.current.slice(0, 2).map((scenario, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTestScenario(scenario, 'current')}
                      className="block w-full text-left p-1 bg-green-100 border border-black text-xs hover:bg-green-200 truncate"
                      title={scenario}
                    >
                      {scenario.slice(0, 20)}...
                    </button>
                  ))}
                </div>

                {/* Future Events */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-purple-600" />
                    <span className="font-bold text-purple-600">FUTURE</span>
                  </div>
                  {TEST_SCENARIOS.future.slice(0, 2).map((scenario, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTestScenario(scenario, 'future')}
                      className="block w-full text-left p-1 bg-purple-100 border border-black text-xs hover:bg-purple-200 truncate"
                      title={scenario}
                    >
                      {scenario.slice(0, 20)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {!activeConversation ? (
              <div className="text-center text-gray-500 py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <div className="text-sm font-medium">Start a conversation</div>
                <div className="text-xs text-gray-400 mt-1">
                  Test past, current, or future events
                </div>
              </div>
            ) : (
              activeConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 border-2 border-black ${
                      message.role === 'user'
                        ? 'bg-cyan-100 shadow-[2px_2px_0px_0px_#000]'
                        : 'bg-white shadow-[2px_2px_0px_0px_#000]'
                    }`}
                  >
                    <div className="text-sm font-medium text-black">{message.content}</div>
                    
                    {/* Message metadata */}
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                      <div className="flex items-center space-x-2">
                        {message.eventType && (
                          <Badge className={`text-xs ${
                            message.eventType === 'past' ? 'bg-blue-100 text-blue-800' :
                            message.eventType === 'current' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {message.eventType}
                          </Badge>
                        )}
                        {message.triggerredAgents && message.triggerredAgents.length > 0 && (
                          <Badge className="bg-orange-100 text-orange-800 text-xs">
                            {message.triggerredAgents.length} agents
                          </Badge>
                        )}
                      </div>
                      <span>{message.timestamp.toLocaleTimeString().slice(0, 5)}</span>
                    </div>

                    {/* Conductor insights preview */}
                    {message.conductorInsights && (
                      <div className="mt-2 p-2 bg-gray-50 border border-gray-300 rounded text-xs">
                        <div className="flex items-center space-x-1 mb-1">
                          <Brain className="w-3 h-3 text-purple-600" />
                          <span className="font-bold text-purple-600">CONDUCTOR</span>
                        </div>
                        <div className="text-gray-700 truncate">
                          {message.conductorInsights.reasoning?.slice(0, 80)}...
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t-4 border-black bg-gray-50 flex-shrink-0">
            <div className="flex space-x-2">
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Ask about past purchases, current locations, or future plans..."
                className="flex-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                disabled={sendMessageMutation.isPending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || sendMessageMutation.isPending}
                className="bg-cyan-500 hover:bg-cyan-600 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conductor Connection Indicator */}
      {latestConductorInsight && (
        <div className="mt-2 p-2 bg-purple-100 border-2 border-black shadow-[4px_4px_0px_0px_#000] text-xs">
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-purple-600" />
            <span className="font-bold text-purple-600">CONDUCTOR ACTIVE</span>
            <span className="text-gray-600">
              {latestConductorInsight.workflows.length} workflows running
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
function detectEventType(message: string): 'past' | 'current' | 'future' | undefined {
  const lowerMessage = message.toLowerCase();
  
  // Past indicators
  if (lowerMessage.includes('recent') || lowerMessage.includes('last') || 
      lowerMessage.includes('previous') || lowerMessage.includes('history') ||
      lowerMessage.includes('purchased') || lowerMessage.includes('bought') ||
      lowerMessage.includes('refund') || lowerMessage.includes('wishlist')) {
    return 'past';
  }
  
  // Future indicators
  if (lowerMessage.includes('book') || lowerMessage.includes('schedule') ||
      lowerMessage.includes('plan') || lowerMessage.includes('tomorrow') ||
      lowerMessage.includes('next') || lowerMessage.includes('flight') ||
      lowerMessage.includes('itinerary') || lowerMessage.includes('cab')) {
    return 'future';
  }
  
  // Current indicators (default for location/now queries)
  if (lowerMessage.includes('current') || lowerMessage.includes('now') ||
      lowerMessage.includes('nearest') || lowerMessage.includes('today') ||
      lowerMessage.includes('trending') || lowerMessage.includes('location')) {
    return 'current';
  }
  
  return undefined;
}

function generateConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateConversationTitle(firstMessage: string): string {
  const short = firstMessage.slice(0, 30);
  if (firstMessage.length > 30) return short + '...';
  return short;
}
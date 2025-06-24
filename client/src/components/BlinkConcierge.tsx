
import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, MessageCircle, X, Minimize2, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ChatBubbleAgent } from "./blink/ChatBubbleAgent";
import { ChatBubbleUser } from "./blink/ChatBubbleUser";
import { LoadingIndicator } from "./blink/LoadingIndicator";
import { ContextPreview } from "./blink/ContextPreview";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  agentName?: string;
}

interface BlinkResponse {
  finalAnswer: string;
  conversation: any[];
  workflow?: string;
  success: boolean;
  error?: string;
}

interface BlinkConciergeProps {
  contextType?: 'generic' | 'feed';
  feedContext?: {
    postId: string;
    action: string;
    productData?: any;
    userAction?: string;
  };
  onClose?: () => void;
  isFloating?: boolean;
  isDrawer?: boolean;
}

export const BlinkConcierge = ({ 
  contextType = 'generic', 
  feedContext, 
  onClose,
  isFloating = false,
  isDrawer = false
}: BlinkConciergeProps) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [isExpanded, setIsExpanded] = useState(!isFloating);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [lastQueryTime, setLastQueryTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useUserProfile();

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initialize with contextual query for feed actions
  useEffect(() => {
    if (contextType === 'feed' && feedContext && !hasInitialized) {
      const contextualQuery = getContextualQuery();
      if (contextualQuery) {
        setQuery(contextualQuery);
        setHasInitialized(true);
        // Auto-submit after a brief moment
        setTimeout(() => {
          handleSubmitWithQuery(contextualQuery);
        }, 1000);
      }
    } else if (contextType === 'generic' && user && !hasInitialized && isExpanded) {
      loadChatHistory();
      setHasInitialized(true);
    }
  }, [contextType, feedContext, user, isExpanded, hasInitialized]);

  const loadChatHistory = async () => {
    if (!user || contextType === 'feed') return;

    try {
      // For now, start with empty chat history since we're migrating away from Supabase
      // Chat history will be built as users interact with the new system
      console.log('Chat history loading disabled during migration - starting fresh');
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };



  const getContextualQuery = () => {
    if (contextType === 'feed' && feedContext) {
      switch (feedContext.action) {
        case 'purchase':
          return `I want to purchase ${feedContext.productData?.name || 'this item'}. Can you help me with the buying process and payment options?`;
        case 'inquire':
          return `I need more information about ${feedContext.productData?.name || 'this item'}. Can you provide details, pricing, and availability?`;
        case 'travel':
          return "I need help planning travel arrangements for this destination. Can you assist with logistics, requirements, and recommendations?";
        case 'sell':
          return "I'm interested in selling similar products. Can you guide me through the selling process and marketplace options?";
        default:
          return `Can you help me with ${feedContext.productData?.name || 'this item'}?`;
      }
    }
    return "";
  };

  const getContextualPlaceholder = () => {
    if (contextType === 'feed' && feedContext) {
      switch (feedContext.action) {
        case 'purchase':
          return `Ask about purchasing ${feedContext.productData?.name || 'this item'}...`;
        case 'inquire':
          return `Ask questions about ${feedContext.productData?.name || 'this item'}...`;
        case 'travel':
          return "Ask about travel arrangements, logistics, or requirements...";
        case 'sell':
          return "Ask about selling products, pricing, or marketplace guidance...";
        default:
          return "How can I help with this item?";
      }
    }
    return `Hi ${profile?.username || 'there'}! How can I assist you today?`;
  };

  const isDuplicateQuery = (queryText: string): boolean => {
    const now = Date.now();
    const timeDiff = now - lastQueryTime;
    
    if (queryText.trim() === lastQuery && timeDiff < 5000) {
      return true;
    }
    
    setLastQuery(queryText.trim());
    setLastQueryTime(now);
    return false;
  };

  const processAgentResponses = (conversation: any[]): ChatMessage[] => {
    const agentMessages: ChatMessage[] = [];
    
    conversation.forEach((msg, index) => {
      if (msg.speaker !== 'User') {
        agentMessages.push({
          id: `agent-${Date.now()}-${index}`,
          role: 'assistant',
          content: msg.content,
          timestamp: new Date(),
          agentName: msg.speaker
        });
      }
    });
    
    return agentMessages;
  };

  const handleSubmitWithQuery = async (queryText: string) => {
    if (!queryText.trim() || !user || loading) return;

    // Check for duplicate queries
    if (isDuplicateQuery(queryText)) {
      toast({
        title: "Already asking that",
        description: "Please wait for the current response...",
        variant: "default",
      });
      return;
    }

    setLoading(true);
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const response: BlinkResponse = await apiClient.sendBlinkMessage({
        query: queryText.trim(),
        sessionId,
        contextType,
        feedContext
      });
      
      if (response.success) {
        // Process individual agent responses
        if (response.conversation && response.conversation.length > 0) {
          const agentMessages = processAgentResponses(response.conversation);
          setMessages(prev => [...prev, ...agentMessages]);
        } else if (response.finalAnswer) {
          // Fallback to final answer if no conversation
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.finalAnswer,
            timestamp: new Date(),
            agentName: 'PathSync'
          };
          
          setMessages(prev => [...prev, assistantMessage]);
        }
        
        setQuery("");
        
        toast({
          title: "✨ Response Ready",
          description: "Your request has been processed successfully",
        });

        if (response.workflow) {
          toast({
            title: "🔔 Action Initiated",
            description: "You'll be notified when complete",
          });
        }
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Blink error:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to process request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmitWithQuery(query);
  };

  const handleMinimize = () => {
    if (onClose) {
      onClose();
    } else if (isFloating) {
      setIsExpanded(false);
    } else {
      setIsMinimized(true);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (isFloating) {
      setIsExpanded(false);
    } else {
      setIsMinimized(true);
    }
  };

  const handleRestore = () => {
    if (isFloating) {
      setIsExpanded(true);
    } else {
      setIsMinimized(false);
    }
  };

  // Show minimized state for non-floating version
  if (!isFloating && !isDrawer && isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleRestore}
          className="flex items-center space-x-2 bg-purple-500 text-white border-4 border-black font-bold shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200"
        >
          <Sparkles className="w-5 h-5" />
          <span>Blink Assistant</span>
        </Button>
      </div>
    );
  }

  if (isFloating && !isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="w-16 h-16 rounded-full bg-purple-500 text-white border-4 border-black font-bold shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-200 transform hover:translate-x-[-2px] hover:translate-y-[-2px]"
        >
          <Sparkles className="w-8 h-8" />
        </Button>
      </div>
    );
  }

  const containerClasses = isDrawer 
    ? 'w-full h-full' 
    : isFloating 
      ? 'fixed bottom-6 right-6 w-96 h-[600px] z-50 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-lg overflow-hidden'
      : 'w-full max-w-4xl mx-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] rounded-lg overflow-hidden';

  const chatContainerClasses = isDrawer 
    ? 'h-[calc(100vh-280px)]'
    : isFloating 
      ? 'h-96'
      : 'h-80';

  return (
    <div className={`${containerClasses} ${isDrawer ? 'sm:w-full md:w-[60%] md:max-w-none md:mx-auto' : ''}`}>
      {/* Header */}
      <div className="p-4 border-b-4 border-black bg-gradient-to-r from-purple-100 to-blue-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-black text-black uppercase tracking-tight">
              Blink Assistant
            </h3>
            <p className="text-xs text-gray-700 font-medium">
              {contextType === 'feed' ? 'Contextual AI Helper' : 'Your AI Assistant'}
            </p>
          </div>
        </div>
        
        {!isDrawer && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleMinimize}
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-purple-200 border-2 border-transparent hover:border-black transition-all rounded"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 hover:bg-red-200 border-2 border-transparent hover:border-black transition-all rounded"
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {isDrawer && (
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 hover:bg-red-200 border-2 border-transparent hover:border-black transition-all rounded"
            title="Close"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Context Preview */}
      {contextType === 'feed' && feedContext && (
        <div className="px-4 pt-2">
          <ContextPreview 
            productName={feedContext.productData?.name}
            price={feedContext.productData?.price}
            action={feedContext.action}
          />
        </div>
      )}

      {/* Chat Messages */}
      <div className={`${chatContainerClasses} overflow-y-auto p-4 bg-gray-50 flex flex-col`}>
        {messages.length === 0 && !loading && (
          <div className="text-center py-8 flex-1 flex flex-col justify-center">
            <Sparkles className="w-12 h-12 mx-auto text-purple-400 mb-4" />
            <p className="text-gray-600 font-medium">
              {contextType === 'feed' ? 'Ready to help with your request...' : 'Start a conversation with your AI assistant'}
            </p>
          </div>
        )}

        <div className="flex-1">
          {messages.map((message) => (
            message.role === 'user' ? (
              <ChatBubbleUser 
                key={message.id}
                content={message.content}
                timestamp={message.timestamp}
              />
            ) : (
              <ChatBubbleAgent 
                key={message.id}
                agentName={message.agentName || 'PathSync'}
                content={message.content}
                timestamp={message.timestamp}
              />
            )
          ))}

          {loading && <LoadingIndicator />}
        </div>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Section */}
      <div className="p-4 border-t-4 border-black bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getContextualPlaceholder()}
            className="flex-1 p-3 border-4 border-black rounded text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={loading}
          />
          
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-purple-500 text-white border-4 border-black font-bold px-4 py-3 hover:bg-purple-600 shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transition-all duration-200 transform hover:translate-x-[-1px] hover:translate-y-[-1px] rounded"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

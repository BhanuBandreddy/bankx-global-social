
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, MessageCircle, X, Minimize2, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";

interface ConversationMessage {
  speaker: string;
  content: string;
  emoji?: string;
}

interface BlinkResponse {
  finalAnswer: string;
  conversation: ConversationMessage[];
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
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);
  const [isExpanded, setIsExpanded] = useState(!isFloating);
  const [isMinimized, setIsMinimized] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useUserProfile();

  // Auto-process feed context when component mounts
  useEffect(() => {
    if (contextType === 'feed' && feedContext && user && !loading && conversation.length === 0) {
      const contextualQuery = getContextualQuery();
      if (contextualQuery) {
        setQuery(contextualQuery);
        // Auto-submit the contextual query
        setTimeout(() => {
          handleSubmitWithQuery(contextualQuery);
        }, 500);
      }
    }
  }, [contextType, feedContext, user]);

  // Only load conversation history for generic mode
  useEffect(() => {
    if (user && isExpanded && contextType === 'generic') {
      loadConversationHistory();
    }
  }, [user, isExpanded, contextType]);

  const loadConversationHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('blink_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        const history = data.map(msg => ({
          speaker: msg.speaker,
          content: msg.content,
          emoji: msg.speaker === 'User' ? '👤' : getAgentEmoji(msg.speaker)
        }));
        setConversation(history);
      }
    } catch (error) {
      console.error('Error loading conversation history:', error);
    }
  };

  const getAgentEmoji = (speaker: string) => {
    const emojiMap: { [key: string]: string } = {
      'TrustPay': '🔐',
      'GlobeGuides': '🌍',
      'LocaleLens': '📍',
      'PathSync': '⚡'
    };
    return emojiMap[speaker] || '🤖';
  };

  const getContextualQuery = () => {
    if (contextType === 'feed' && feedContext) {
      switch (feedContext.action) {
        case 'purchase':
          return `I want to buy ${feedContext.productData?.name || 'this item'}. Can you help me with the purchase process?`;
        case 'inquire':
          return `I have questions about ${feedContext.productData?.name || 'this item'}. Can you provide more details?`;
        case 'travel':
          return "I need help with travel arrangements and logistics for this destination.";
        case 'sell':
          return "I want to sell similar products. Can you guide me through the process?";
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
    return `Hi ${profile?.username || 'there'}! I'm your AI concierge. How can I assist you today?`;
  };

  const handleSubmitWithQuery = async (queryText: string) => {
    if (!queryText.trim() || !user) return;

    setLoading(true);
    const userMessage = { speaker: "User", content: queryText.trim(), emoji: "👤" };
    setConversation(prev => [...prev, userMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('multi-agent-orchestrator', {
        body: { 
          query: queryText.trim(),
          userId: user.id,
          sessionId,
          contextType,
          feedContext
        }
      });

      if (error) throw error;

      const response: BlinkResponse = data;
      
      if (response.success) {
        setConversation(prev => [...prev, ...response.conversation.slice(1)]);
        setQuery("");
        
        toast({
          title: "⚡ Blink Complete",
          description: "Your request has been processed successfully",
        });

        if (response.workflow) {
          toast({
            title: "🔔 Workflow Created",
            description: "You'll be notified when actions are complete",
          });
        }
      } else {
        throw new Error(response.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Blink error:', error);
      toast({
        title: "❌ Blink Error",
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
          className="flex items-center space-x-2 bg-purple-500 text-white border-2 border-black font-bold shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200"
        >
          <Sparkles className="w-5 h-5" />
          <span>Blink Concierge</span>
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
      ? 'fixed bottom-6 right-6 w-96 h-[600px] z-50 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]'
      : 'w-full max-w-4xl mx-auto bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]';

  return (
    <div className={containerClasses}>
      {/* Header with minimize/close controls */}
      <div className="p-4 border-b-4 border-black bg-purple-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-black text-black uppercase tracking-tight">
              Blink Concierge
            </h3>
            <p className="text-xs text-gray-700 font-medium">
              {contextType === 'feed' ? 'Context-Aware Assistant' : 'Your AI Concierge'}
            </p>
          </div>
        </div>
        
        {!isDrawer && (
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleMinimize}
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-purple-200 border-2 border-transparent hover:border-black transition-all"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-red-200 border-2 border-transparent hover:border-black transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Conversation Display */}
      <div className={`${isFloating ? 'h-96' : isDrawer ? 'h-[calc(100vh-280px)]' : 'h-80'} overflow-y-auto p-4 space-y-3 bg-gray-50`}>
        {conversation.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 mx-auto text-purple-400 mb-4" />
            <p className="text-gray-600 font-medium">
              {contextType === 'feed' ? 'Processing your request...' : 'Your conversation history will appear here'}
            </p>
          </div>
        )}

        {conversation.map((message, idx) => (
          <div
            key={idx}
            className={`p-3 border-2 border-black ${
              message.speaker === 'User' 
                ? 'bg-blue-100 border-blue-400' 
                : message.speaker === 'TrustPay'
                ? 'bg-green-100 border-green-400'
                : message.speaker === 'GlobeGuides'
                ? 'bg-yellow-100 border-yellow-400'
                : message.speaker === 'LocaleLens'
                ? 'bg-orange-100 border-orange-400'
                : 'bg-purple-100 border-purple-400'
            }`}
          >
            <div className="flex items-center space-x-2 mb-2">
              {message.emoji && <span className="text-sm">{message.emoji}</span>}
              <span className="font-bold text-black uppercase text-xs">
                {message.speaker}
              </span>
            </div>
            <p className="text-black text-sm leading-relaxed">{message.content}</p>
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div className="p-4 border-t-4 border-black bg-white">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={getContextualPlaceholder()}
            className="w-full p-3 border-2 border-black text-black placeholder-gray-500 resize-none text-sm"
            rows={2}
            disabled={loading}
          />
          
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full bg-purple-500 text-white border-2 border-black font-bold py-2 hover:bg-purple-600 shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transition-all duration-200 transform hover:translate-x-[-1px] hover:translate-y-[-1px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 mr-2" />
                Send to Blink
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

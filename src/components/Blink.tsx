
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";

interface ConversationMessage {
  speaker: string;
  content: string;
  emoji?: string;
}

interface BlinkResponse {
  finalAnswer: string;
  conversation: ConversationMessage[];
  success: boolean;
  error?: string;
}

export const Blink = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [finalAnswer, setFinalAnswer] = useState("");
  const { toast } = useToast();

  const exampleQueries = [
    "How can I securely send money internationally to France?",
    "I want to buy vintage items in Tokyo and ship them globally",
    "What are the trust requirements for cross-border luxury goods trading?",
    "Help me set up international payments for my small business"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setConversation([]);
    setFinalAnswer("");

    try {
      const { data, error } = await supabase.functions.invoke('multi-agent-orchestrator', {
        body: { query: query.trim() }
      });

      if (error) throw error;

      const response: BlinkResponse = data;
      
      if (response.success) {
        setConversation(response.conversation);
        setFinalAnswer(response.finalAnswer);
        toast({
          title: "⚡ Blink Analysis Complete",
          description: "Multi-agent coordination finished successfully",
        });
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

  const useExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border-4 border-black">
      {/* Header */}
      <div className="p-6 border-b-4 border-black bg-purple-100">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-black text-black uppercase tracking-tight">Blink</h2>
            <p className="text-sm text-gray-700 font-medium">Multi-Agent AI Coordination</p>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-6 border-b-4 border-black bg-gray-50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="query" className="block text-sm font-bold text-black mb-2 uppercase">
              Ask the AI Agents
            </label>
            <textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your question for the AI agent team..."
              className="w-full p-3 border-4 border-black text-black placeholder-gray-500 resize-none"
              rows={3}
              disabled={loading}
            />
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-bold text-gray-600 uppercase self-center">Quick Examples:</span>
            {exampleQueries.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => useExampleQuery(example)}
                className="px-3 py-1 bg-white border-2 border-gray-300 text-xs font-medium text-gray-700 hover:border-purple-400 hover:bg-purple-50 transition-colors"
                disabled={loading}
              >
                {example.slice(0, 40)}...
              </button>
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full bg-purple-500 text-white border-4 border-black font-bold text-lg py-3 hover:bg-purple-600 shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-200 transform hover:translate-x-[-2px] hover:translate-y-[-2px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                AI Agents Working...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Activate Blink
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Conversation Display */}
      {conversation.length > 0 && (
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-black uppercase border-b-2 border-black pb-2">
            Agent Coordination Log
          </h3>
          
          <div className="space-y-3">
            {conversation.map((message, idx) => (
              <div
                key={idx}
                className={`p-4 border-3 border-black ${
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
                  {message.emoji && <span className="text-lg">{message.emoji}</span>}
                  <span className="font-bold text-black uppercase text-sm">
                    {message.speaker}
                  </span>
                </div>
                <p className="text-black text-sm leading-relaxed">{message.content}</p>
              </div>
            ))}
          </div>

          {/* Final Answer */}
          {finalAnswer && (
            <div className="mt-6 p-4 bg-lime-100 border-4 border-lime-400">
              <h4 className="font-bold text-black uppercase text-sm mb-2 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Final Recommendation
              </h4>
              <p className="text-black font-medium">{finalAnswer}</p>
            </div>
          )}
        </div>
      )}

      {/* Info Footer */}
      <div className="p-4 bg-gray-100 border-t-4 border-black text-center">
        <p className="text-xs text-gray-600 font-medium">
          Powered by TrustPay 🔐 • GlobeGuides 🌍 • LocaleLens 📍 • PathSync ⚡
        </p>
      </div>
    </div>
  );
};

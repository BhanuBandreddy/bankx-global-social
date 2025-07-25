import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, User, Minimize2, Maximize2 } from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BlinkChatPanelProps {
  isExpanded?: boolean;
}

export const BlinkChatPanel = ({ isExpanded = false }: BlinkChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(!isExpanded);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/blink/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });

      const data = await response.json();
      console.log('Blink API response:', data); // Debug log
      
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.finalAnswer || data.response || "I'm here to help!",
          timestamp: new Date()
        };
        console.log('Adding assistant message:', assistantMessage); // Debug log
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('API returned error:', data.error);
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`neo-brutalist bg-cyan-50 border-4 border-black transition-all duration-300 ${
      isMinimized ? 'h-20' : 'h-[700px]'
    }`} style={{ fontFamily: 'Roboto Mono, monospace' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b-4 border-black bg-cyan-100">
        <div className="flex items-center space-x-3">
          <Bot className="w-6 h-6 text-black" strokeWidth={2.5} />
          <h3 className="font-black text-lg uppercase text-black" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '1px' }}>
            BLINK CHAT
          </h3>
        </div>
        <Button
          onClick={() => setIsMinimized(!isMinimized)}
          className="neo-brutalist bg-white text-black hover:bg-gray-100 p-1"
          size="sm"
        >
          {isMinimized ? <Maximize2 size={14} strokeWidth={2.5} /> : <Minimize2 size={14} strokeWidth={2.5} />}
        </Button>
      </div>

      {/* Chat Content */}
      {!isMinimized && (
        <div className="flex flex-col h-[650px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-12 h-12 mx-auto text-gray-400 mb-3" strokeWidth={1.5} />
                <p className="text-gray-500 font-medium text-sm">Start a conversation...</p>
                <p className="text-gray-400 text-xs mt-1">Ask about anything!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-2 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="neo-brutalist bg-white p-1 border-2 border-black">
                      <Bot className="w-4 h-4 text-black" strokeWidth={2.5} />
                    </div>
                  )}
                  <div
                    className={`neo-brutalist max-w-xs p-3 text-sm font-medium border-2 border-black ${
                      message.role === 'user'
                        ? 'bg-black text-white'
                        : 'bg-white text-black'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <div className="neo-brutalist bg-black p-1 border-2 border-black">
                      <User className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex items-start space-x-2">
                <div className="neo-brutalist bg-white p-1 border-2 border-black">
                  <Bot className="w-4 h-4 text-black animate-pulse" strokeWidth={2.5} />
                </div>
                <div className="neo-brutalist bg-white text-black p-3 text-sm font-medium border-2 border-black">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-4 border-black bg-cyan-100 p-4">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="neo-brutalist bg-white text-black placeholder-gray-500 border-2 border-black focus:border-black font-medium text-sm"
                style={{ fontFamily: 'Roboto Mono, monospace' }}
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                className="neo-brutalist bg-black text-white hover:bg-gray-800 px-4"
              >
                <Send size={16} strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
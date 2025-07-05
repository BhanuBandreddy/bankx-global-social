import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Send, X, Minus, Maximize2, Bot, User } from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatSidebar = ({ isOpen, onToggle }: ChatSidebarProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
      
      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.finalAnswer || data.response || "I'm here to help!",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
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

  if (!isOpen) return null;

  return (
    <div className={`fixed right-0 top-0 h-full bg-white border-l-4 border-black shadow-[-8px_0_0_0_#000] z-40 transition-all duration-300 ${
      isMinimized ? 'w-12' : 'w-96'
    }`}>
      {/* Header */}
      <div className="p-4 border-b-4 border-black bg-cyan-100 flex items-center justify-between">
        {!isMinimized && (
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-cyan-600" />
            <h3 className="font-black text-black uppercase">Chat</h3>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsMinimized(!isMinimized)}
            variant="ghost"
            size="sm"
            className="text-black hover:bg-cyan-200"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
          </Button>
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="text-black hover:bg-cyan-200"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-140px)]">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <Bot className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Start a conversation...</p>
                <p className="text-xs text-gray-400 mt-1">Ask about anything!</p>
              </div>
            )}
            
            {messages.map((message) => (
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
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && <Bot className="w-4 h-4 mt-1 text-cyan-600" />}
                    {message.role === 'user' && <User className="w-4 h-4 mt-1 text-cyan-600" />}
                    <div className="flex-1">
                      <p className="text-sm text-black">{message.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_#000]">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-cyan-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t-4 border-black bg-white">
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 border-2 border-black focus:ring-0 focus:border-cyan-600"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-cyan-600 hover:bg-cyan-700 text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] font-bold"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
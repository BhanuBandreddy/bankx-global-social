import { Navbar } from "@/components/Navbar";
import { SocialFeed } from "@/components/SocialFeed";
import { ChatSidebar } from "@/components/ChatSidebar";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export const Feed = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: 'Roboto Mono, monospace' }}>
      <Navbar />
      
      {/* Header */}
      <div className="bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button className="neo-brutalist bg-gray-200 text-black hover:bg-gray-300">
                  <ArrowLeft size={20} className="mr-2" />
                  BACK TO HERO
                </Button>
              </Link>
              <h1 
                className="text-4xl font-black text-black uppercase"
                style={{ fontFamily: 'Bebas Neue, sans-serif' }}
              >
                GLOBAL FEED
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`max-w-7xl mx-auto px-4 py-8 transition-all duration-300 ${isChatOpen ? 'mr-96' : ''}`}>
        <SocialFeed />
      </div>

      {/* Floating Blink Button */}
      {!isChatOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsChatOpen(true)}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] font-black uppercase rounded-none"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            BLINK
          </Button>
        </div>
      )}

      {/* Chat Sidebar */}
      <ChatSidebar 
        isOpen={isChatOpen} 
        onToggle={() => setIsChatOpen(!isChatOpen)} 
      />
    </div>
  );
};
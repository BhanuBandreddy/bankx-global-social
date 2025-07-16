import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { BlinkChatPanel } from "@/components/BlinkChatPanel";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const StableBlinkPanel = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`h-full bg-gray-100 transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-96'} flex flex-col`}>
      {/* Header with Collapse Button */}
      <div className="p-4 border-b-4 border-black bg-gray-100 flex items-center justify-between">
        {!isCollapsed && (
          <div className="neo-brutalist bg-cyan-400 text-black px-4 py-2 inline-block">
            <span className="font-black text-lg uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
              🤖 BLINK
            </span>
          </div>
        )}
        
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="neo-brutalist bg-white text-black hover:bg-gray-200 p-2 flex-shrink-0"
        >
          {isCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </Button>
      </div>

      {/* Chat Content or Collapsed State */}
      {isCollapsed ? (
        <div className="flex-1 flex flex-col items-center justify-center p-2">
          <div 
            className="neo-brutalist bg-cyan-400 text-black w-12 h-12 flex items-center justify-center cursor-pointer hover:bg-cyan-500"
            onClick={() => setIsCollapsed(false)}
          >
            <span className="font-black text-xl">B</span>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <BlinkChatPanel />
        </div>
      )}
    </div>
  );
};
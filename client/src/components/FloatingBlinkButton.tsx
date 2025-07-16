import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BlinkChatPanel } from "@/components/BlinkChatPanel";

export const FloatingBlinkButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full neo-brutalist bg-cyan-400 text-black hover:bg-cyan-500 shadow-lg z-50 flex items-center justify-center"
            style={{ fontFamily: 'Bebas Neue, sans-serif' }}
          >
            <span className="text-2xl font-black">B</span>
          </Button>
        </DialogTrigger>

        {/* Modal Content */}
        <DialogContent 
          className="max-w-4xl w-full h-[80vh] neo-brutalist bg-white p-0 border-4 border-black"
          style={{ fontFamily: 'Roboto Mono, monospace' }}
        >
          <DialogHeader className="px-6 py-4 border-b-4 border-black">
            <DialogTitle className="text-2xl font-black uppercase text-black" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
              🤖 BLINK AI ASSISTANT
            </DialogTitle>
          </DialogHeader>
          
          {/* Chat Panel in Modal */}
          <div className="flex-1 overflow-hidden">
            <BlinkChatPanel />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
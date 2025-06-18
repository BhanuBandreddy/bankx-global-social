
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { BlinkConcierge } from "./BlinkConcierge";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface FeedActionTriggerProps {
  action: string;
  postId: string;
  productData?: any;
  userAction?: string;
  label: string;
  className?: string;
}

export const FeedActionTrigger = ({ 
  action, 
  postId, 
  productData, 
  userAction, 
  label,
  className = ""
}: FeedActionTriggerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className={`${className} flex items-center space-x-2 border-4 border-black font-bold shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transition-all duration-200`}>
          <Sparkles className="w-4 h-4" />
          <span>{label}</span>
        </Button>
      </DrawerTrigger>
      
      <DrawerContent className="h-[80vh] bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]">
        <BlinkConcierge
          contextType="feed"
          feedContext={{
            postId,
            action,
            productData,
            userAction
          }}
          onClose={() => setIsOpen(false)}
          isFloating={false}
          isDrawer={true}
        />
      </DrawerContent>
    </Drawer>
  );
};


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { BlinkConcierge } from "./BlinkConcierge";

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
  const [showBlink, setShowBlink] = useState(false);

  const handleActionClick = () => {
    setShowBlink(true);
  };

  return (
    <>
      <Button
        onClick={handleActionClick}
        className={`${className} flex items-center space-x-2`}
      >
        <Sparkles className="w-4 h-4" />
        <span>{label}</span>
      </Button>

      {showBlink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <BlinkConcierge
              contextType="feed"
              feedContext={{
                postId,
                action,
                productData,
                userAction
              }}
              onClose={() => setShowBlink(false)}
              isFloating={false}
            />
          </div>
        </div>
      )}
    </>
  );
};

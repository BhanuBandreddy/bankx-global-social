
import { AgentNameBadge } from './AgentNameBadge';

interface ChatBubbleAgentProps {
  agentName: string;
  content: string;
  timestamp: Date;
}

export const ChatBubbleAgent = ({ agentName, content, timestamp }: ChatBubbleAgentProps) => {
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[90%]">
        <AgentNameBadge agentName={agentName} />
        <div className="bg-white border-4 border-black rounded-xl px-4 py-3 text-sm text-black whitespace-pre-wrap shadow-[4px_4px_0px_0px_#000]">
          {content}
        </div>
        <p className="text-xs text-slate-500 pt-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

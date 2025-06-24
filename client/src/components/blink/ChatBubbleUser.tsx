
interface ChatBubbleUserProps {
  content: string;
  timestamp: Date;
}

export const ChatBubbleUser = ({ content, timestamp }: ChatBubbleUserProps) => {
  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-[90%]">
        <div className="bg-blue-500 border-4 border-black rounded-xl px-4 py-3 text-sm text-white shadow-[4px_4px_0px_0px_#000]">
          {content}
        </div>
        <p className="text-xs text-slate-500 pt-1 text-right">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

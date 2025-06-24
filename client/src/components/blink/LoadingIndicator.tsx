
export const LoadingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white border-4 border-black rounded-xl px-4 py-3 text-sm text-black shadow-[4px_4px_0px_0px_#000] flex items-center space-x-2">
        <span className="text-gray-600">Blink is thinking</span>
        <span className="animate-pulse">...</span>
      </div>
    </div>
  );
};

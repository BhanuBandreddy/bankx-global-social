// SVG Flag Component for International Passport Theme
export const FlagGrid = () => {
  const flags = [
    { country: "USA", emoji: "🇺🇸", color: "bg-blue-500" },
    { country: "UK", emoji: "🇬🇧", color: "bg-blue-600" },
    { country: "France", emoji: "🇫🇷", color: "bg-blue-700" },
    { country: "Germany", emoji: "🇩🇪", color: "bg-red-500" },
    { country: "Japan", emoji: "🇯🇵", color: "bg-red-600" },
    { country: "Brazil", emoji: "🇧🇷", color: "bg-green-500" },
    { country: "India", emoji: "🇮🇳", color: "bg-orange-500" },
    { country: "Australia", emoji: "🇦🇺", color: "bg-blue-400" },
    { country: "Canada", emoji: "🇨🇦", color: "bg-red-400" },
    { country: "South Korea", emoji: "🇰🇷", color: "bg-blue-300" },
    { country: "Italy", emoji: "🇮🇹", color: "bg-green-600" },
    { country: "Spain", emoji: "🇪🇸", color: "bg-yellow-500" },
  ];

  return (
    <div className="grid grid-cols-6 gap-1 mb-4">
      {flags.map((flag, index) => (
        <div
          key={flag.country}
          className={`w-10 h-7 ${flag.color} border-2 border-white flex items-center justify-center text-lg font-black`}
        >
          {flag.emoji}
        </div>
      ))}
    </div>
  );
};

export const PassportStamp = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      <div className="absolute -top-2 -right-2 w-16 h-16 border-4 border-red-500 border-dashed rounded-full flex items-center justify-center bg-red-50 rotate-12 opacity-30">
        <span className="text-red-500 font-black text-xs transform -rotate-12">
          GLOBAL
        </span>
      </div>
      {children}
    </div>
  );
};
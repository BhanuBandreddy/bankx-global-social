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
    { country: "Mexico", emoji: "🇲🇽", color: "bg-green-400" },
    { country: "Netherlands", emoji: "🇳🇱", color: "bg-orange-400" },
    { country: "Sweden", emoji: "🇸🇪", color: "bg-yellow-400" },
    { country: "Switzerland", emoji: "🇨🇭", color: "bg-red-300" },
  ];

  return (
    <div className="grid grid-cols-8 gap-2 mb-6 opacity-20">
      {flags.map((flag, index) => (
        <div
          key={flag.country}
          className={`w-8 h-6 ${flag.color} border-2 border-black flex items-center justify-center text-xs font-black animate-pulse`}
          style={{
            animationDelay: `${index * 0.1}s`,
            animationDuration: '3s'
          }}
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
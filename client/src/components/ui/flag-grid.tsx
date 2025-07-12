// SVG Flag Component for International Passport Theme
export const FlagGrid = () => {
  const flags = [
    { country: "USA", emoji: "🇺🇸" },
    { country: "UK", emoji: "🇬🇧" },
    { country: "France", emoji: "🇫🇷" },
    { country: "Germany", emoji: "🇩🇪" },
    { country: "Japan", emoji: "🇯🇵" },
    { country: "Brazil", emoji: "🇧🇷" },
    { country: "India", emoji: "🇮🇳" },
    { country: "Australia", emoji: "🇦🇺" },
    { country: "Canada", emoji: "🇨🇦" },
    { country: "South Korea", emoji: "🇰🇷" },
    { country: "Italy", emoji: "🇮🇹" },
    { country: "Spain", emoji: "🇪🇸" },
    { country: "Mexico", emoji: "🇲🇽" },
    { country: "Netherlands", emoji: "🇳🇱" },
    { country: "Sweden", emoji: "🇸🇪" },
    { country: "Switzerland", emoji: "🇨🇭" },
    { country: "Norway", emoji: "🇳🇴" },
    { country: "South Africa", emoji: "🇿🇦" },
  ];

  return (
    <div className="grid grid-cols-6 gap-1 mb-4">
      {flags.map((flag, index) => (
        <div
          key={flag.country}
          className="w-10 h-7 bg-white border-2 border-white flex items-center justify-center text-lg font-black"
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
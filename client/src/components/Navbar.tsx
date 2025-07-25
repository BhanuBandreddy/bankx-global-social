
import { AuthNavbar } from "./AuthNavbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="neo-brutalist bg-black border-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-green-900/20 opacity-50"></div>
      <div className="container mx-auto px-6 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 
              className="text-3xl font-black text-white uppercase cursor-pointer focus-ring transition-all duration-300 hover:scale-105 hover:text-yellow-300 transform"
              onClick={() => navigate("/")}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate("/")}
              style={{ 
                fontFamily: 'Bebas Neue, sans-serif', 
                letterSpacing: '3px',
                textShadow: '3px 3px 0 rgba(0,0,0,0.8), 6px 6px 0 rgba(255,255,255,0.1)'
              }}
            >
              GLOBAL SOCIAL 🌍
            </h1>
            <div className="hidden md:flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs font-bold uppercase tracking-wider">LIVE</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <AuthNavbar />
          </div>
        </div>
      </div>
    </nav>
  );
};

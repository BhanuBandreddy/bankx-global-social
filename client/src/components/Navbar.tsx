
import { AuthNavbar } from "./AuthNavbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="neo-brutalist bg-black border-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 
              className="text-2xl font-black text-white uppercase cursor-pointer focus-ring"
              onClick={() => navigate("/")}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate("/")}
              style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}
            >
              GLOBAL SOCIAL 🌍
            </h1>

          </div>
          
          <AuthNavbar />
        </div>
      </div>
    </nav>
  );
};

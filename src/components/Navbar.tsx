
import { AuthNavbar } from "./AuthNavbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="border-b-4 border-white bg-charcoal">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 
              className="text-2xl font-black text-white uppercase tracking-tight cursor-pointer focus-ring border-b-2 border-gold pb-1"
              onClick={() => navigate("/")}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate("/")}
            >
              GLOBAL SOCIAL 🌍
            </h1>
            <div className="flex space-x-2">
              <Button
                onClick={() => navigate("/logistics")}
                className="bg-gold text-charcoal border-4 border-gold hover:bg-gold/90 hover:shadow-gold font-bold focus-ring transition-all duration-150"
              >
                PATHSYNC
              </Button>
            </div>
          </div>
          
          <AuthNavbar />
        </div>
      </div>
    </nav>
  );
};

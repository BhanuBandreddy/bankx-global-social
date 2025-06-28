
import { AuthNavbar } from "./AuthNavbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="border-b-4 border-white bg-black">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 
              className="text-2xl font-black text-white uppercase tracking-tight cursor-pointer focus-ring"
              onClick={() => navigate("/")}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate("/")}
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

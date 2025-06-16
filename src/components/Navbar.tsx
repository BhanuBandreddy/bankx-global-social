
import { AuthNavbar } from "./AuthNavbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="border-b-4 border-white bg-black">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 
              className="text-2xl font-black text-white uppercase tracking-tight cursor-pointer"
              onClick={() => navigate("/")}
            >
              GLOBAL SOCIAL 🌍
            </h1>
            <Button
              onClick={() => navigate("/demo")}
              className="bg-lime-400 text-black border-4 border-lime-400 hover:bg-lime-500 font-bold"
            >
              DEMO FLOW
            </Button>
          </div>
          
          <AuthNavbar />
        </div>
      </div>
    </nav>
  );
};

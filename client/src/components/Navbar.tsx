
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
            <div className="flex space-x-2">
              <Button
                onClick={() => navigate("/demo")}
                className="bg-purple-400 text-black border-4 border-purple-400 hover:bg-purple-500 font-bold focus-ring"
              >
                DEMO FLOW
              </Button>
              <Button
                onClick={() => navigate("/workflow")}
                className="bg-blue-400 text-black border-4 border-blue-400 hover:bg-blue-500 font-bold focus-ring"
              >
                WORKFLOW
              </Button>
              <Button
                onClick={() => navigate("/logistics")}
                className="bg-orange-400 text-black border-4 border-orange-400 hover:bg-orange-500 font-bold focus-ring"
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

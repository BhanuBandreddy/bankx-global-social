
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const AuthNavbar = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => navigate('/auth')}
          className="neo-brutalist bg-lime-400 text-black font-black uppercase"
          style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}
        >
          LOGIN
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Avatar className="w-8 h-8 border-2 border-black">
          <AvatarImage src="/placeholder.svg" className="aspect-square h-full w-full bg-[#e7b008]" />
          <AvatarFallback className="bg-lime-400 text-black font-bold">
            {user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-white font-bold hidden md:inline">
          {user.email}
        </span>
      </div>
      <Button
        onClick={signOut}
        className="neo-brutalist bg-cyan-500 text-white font-black uppercase border-white"
        style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}
      >
        LOGOUT
      </Button>
    </div>
  );
};


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
        <div className="w-8 h-8 bg-gold/20 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <Button
          onClick={() => navigate('/auth')}
          className="bg-gold text-charcoal border-4 border-gold font-black hover:bg-gold/90 shadow-[4px_4px_0px_0px_#D4AF37] hover:shadow-gold transition-all"
        >
          LOGIN
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <Avatar className="w-8 h-8 border-2 border-gold">
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback className="bg-gold text-charcoal font-bold">
            {user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-white font-bold hidden md:inline">
          {user.email}
        </span>
      </div>
      <Button
        onClick={signOut}
        variant="outline"
        className="border-2 border-gold text-gold hover:bg-gold hover:text-charcoal font-bold"
      >
        LOGOUT
      </Button>
    </div>
  );
};

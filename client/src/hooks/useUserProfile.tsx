
import { useAuth } from "@/contexts/AuthContext";

export const useUserProfile = () => {
  const { profile, loading } = useAuth();
  
  return { profile, loading };
};

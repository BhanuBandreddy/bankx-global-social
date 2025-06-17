
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  trust_score: number;
  trust_points: number;
  trust_points_history: any[];
  level: string;
  location: string;
  avatar_url: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data) {
          // Transform the database data to match our interface
          const transformedProfile: UserProfile = {
            id: data.id,
            username: data.username || '',
            full_name: data.full_name || '',
            trust_score: data.trust_score || 0,
            trust_points: data.trust_points || 0,
            trust_points_history: Array.isArray(data.trust_points_history) ? data.trust_points_history : [],
            level: data.level || 'Trust Newbie',
            location: data.location || '',
            avatar_url: data.avatar_url || ''
          };
          setProfile(transformedProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, loading };
};

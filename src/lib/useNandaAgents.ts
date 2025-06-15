
import useSWR from 'swr';
import { supabase } from '@/integrations/supabase/client';

const fetcher = async (url: string) => {
  const { data, error } = await supabase.functions.invoke('nanda', {
    body: { 
      method: 'GET',
      path: url 
    }
  });
  
  if (error) throw error;
  return data;
};

export const useNandaAgents = (capability: string) => {
  const { data, error } = useSWR(
    capability ? `/discover?cap=${encodeURIComponent(capability)}` : null,
    fetcher,
    {
      refreshInterval: 15000,
      revalidateOnFocus: false,
    }
  );

  return {
    data: data || [],
    error,
  };
};

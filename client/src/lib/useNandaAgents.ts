
import useSWR from 'swr';
import { supabase } from '@/integrations/supabase/client';

const fetcher = async (url: string) => {
  console.log('Fetching agents from:', url);
  
  const { data, error } = await supabase.functions.invoke('nanda', {
    body: { 
      method: 'GET',
      path: url 
    }
  });
  
  console.log('Supabase function response:', { data, error });
  
  if (error) {
    console.error('Supabase function error:', error);
    throw error;
  }
  
  return data;
};

export const useNandaAgents = (capability: string) => {
  const { data, error } = useSWR(
    capability ? `/discover?cap=${encodeURIComponent(capability)}` : null,
    fetcher,
    {
      refreshInterval: 15000,
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('SWR error:', error);
      },
      onSuccess: (data) => {
        console.log('SWR success, agents loaded:', data?.length || 0);
      }
    }
  );

  return {
    data: data || [],
    error,
  };
};

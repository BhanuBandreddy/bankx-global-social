
import useSWR from 'swr';
import { apiClient } from '@/lib/api';

const fetcher = async (url: string) => {
  console.log('Fetching agents from:', url);
  
  const data = await apiClient.callNandaApi(url);
  
  console.log('NANDA API response:', data);
  
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

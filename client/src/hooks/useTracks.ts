import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface UserTrack {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  isActive: boolean;
  createdAt: string;
}

export function useTracks() {
  return useQuery({
    queryKey: ['/api/tracks/user'],
    retry: false,
  });
}

export function useSetActiveTrack() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (trackId: string) => {
      return apiRequest(`/api/tracks/set-active/${trackId}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracks/user'] });
    },
  });
}

export function useDeleteTrack() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (trackId: string) => {
      return apiRequest(`/api/tracks/${trackId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tracks/user'] });
    },
  });
}
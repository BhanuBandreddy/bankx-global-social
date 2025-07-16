import React from 'react';
import { useTracks, useSetActiveTrack, useDeleteTrack, UserTrack } from '@/hooks/useTracks';
import { Button } from '@/components/ui/button';
import { Play, Trash2, Music } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TrackLibraryProps {
  onTrackSelect: (trackUrl: string, trackName: string) => void;
}

export function TrackLibrary({ onTrackSelect }: TrackLibraryProps) {
  const { data: tracksData, isLoading } = useTracks();
  const setActiveTrack = useSetActiveTrack();
  const deleteTrack = useDeleteTrack();
  const { toast } = useToast();

  const tracks = tracksData?.tracks || [];

  const handlePlayTrack = async (track: UserTrack) => {
    try {
      await setActiveTrack.mutateAsync(track.id);
      const trackUrl = `/api/tracks/stream/${track.id}`;
      onTrackSelect(trackUrl, track.originalName);
      toast({
        title: "Track Selected",
        description: `Now playing: ${track.originalName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load track",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTrack = async (track: UserTrack) => {
    try {
      await deleteTrack.mutateAsync(track.id);
      toast({
        title: "Track Deleted",
        description: `${track.originalName} has been removed`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete track",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)).toString());
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white">Loading your tracks...</div>
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <Music className="w-12 h-12 text-gray-400 mb-4" />
        <div className="text-white mb-2">No tracks uploaded yet</div>
        <div className="text-gray-400 text-sm">Upload your first track to get started</div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-white font-bold text-lg mb-4">Your Music Library</h3>
      {tracks.map((track: UserTrack) => (
        <div
          key={track.id}
          className={`p-3 rounded-lg border-2 ${
            track.isActive
              ? 'bg-cyan-900/30 border-cyan-400'
              : 'bg-gray-800 border-gray-600'
          } hover:border-cyan-300 transition-colors`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-white font-medium truncate">
                {track.originalName}
              </div>
              <div className="text-gray-400 text-sm">
                {formatFileSize(track.fileSize)} • {new Date(track.createdAt).toLocaleDateString()}
                {track.isActive && (
                  <span className="ml-2 text-cyan-400 text-xs">● ACTIVE</span>
                )}
              </div>
            </div>
            <div className="flex gap-2 ml-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handlePlayTrack(track)}
                disabled={setActiveTrack.isPending}
                className="text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-black"
              >
                <Play className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDeleteTrack(track)}
                disabled={deleteTrack.isPending}
                className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
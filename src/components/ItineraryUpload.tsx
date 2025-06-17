
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Upload, MapPin, Calendar, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const ItineraryUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [shareAsPost, setShareAsPost] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUploading(true);
    try {
      const { data, error } = await supabase
        .from('blink_workflows')
        .insert({
          user_id: user.id,
          workflow_type: 'itinerary_upload',
          context_data: {
            title,
            description,
            destination,
            duration,
            uploadedAt: new Date().toISOString()
          },
          share_as_post: shareAsPost,
          status: 'processing'
        });

      if (error) throw error;

      toast({
        title: "Itinerary Uploaded Successfully!",
        description: "Your travel itinerary is being processed and will be shared soon.",
      });

      // Reset form
      setTitle("");
      setDescription("");
      setDestination("");
      setDuration("");
      setShareAsPost(true);

    } catch (error) {
      console.error('Error uploading itinerary:', error);
      toast({
        title: "Upload Failed",
        description: "There was an error uploading your itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000] bg-white">
      <CardHeader className="bg-gradient-to-r from-blue-400 to-purple-500 text-white border-b-4 border-black">
        <CardTitle className="flex items-center gap-2 text-2xl font-black">
          <Upload className="w-6 h-6" />
          Share Your Travel Itinerary
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title" className="text-lg font-bold text-black">
              Trip Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Amazing Tokyo Adventure"
              className="mt-2 border-2 border-black focus:border-blue-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="destination" className="text-lg font-bold text-black flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Destination
            </Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Tokyo, Japan"
              className="mt-2 border-2 border-black focus:border-blue-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="duration" className="text-lg font-bold text-black flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Duration
            </Label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 7 days"
              className="mt-2 border-2 border-black focus:border-blue-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-lg font-bold text-black">
              Itinerary Details
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your itinerary, highlights, recommendations..."
              className="mt-2 border-2 border-black focus:border-blue-500 min-h-[120px]"
              required
            />
          </div>

          <div className="flex items-center space-x-3 p-4 bg-gray-50 border-2 border-black">
            <Users className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <Label htmlFor="share-toggle" className="font-bold text-black cursor-pointer">
                Share with Global Community
              </Label>
              <p className="text-sm text-gray-600">
                Let others discover and learn from your travel experience
              </p>
            </div>
            <Switch
              id="share-toggle"
              checked={shareAsPost}
              onCheckedChange={setShareAsPost}
            />
          </div>

          <Button
            type="submit"
            disabled={isUploading}
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 text-white font-black text-lg py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            {isUploading ? "Uploading..." : "Share Itinerary"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

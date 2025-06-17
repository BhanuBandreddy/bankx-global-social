
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, MessageSquare, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const LocalIntelRequest = () => {
  const [location, setLocation] = useState("");
  const [question, setQuestion] = useState("");
  const [urgency, setUrgency] = useState("normal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('blink_workflows')
        .insert({
          user_id: user.id,
          workflow_type: 'local_intel',
          context_data: {
            location,
            question,
            urgency,
            requestedAt: new Date().toISOString()
          },
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Local Intel Request Sent!",
        description: "Local experts will respond to your question soon.",
      });

      // Reset form
      setLocation("");
      setQuestion("");
      setUrgency("normal");

    } catch (error) {
      console.error('Error submitting local intel request:', error);
      toast({
        title: "Request Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_#000] bg-white">
      <CardHeader className="bg-gradient-to-r from-orange-400 to-red-500 text-white border-b-4 border-black">
        <CardTitle className="flex items-center gap-2 text-2xl font-black">
          <MessageSquare className="w-6 h-6" />
          Ask Local Experts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="location" className="text-lg font-bold text-black flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Downtown Tokyo, Shibuya district"
              className="mt-2 border-2 border-black focus:border-orange-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="question" className="text-lg font-bold text-black">
              Your Question
            </Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask locals about hidden gems, safety tips, best restaurants, cultural insights..."
              className="mt-2 border-2 border-black focus:border-orange-500 min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="urgency" className="text-lg font-bold text-black flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Urgency Level
            </Label>
            <select
              id="urgency"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="mt-2 w-full p-2 border-2 border-black focus:border-orange-500 bg-white"
            >
              <option value="low">Low - General inquiry</option>
              <option value="normal">Normal - Planning ahead</option>
              <option value="high">High - Traveling soon</option>
              <option value="urgent">Urgent - Need immediate help</option>
            </select>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-400 to-red-500 text-white font-black text-lg py-3 border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[8px_8px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
          >
            {isSubmitting ? "Sending..." : "Ask Local Experts"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

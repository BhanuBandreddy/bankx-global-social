
import { TrustPointsDisplay } from "./TrustPointsDisplay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Users, CheckCircle, Star } from "lucide-react";

export const EnhancedTrustMetrics = () => {
  // Mock data for demonstration - in real implementation, this would come from API
  const metrics = {
    trustNetwork: {
      connections: 127,
      mutualConnections: 45,
      verifiedConnections: 23
    },
    reputation: {
      rating: 4.8,
      reviews: 89,
      completedTransactions: 156
    },
    trustBadges: [
      { id: 1, name: "Verified Local", icon: CheckCircle, color: "bg-green-500" },
      { id: 2, name: "Travel Expert", icon: Star, color: "bg-blue-500" },
      { id: 3, name: "Community Leader", icon: Users, color: "bg-purple-500" }
    ]
  };

  return (
    <div className="space-y-6">
      <TrustPointsDisplay />
      
      <Card className="border-4 border-black shadow-[4px_4px_0px_0px_#000]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Shield className="w-5 h-5" />
            Trust Network
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-black">{metrics.trustNetwork.connections}</p>
              <p className="text-sm text-gray-600">Connections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-black">{metrics.trustNetwork.mutualConnections}</p>
              <p className="text-sm text-gray-600">Mutual</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-black">{metrics.trustNetwork.verifiedConnections}</p>
              <p className="text-sm text-gray-600">Verified</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-4 border-black shadow-[4px_4px_0px_0px_#000]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Star className="w-5 h-5" />
            Reputation Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-black">{metrics.reputation.rating}</p>
              <p className="text-sm text-gray-600">{metrics.reputation.reviews} reviews</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-black">{metrics.reputation.completedTransactions}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
          <Progress value={metrics.reputation.rating * 20} className="h-2" />
        </CardContent>
      </Card>

      <Card className="border-4 border-black shadow-[4px_4px_0px_0px_#000]">
        <CardHeader>
          <CardTitle className="text-black">Trust Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {metrics.trustBadges.map((badge) => {
              const IconComponent = badge.icon;
              return (
                <Badge
                  key={badge.id}
                  className={`${badge.color} text-white border-2 border-black px-3 py-2`}
                >
                  <IconComponent className="w-4 h-4 mr-2" />
                  {badge.name}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

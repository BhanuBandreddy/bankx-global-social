
import { useAuth } from "@/contexts/AuthContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Star } from "lucide-react";

export const TrustPointsDisplay = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  if (!profile) return null;

  const trustPoints = profile.trust_points || 0;
  const trustHistory = profile.trust_points_history || [];
  const recentActivity = Array.isArray(trustHistory) ? trustHistory.slice(-3) : [];

  const getTrustLevel = (points: number) => {
    if (points >= 1000) return { level: "Trust Expert", color: "bg-purple-500", icon: Trophy };
    if (points >= 500) return { level: "Trust Pro", color: "bg-blue-500", icon: TrendingUp };
    if (points >= 100) return { level: "Trust Builder", color: "bg-green-500", icon: Star };
    return { level: "Trust Newbie", color: "bg-gray-500", icon: Star };
  };

  const trustLevel = getTrustLevel(trustPoints);
  const IconComponent = trustLevel.icon;

  return (
    <Card className="border-4 border-black shadow-[4px_4px_0px_0px_#000]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-black">
          <IconComponent className="w-5 h-5" />
          Trust Points Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-black">{trustPoints}</p>
            <p className="text-sm text-gray-600">Total Trust Points</p>
          </div>
          <Badge className={`${trustLevel.color} text-white border-2 border-black`}>
            {trustLevel.level}
          </Badge>
        </div>

        {recentActivity.length > 0 && (
          <div>
            <h4 className="font-semibold text-black mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{activity.reason}</span>
                  <span className="font-semibold text-green-600">
                    +{activity.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

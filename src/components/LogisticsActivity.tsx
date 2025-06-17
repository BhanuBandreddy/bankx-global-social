
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Package, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LogisticsActivityProps {
  type: 'delivery_request' | 'delivery_offer' | 'pickup_available';
  title: string;
  description: string;
  route?: string;
  trustScore: number;
  timeframe: string;
  price: string;
  badges: string[];
}

export const LogisticsActivity = ({ 
  type, 
  title, 
  description, 
  route, 
  trustScore, 
  timeframe, 
  price, 
  badges 
}: LogisticsActivityProps) => {
  const navigate = useNavigate();

  const getTypeIcon = () => {
    switch (type) {
      case 'delivery_request': return <Package className="w-4 h-4" />;
      case 'delivery_offer': return <Users className="w-4 h-4" />;
      case 'pickup_available': return <MapPin className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case 'delivery_request': return 'bg-blue-100 border-blue-300';
      case 'delivery_offer': return 'bg-green-100 border-green-300';
      case 'pickup_available': return 'bg-orange-100 border-orange-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <Card className={`border-2 ${getTypeColor()}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          {getTypeIcon()}
          <span>{title}</span>
          <Badge className="bg-black text-white">
            Trust: {trustScore}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700">{description}</p>
        
        {route && (
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <MapPin className="w-3 h-3" />
            <span>{route}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{timeframe}</span>
          </div>
          <span className="font-bold text-green-600">{price}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {badges.map((badge, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {badge}
            </Badge>
          ))}
        </div>

        <Button 
          onClick={() => navigate('/logistics')}
          className="w-full bg-orange-500 text-white border-2 border-orange-700 hover:bg-orange-600"
          size="sm"
        >
          View in PathSync
        </Button>
      </CardContent>
    </Card>
  );
};


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Plane, Train } from "lucide-react";
import { JourneyData } from "@/types/journey";

interface JourneyTimelineProps {
  journey: JourneyData;
}

export const JourneyTimeline = ({ journey }: JourneyTimelineProps) => {
  const getTransportIcon = (flight?: string) => {
    if (!flight || flight.toLowerCase().includes('not specified')) return <MapPin className="w-4 h-4" />;
    if (flight.toLowerCase().includes('eurostar') || flight.toLowerCase().includes('thalys')) {
      return <Train className="w-4 h-4" />;
    }
    return <Plane className="w-4 h-4" />;
  };

  return (
    <Card className="border-4 border-black">
      <CardHeader className="bg-blue-100 border-b-4 border-black">
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-6 h-6" />
          <span>🗓️ Your Journey Timeline ({journey.totalDays} days)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {journey.legs.map((leg, index) => (
            <div
              key={index}
              className={`flex items-center space-x-4 p-4 border-2 rounded-lg ${
                leg.isCurrentLocation 
                  ? 'bg-lime-100 border-lime-400 border-4' 
                  : index < journey.currentLegIndex 
                    ? 'bg-gray-100 border-gray-300' 
                    : 'bg-white border-gray-200'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                leg.isCurrentLocation 
                  ? 'bg-lime-500' 
                  : index < journey.currentLegIndex 
                    ? 'bg-gray-400' 
                    : 'bg-blue-500'
              }`}>
                {index + 1}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {getTransportIcon(leg.flight)}
                  <h3 className="font-bold text-lg">
                    {leg.route}
                    {leg.isCurrentLocation && <span className="ml-2 text-lime-600">← You are here</span>}
                  </h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                  <div>
                    <div className="font-medium">Date</div>
                    <div className="text-gray-600">{leg.date}</div>
                  </div>
                  
                  {leg.departureTime && (
                    <div>
                      <div className="font-medium flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Departure</span>
                      </div>
                      <div className="text-gray-600">{leg.departureTime}</div>
                    </div>
                  )}
                  
                  {leg.flight && !leg.flight.includes('Not specified') && (
                    <div>
                      <div className="font-medium">Transport</div>
                      <div className="text-gray-600">{leg.flight}</div>
                    </div>
                  )}
                  
                  <div>
                    <div className="font-medium">Alert</div>
                    <div className="text-gray-600 text-xs">{leg.alerts}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-purple-50 border-4 border-purple-200">
          <h4 className="font-bold text-purple-800 mb-2">🎯 Journey Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium">Cities Visiting</div>
              <div className="text-purple-700">{journey.cities.join(' → ')}</div>
            </div>
            <div>
              <div className="font-medium">Trip Duration</div>
              <div className="text-purple-700">{journey.totalDays} days</div>
            </div>
            <div>
              <div className="font-medium">Current Location</div>
              <div className="text-purple-700">{journey.legs[journey.currentLegIndex]?.destination || 'Unknown'}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

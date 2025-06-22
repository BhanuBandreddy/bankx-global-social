
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JourneyTimeline } from "./JourneyTimeline";
import { ItineraryData } from "@/types/journey";

interface ItineraryDisplayProps {
  itinerary: ItineraryData;
}

// Helper function to safely render data
const renderValue = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (Array.isArray(value)) return value.join(' | ');
  if (typeof value === 'object' && value !== null) {
    if (value.departure && value.arrival) {
      return `Departure: ${value.departure}, Arrival: ${value.arrival}`;
    }
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${val}`)
      .join(', ');
  }
  return String(value);
};

export const ItineraryDisplay = ({ itinerary }: ItineraryDisplayProps) => {
  // If we have journey data, show the enhanced timeline view
  if (itinerary.journey && itinerary.journey.legs.length > 1) {
    return (
      <>
        <JourneyTimeline journey={itinerary.journey} />
        
        {/* Also show current leg details */}
        <Card className="border-4 border-black">
          <CardHeader className="bg-blue-100 border-b-4 border-black">
            <CardTitle>📋 Current Location Details (GlobeGuides™)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 border-2 border-gray-300">
                <div className="font-bold">Route</div>
                <div>{renderValue(itinerary.route)}</div>
              </div>
              <div className="p-4 bg-gray-50 border-2 border-gray-300">
                <div className="font-bold">Date</div>
                <div>{renderValue(itinerary.date)}</div>
              </div>
              <div className="p-4 bg-gray-50 border-2 border-gray-300">
                <div className="font-bold">Weather</div>
                <div>{renderValue(itinerary.weather)}</div>
              </div>
              <div className="p-4 bg-yellow-100 border-2 border-yellow-400">
                <div className="font-bold">Alert</div>
                <div>{renderValue(itinerary.alerts)}</div>
              </div>
            </div>
            
            {(itinerary.flight || itinerary.gate) && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {itinerary.flight && (
                  <div className="p-4 bg-green-50 border-2 border-green-300">
                    <div className="font-bold">Flight</div>
                    <div>{renderValue(itinerary.flight)}</div>
                  </div>
                )}
                {itinerary.gate && (
                  <div className="p-4 bg-green-50 border-2 border-green-300">
                    <div className="font-bold">Gate/Terminal</div>
                    <div>{renderValue(itinerary.gate)}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </>
    );
  }

  // Fallback to legacy single-destination view
  return (
    <Card className="border-4 border-black">
      <CardHeader className="bg-blue-100 border-b-4 border-black">
        <CardTitle>📋 Parsed Itinerary (GlobeGuides™)</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 border-2 border-gray-300">
            <div className="font-bold">Route</div>
            <div>{renderValue(itinerary.route)}</div>
          </div>
          <div className="p-4 bg-gray-50 border-2 border-gray-300">
            <div className="font-bold">Date</div>
            <div>{renderValue(itinerary.date)}</div>
          </div>
          <div className="p-4 bg-gray-50 border-2 border-gray-300">
            <div className="font-bold">Weather</div>
            <div>{renderValue(itinerary.weather)}</div>
          </div>
          <div className="p-4 bg-yellow-100 border-2 border-yellow-400">
            <div className="font-bold">Alert</div>
            <div>{renderValue(itinerary.alerts)}</div>
          </div>
        </div>
        
        {(itinerary.flight || itinerary.gate) && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {itinerary.flight && (
              <div className="p-4 bg-green-50 border-2 border-green-300">
                <div className="font-bold">Flight</div>
                <div>{renderValue(itinerary.flight)}</div>
              </div>
            )}
            {itinerary.gate && (
              <div className="p-4 bg-green-50 border-2 border-green-300">
                <div className="font-bold">Gate/Terminal</div>
                <div>{renderValue(itinerary.gate)}</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

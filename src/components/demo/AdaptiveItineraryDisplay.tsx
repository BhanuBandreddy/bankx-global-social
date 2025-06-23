
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JourneyTimeline } from "./JourneyTimeline";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, AlertTriangle, Plane, Calendar } from "lucide-react";
import { ItineraryData } from "@/types/journey";

interface AdaptiveItineraryDisplayProps {
  itinerary: ItineraryData;
  documentType?: 'single-destination' | 'multi-city';
  totalLegs?: number;
}

// Enhanced helper function to safely render any data type
const renderValue = (value: any): string => {
  if (value === null || value === undefined) return 'Not specified';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.join(' → ');
  if (typeof value === 'object') {
    if (value.departure && value.arrival) {
      return `${value.departure} → ${value.arrival}`;
    }
    return Object.entries(value)
      .filter(([_, val]) => val !== null && val !== undefined)
      .map(([key, val]) => `${key}: ${val}`)
      .join(', ');
  }
  return String(value);
};

// Get appropriate icon for different data types
const getFieldIcon = (fieldName: string) => {
  switch (fieldName.toLowerCase()) {
    case 'route': return <MapPin className="w-4 h-4" />;
    case 'date': return <Calendar className="w-4 h-4" />;
    case 'departuretime':
    case 'arrivaltime': return <Clock className="w-4 h-4" />;
    case 'flight': return <Plane className="w-4 h-4" />;
    case 'alerts': return <AlertTriangle className="w-4 h-4" />;
    default: return null;
  }
};

// Determine field styling based on content
const getFieldStyling = (fieldName: string, value: any) => {
  const stringValue = renderValue(value).toLowerCase();
  
  if (fieldName === 'alerts') {
    if (stringValue.includes('error') || stringValue.includes('failed') || stringValue.includes('problem')) {
      return 'bg-red-100 border-red-400 text-red-800';
    }
    if (stringValue.includes('warning') || stringValue.includes('check') || stringValue.includes('verify')) {
      return 'bg-yellow-100 border-yellow-400 text-yellow-800';
    }
    return 'bg-blue-100 border-blue-400 text-blue-800';
  }
  
  if (stringValue.includes('not specified') || stringValue.includes('unknown') || stringValue.includes('not available')) {
    return 'bg-gray-100 border-gray-300 text-gray-600';
  }
  
  return 'bg-gray-50 border-gray-300 text-gray-900';
};

export const AdaptiveItineraryDisplay = ({ 
  itinerary, 
  documentType = 'single-destination',
  totalLegs = 1 
}: AdaptiveItineraryDisplayProps) => {
  
  // Enhanced journey view for multi-city trips
  if (itinerary.journey && itinerary.journey.legs.length > 1) {
    return (
      <>
        <Card className="border-4 border-black">
          <CardHeader className="bg-gradient-to-r from-blue-100 to-purple-100 border-b-4 border-black">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-6 h-6" />
                <span>🗓️ Multi-City Journey ({totalLegs} destinations)</span>
              </div>
              <Badge variant="outline" className="border-2 border-black">
                {documentType === 'multi-city' ? 'Multi-City Trip' : 'Journey'}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        
        <JourneyTimeline journey={itinerary.journey} />
        
        {/* Current location details */}
        <Card className="border-4 border-black">
          <CardHeader className="bg-lime-100 border-b-4 border-black">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-6 h-6 text-lime-600" />
              <span>📍 Current Location Details (GlobeGuides™)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(itinerary)
                .filter(([key, value]) => key !== 'journey' && value !== undefined && value !== null)
                .map(([key, value]) => (
                  <div key={key} className={`p-4 border-2 rounded-lg ${getFieldStyling(key, value)}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      {getFieldIcon(key)}
                      <div className="font-bold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    </div>
                    <div className="text-sm">{renderValue(value)}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  // Enhanced single destination view
  return (
    <Card className="border-4 border-black">
      <CardHeader className="bg-gradient-to-r from-blue-100 to-green-100 border-b-4 border-black">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-6 h-6" />
            <span>📋 Travel Itinerary (GlobeGuides™)</span>
          </div>
          <Badge variant="outline" className="border-2 border-black">
            {documentType === 'single-destination' ? 'Single Trip' : 'Parsed Document'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Primary travel information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {['route', 'date', 'weather', 'alerts'].map((field) => (
            <div key={field} className={`p-4 border-2 rounded-lg ${getFieldStyling(field, itinerary[field])}`}>
              <div className="flex items-center space-x-2 mb-1">
                {getFieldIcon(field)}
                <div className="font-bold capitalize">{field}</div>
              </div>
              <div className="text-sm">{renderValue(itinerary[field])}</div>
            </div>
          ))}
        </div>
        
        {/* Additional travel details */}
        {(itinerary.flight || itinerary.gate || itinerary.departureTime || itinerary.arrivalTime) && (
          <div className="border-t-2 border-gray-200 pt-4">
            <h4 className="font-bold text-lg mb-3 flex items-center space-x-2">
              <Plane className="w-5 h-5" />
              <span>Transportation Details</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['flight', 'gate', 'departureTime', 'arrivalTime']
                .filter(field => itinerary[field])
                .map((field) => (
                  <div key={field} className="p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      {getFieldIcon(field)}
                      <div className="font-bold text-sm capitalize">
                        {field.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                    <div className="text-sm text-green-800">{renderValue(itinerary[field])}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
        
        {/* Smart insights based on parsed data */}
        <div className="mt-6 p-4 bg-purple-50 border-4 border-purple-200 rounded-lg">
          <h4 className="font-bold text-purple-800 mb-2">🎯 GlobeGuides™ Smart Insights</h4>
          <div className="text-sm text-purple-700 space-y-1">
            <p>• Document type: <span className="font-medium">{documentType}</span></p>
            <p>• Destinations detected: <span className="font-medium">{totalLegs}</span></p>
            <p>• Context ready for LocaleLens AI product discovery</p>
            <p>• Travel data optimized for social commerce experience</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

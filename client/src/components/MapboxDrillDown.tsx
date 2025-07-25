import React, { useState, useCallback, useMemo } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plane, Users, ArrowRight } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mock traveler data with airport coordinates
const travelersData = [
  {
    id: 1,
    name: "Raj Patel",
    origin: "Dubai (DXB)",
    destination: "Delhi (DEL)",
    arrival: "Today 3:30 PM",
    purpose: "Business",
    items: ["Electronics", "Perfumes"],
    trust_score: 92,
    origin_coords: [55.3644, 25.2532], // Dubai
    destination_coords: [77.1025, 28.7041], // Delhi
    route_status: "In Transit",
    flight_number: "EK 512"
  },
  {
    id: 2,
    name: "Sarah Chen",
    origin: "London (LHR)",
    destination: "Delhi (DEL)",
    arrival: "Today 6:15 PM",
    purpose: "Tourism",
    items: ["UK Chocolates", "Books"],
    trust_score: 88,
    origin_coords: [-0.4543, 51.4700], // London Heathrow
    destination_coords: [77.1025, 28.7041], // Delhi
    route_status: "Boarding",
    flight_number: "BA 142"
  },
  {
    id: 3,
    name: "Mike Johnson",
    origin: "New York (JFK)",
    destination: "Mumbai (BOM)",
    arrival: "Tomorrow 10:20 AM",
    purpose: "Business",
    items: ["Tech Gadgets", "Sneakers"],
    trust_score: 95,
    origin_coords: [-73.7781, 40.6413], // JFK
    destination_coords: [72.8777, 19.0760], // Mumbai
    route_status: "Scheduled",
    flight_number: "AI 116"
  },
  {
    id: 4,
    name: "Lisa Wang",
    origin: "Singapore (SIN)",
    destination: "Mumbai (BOM)",
    arrival: "Today 8:45 PM",
    purpose: "Business",
    items: ["Electronics", "Cosmetics"],
    trust_score: 91,
    origin_coords: [103.9915, 1.3644], // Singapore
    destination_coords: [72.8777, 19.0760], // Mumbai
    route_status: "Departed",
    flight_number: "SQ 424"
  }
];

// Airport clusters for different zoom levels
const airportClusters = [
  {
    id: 'india_hub',
    name: 'India Hub',
    coords: [77.5946, 22.9734],
    cities: ['Delhi', 'Mumbai'],
    daily_arrivals: 83000,
    zoom_threshold: 4
  },
  {
    id: 'delhi_airport',
    name: 'Delhi (DEL)',
    coords: [77.1025, 28.7041],
    arrivals_today: 45000,
    travelers: travelersData.filter(t => t.destination.includes('Delhi')),
    zoom_threshold: 6
  },
  {
    id: 'mumbai_airport',
    name: 'Mumbai (BOM)',
    coords: [72.8777, 19.0760],
    arrivals_today: 38000,
    travelers: travelersData.filter(t => t.destination.includes('Mumbai')),
    zoom_threshold: 6
  }
];

interface MapboxDrillDownProps {
  onPersonSelect: (person: any) => void;
}

export default function MapboxDrillDown({ onPersonSelect }: MapboxDrillDownProps) {
  const [viewState, setViewState] = useState({
    latitude: 22.9734,
    longitude: 77.5946,
    zoom: 3
  });

  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [selectedAirport, setSelectedAirport] = useState<string | null>(null);

  // Determine what markers to show based on zoom level
  const visibleMarkers = useMemo(() => {
    if (viewState.zoom < 4) {
      // Global view - show regional clusters
      return [airportClusters[0]]; // India Hub
    } else if (viewState.zoom < 6) {
      // Regional view - show individual airports
      return airportClusters.slice(1); // Delhi and Mumbai airports
    } else {
      // Detailed view - show individual travelers if an airport is selected
      if (selectedAirport) {
        const airport = airportClusters.find(a => a.id === selectedAirport);
        return airport?.travelers || [];
      }
      return airportClusters.slice(1);
    }
  }, [viewState.zoom, selectedAirport]);

  const handleMarkerClick = useCallback((marker: any) => {
    if (marker.zoom_threshold && viewState.zoom < marker.zoom_threshold + 2) {
      // Zoom into cluster/airport
      const coords = marker.coords || marker.destination_coords;
      setViewState({
        latitude: coords[1],
        longitude: coords[0],
        zoom: Math.min(viewState.zoom + 3, 10)
      });
      
      if (marker.id && marker.id.includes('airport')) {
        setSelectedAirport(marker.id);
      }
    } else {
      // Show details popup
      setSelectedMarker(marker);
    }
  }, [viewState.zoom]);

  const handlePersonChat = useCallback((person: any) => {
    onPersonSelect(person);
    setSelectedMarker(null);
  }, [onPersonSelect]);

  const getMarkerStyle = (marker: any) => {
    if (marker.coords) {
      // Airport or cluster marker
      if (marker.id === 'india_hub') {
        return {
          backgroundColor: '#FEE440',
          border: '4px solid black',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '24px'
        };
      } else {
        return {
          backgroundColor: '#04E762',
          border: '3px solid black',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '16px'
        };
      }
    } else {
      // Individual traveler marker
      return {
        backgroundColor: '#FF2975',
        border: '2px solid black',
        borderRadius: '8px',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '14px'
      };
    }
  };

  const getMarkerIcon = (marker: any) => {
    if (marker.coords) {
      return marker.id === 'india_hub' ? '🌍' : '✈️';
    } else {
      return '👤';
    }
  };

  const resetView = () => {
    setViewState({
      latitude: 22.9734,
      longitude: 77.5946,
      zoom: 3
    });
    setSelectedAirport(null);
    setSelectedMarker(null);
  };

  return (
    <div className="relative">
      {/* Map Container */}
      <div style={{ height: '600px', width: '100%' }} className="neo-brutalist border-4 border-black">
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/light-v11"
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Render markers */}
          {visibleMarkers.map((marker) => {
            const coords = marker.coords || marker.destination_coords;
            return (
              <Marker
                key={marker.id || marker.name}
                latitude={coords[1]}
                longitude={coords[0]}
                anchor="center"
              >
                <div
                  style={getMarkerStyle(marker)}
                  onClick={() => handleMarkerClick(marker)}
                  title={marker.name || `${marker.name} - ${marker.destination || 'Destination'}`}
                >
                  {getMarkerIcon(marker)}
                </div>
              </Marker>
            );
          })}

          {/* Popup for selected marker */}
          {selectedMarker && (
            <Popup
              latitude={(selectedMarker.coords || selectedMarker.destination_coords)[1]}
              longitude={(selectedMarker.coords || selectedMarker.destination_coords)[0]}
              onClose={() => setSelectedMarker(null)}
              closeButton={true}
              closeOnClick={false}
              anchor="bottom"
            >
              <div className="p-4 min-w-[250px]">
                {selectedMarker.coords ? (
                  // Airport popup
                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      {selectedMarker.name}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Daily Arrivals:</span>
                        <Badge className="bg-lime-400 text-black">
                          {selectedMarker.arrivals_today?.toLocaleString() || selectedMarker.daily_arrivals?.toLocaleString()}
                        </Badge>
                      </div>
                      {selectedMarker.travelers && (
                        <div className="flex justify-between">
                          <span>Active Travelers:</span>
                          <Badge variant="outline">
                            {selectedMarker.travelers.length}
                          </Badge>
                        </div>
                      )}
                    </div>
                    {viewState.zoom >= 6 && selectedMarker.travelers && (
                      <Button 
                        className="w-full mt-3 neo-brutalist bg-black text-lime-400 text-sm"
                        onClick={() => setSelectedAirport(selectedMarker.id)}
                      >
                        View {selectedMarker.travelers.length} Travelers
                      </Button>
                    )}
                  </div>
                ) : (
                  // Traveler popup
                  <div>
                    <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                      {selectedMarker.name}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Plane className="w-4 h-4" />
                        <span>{selectedMarker.flight_number}</span>
                        <Badge className={selectedMarker.route_status === 'In Transit' ? 'bg-orange-400' : 'bg-green-400'}>
                          {selectedMarker.route_status}
                        </Badge>
                      </div>
                      <div>
                        <strong>Route:</strong> {selectedMarker.origin} → {selectedMarker.destination}
                      </div>
                      <div>
                        <strong>Arrival:</strong> {selectedMarker.arrival}
                      </div>
                      <div>
                        <strong>Purpose:</strong> {selectedMarker.purpose}
                      </div>
                      <div>
                        <strong>Trust Score:</strong> {selectedMarker.trust_score}%
                      </div>
                      <div>
                        <strong>Can Bring:</strong> {selectedMarker.items.join(', ')}
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-3 neo-brutalist bg-lime-400 text-black"
                      onClick={() => handlePersonChat(selectedMarker)}
                    >
                      Start Chat <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 left-4 space-y-2">
        <Button onClick={resetView} className="neo-brutalist bg-white text-black">
          Reset View
        </Button>
        
        <Card className="neo-brutalist bg-white">
          <CardContent className="p-3">
            <div className="text-xs space-y-1">
              <div className="font-bold">Zoom Level: {Math.round(viewState.zoom)}</div>
              <div>🌍 Global View (1-3)</div>
              <div>✈️ Airport View (4-5)</div>
              <div>👤 Traveler View (6+)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4">
        <Card className="neo-brutalist bg-white">
          <CardHeader>
            <CardTitle className="text-sm">Map Legend</CardTitle>
          </CardHeader>
          <CardContent className="p-3 space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-4 bg-yellow-400 border-2 border-black rounded-full"></div>
              <span>Regional Hub</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-4 bg-green-400 border-2 border-black rounded-full"></div>
              <span>Airport</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="w-4 h-4 bg-pink-500 border-2 border-black rounded"></div>
              <span>Traveler</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current View Indicator */}
      <div className="absolute top-4 right-4">
        <Card className="neo-brutalist bg-lime-400 text-black">
          <CardContent className="p-3">
            <div className="text-sm font-bold">
              {viewState.zoom < 4 ? 'Global Travel Network' :
               viewState.zoom < 6 ? 'Airport Destinations' : 
               selectedAirport ? 'Individual Travelers' : 'Airport Detail'}
            </div>
            <div className="text-xs">
              Click markers to drill down • Zoom to see more detail
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
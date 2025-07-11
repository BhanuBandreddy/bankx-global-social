import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Globe from 'react-globe.gl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plane, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TravelerData {
  id: string;
  travelerId: string;
  fromCity: string;
  toCity: string;
  fromCountry: string;
  toCountry: string;
  fromCoordinates: [number, number];
  toCoordinates: [number, number];
  fromAirport: string;
  toAirport: string;
  departureDate: string;
  arrivalDate: string;
  airline: string;
  flightNumber: string;
  maxCarryCapacity: number;
  deliveryFee: number;
  currency: string;
  connectionPurpose: string[];
  travelNote: string;
  status: string;
  trustScore: number;
  verificationStatus: string;
  traveler: {
    id: string;
    name: string;
    trustScore: number;
    level: string;
    avatarUrl?: string;
  };
}

export default function TravelerWorldMap() {
  const navigate = useNavigate();
  const globeRef = useRef();
  const [selectedTraveler, setSelectedTraveler] = useState<TravelerData | null>(null);
  const [animationSpeed, setAnimationSpeed] = useState(1000);

  // Get user's location for map centering
  const { data: userLocation } = useQuery<{location: {city: string, country: string, coordinates: [number, number]}}}>({
    queryKey: ['/api/traveler-discovery/location'],
    queryFn: async () => {
      const res = await fetch('/api/traveler-discovery/location');
      if (!res.ok) throw new Error('Failed to fetch location');
      return res.json();
    }
  });

  // Get travelers coming to user's city
  const { data: incomingData } = useQuery<{travelers: TravelerData[], totalCount: number, targetCity: string}>({
    queryKey: ['/api/traveler-discovery/incoming'],
    queryFn: async () => {
      const res = await fetch('/api/traveler-discovery/incoming');
      if (!res.ok) throw new Error('Failed to fetch incoming travelers');
      return res.json();
    }
  });

  // Prepare animated arcs data for travel routes
  const arcsData = incomingData?.travelers.map((traveler, index) => ({
    startLat: traveler.fromCoordinates[0],
    startLng: traveler.fromCoordinates[1],
    endLat: traveler.toCoordinates[0],
    endLng: traveler.toCoordinates[1],
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5],
    traveler,
    strokeWidth: 2,
    arcStroke: 0.8
  })) || [];

  // Prepare origin points
  const pointsData = incomingData?.travelers.map((traveler, index) => ({
    lat: traveler.fromCoordinates[0],
    lng: traveler.fromCoordinates[1],
    size: 0.8,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5],
    traveler
  })) || [];

  // Center globe on user's location when data loads
  useEffect(() => {
    if (globeRef.current && userLocation?.location) {
      const globe = globeRef.current as any;
      setTimeout(() => {
        globe.pointOfView({
          lat: userLocation.location.coordinates[0],
          lng: userLocation.location.coordinates[1],
          altitude: 2.5
        }, 3000);
      }, 1000);
    }
  }, [userLocation]);

  // Auto-rotate the globe
  useEffect(() => {
    if (globeRef.current) {
      const globe = globeRef.current as any;
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.3;
    }
  }, []);

  const handleConnectionRequest = async (traveler: TravelerData) => {
    try {
      const response = await fetch('/api/traveler-discovery/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itineraryId: traveler.id,
          travelerId: traveler.traveler.id,
          connectionType: 'social',
          message: `Hi! I'd love to connect when you arrive in ${traveler.toCity}. Welcome to the city!`
        })
      });
      
      if (response.ok) {
        alert('Connection request sent successfully!');
        setSelectedTraveler(null);
      }
    } catch (error) {
      console.error('Connection request failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="border-gray-600 hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Global Traveler Network</h1>
              <p className="text-gray-400 text-sm">
                Real-time routes to {userLocation?.location.city || 'your city'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>{incomingData?.totalCount || 0} travelers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Plane className="w-4 h-4 text-green-400" />
              <span>Live tracking</span>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* 3D Globe */}
      <div className="relative w-full h-screen">
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          
          // Points for origin cities
          pointsData={pointsData}
          pointAltitude={0.05}
          pointRadius={(d: any) => d.size}
          pointColor={(d: any) => d.color}
          pointLabel={(d: any) => `${d.traveler.fromCity} → ${d.traveler.toCity}`}
          onPointClick={(d: any) => setSelectedTraveler(d.traveler)}
          
          // Animated travel routes
          arcsData={arcsData}
          arcColor={(d: any) => d.color}
          arcDashLength={0.6}
          arcDashGap={2}
          arcDashAnimateTime={animationSpeed}
          arcStroke={(d: any) => d.arcStroke}
          arcAltitude={0.3}
          arcLabel={(d: any) => 
            `${d.traveler.airline} ${d.traveler.flightNumber}<br/>
             ${d.traveler.fromCity} → ${d.traveler.toCity}<br/>
             Arriving: ${new Date(d.traveler.arrivalDate).toLocaleDateString()}`
          }
          onArcClick={(d: any) => setSelectedTraveler(d.traveler)}
          
          // Atmosphere effect
          atmosphereColor="#1e40af"
          atmosphereAltitude={0.12}
          
          width={window.innerWidth}
          height={window.innerHeight}
        />
      </div>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-10">
        <Card className="bg-black/80 backdrop-blur-sm border-gray-800">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-white">Live Routes</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-1 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Business Travel</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-1 bg-green-500 rounded"></div>
                <span className="text-gray-300">Social Connection</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-1 bg-yellow-500 rounded"></div>
                <span className="text-gray-300">Shopping & Delivery</span>
              </div>
              <div className="fill items-center space-x-2">
                <div className="w-3 h-1 bg-purple-500 rounded"></div>
                <span className="text-gray-300">Cultural Exchange</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Animation Speed Control */}
      <div className="absolute bottom-6 right-6 z-10">
        <Card className="bg-black/80 backdrop-blur-sm border-gray-800">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-3 text-white">Animation</h3>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={animationSpeed === 2000 ? "default" : "outline"}
                onClick={() => setAnimationSpeed(2000)}
                className="text-xs"
              >
                Slow
              </Button>
              <Button
                size="sm"
                variant={animationSpeed === 1000 ? "default" : "outline"}
                onClick={() => setAnimationSpeed(1000)}
                className="text-xs"
              >
                Normal
              </Button>
              <Button
                size="sm"
                variant={animationSpeed === 500 ? "default" : "outline"}
                onClick={() => setAnimationSpeed(500)}
                className="text-xs"
              >
                Fast
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Traveler Modal */}
      {selectedTraveler && (
        <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <Card className="w-full max-w-md bg-black/90 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedTraveler.traveler.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{selectedTraveler.traveler.name}</h3>
                    <p className="text-sm text-gray-400">{selectedTraveler.traveler.level} • {selectedTraveler.trustScore}/100</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedTraveler(null)}
                  className="border-gray-600"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Route</span>
                  <span className="text-white">{selectedTraveler.fromCity} → {selectedTraveler.toCity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Flight</span>
                  <span className="text-white">{selectedTraveler.airline} {selectedTraveler.flightNumber}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Arriving</span>
                  <span className="text-white">{new Date(selectedTraveler.arrivalDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Capacity</span>
                  <span className="text-white">{selectedTraveler.maxCarryCapacity}kg available</span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Interests</p>
                <div className="flex flex-wrap gap-1">
                  {selectedTraveler.connectionPurpose.map(purpose => (
                    <Badge key={purpose} variant="outline" className="text-xs border-gray-600">
                      {purpose}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {selectedTraveler.travelNote && (
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-2">Note</p>
                  <p className="text-sm text-gray-300">{selectedTraveler.travelNote}</p>
                </div>
              )}
              
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleConnectionRequest(selectedTraveler)}
              >
                Send Connection Request
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
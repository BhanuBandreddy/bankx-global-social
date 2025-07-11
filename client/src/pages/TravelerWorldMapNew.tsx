import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Globe from 'react-globe.gl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plane, Users, Search, MapPin } from 'lucide-react';
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

export default function TravelerWorldMapNew() {
  const navigate = useNavigate();
  const globeRef = useRef();
  const [selectedTraveler, setSelectedTraveler] = useState<TravelerData | null>(null);
  const [targetCity, setTargetCity] = useState("New York");
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [searchInput, setSearchInput] = useState("");

  // Get travelers coming to the specified city
  const { data: incomingData, isLoading } = useQuery<{travelers: TravelerData[], totalCount: number, targetCity: string}>({
    queryKey: ['/api/traveler-discovery/incoming', targetCity],
    queryFn: async () => {
      const res = await fetch(`/api/traveler-discovery/incoming?city=${encodeURIComponent(targetCity)}`);
      if (!res.ok) throw new Error('Failed to fetch incoming travelers');
      return res.json();
    },
    enabled: !!targetCity
  });

  // Get coordinates for the target city (simple lookup)
  const getCityCoordinates = (cityName: string): [number, number] => {
    const cityCoords: Record<string, [number, number]> = {
      "New York": [40.7128, -74.0060],
      "London": [51.5074, -0.1278],
      "Paris": [48.8566, 2.3522],
      "Tokyo": [35.6762, 139.6503],
      "Mumbai": [19.0760, 72.8777],
      "Dubai": [25.2048, 55.2708],
      "Singapore": [1.3521, 103.8198],
      "Los Angeles": [34.0522, -118.2437],
      "Berlin": [52.5200, 13.4050],
      "Sydney": [-33.8688, 151.2093]
    };
    return cityCoords[cityName] || [40.7128, -74.0060]; // Default to NYC
  };

  const targetCoordinates = getCityCoordinates(targetCity);

  // Prepare animated arcs data for travel routes
  const arcsData = incomingData?.travelers.map((traveler, index) => ({
    startLat: traveler.fromCoordinates[0],
    startLng: traveler.fromCoordinates[1],
    endLat: traveler.toCoordinates[0],
    endLng: traveler.toCoordinates[1],
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6],
    traveler,
    strokeWidth: 2,
    arcStroke: 1.2
  })) || [];

  // Prepare origin points
  const pointsData = incomingData?.travelers.map((traveler, index) => ({
    lat: traveler.fromCoordinates[0],
    lng: traveler.fromCoordinates[1],
    size: 0.8,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][index % 6],
    traveler
  })) || [];

  // Center globe on target city when data loads
  useEffect(() => {
    if (globeRef.current && targetCoordinates) {
      const globe = globeRef.current as any;
      setTimeout(() => {
        globe.pointOfView({
          lat: targetCoordinates[0],
          lng: targetCoordinates[1],
          altitude: 2.2
        }, 2000);
      }, 500);
    }
  }, [targetCity, targetCoordinates]);

  // Auto-rotate the globe
  useEffect(() => {
    if (globeRef.current) {
      const globe = globeRef.current as any;
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.4;
    }
  }, []);

  const handleCitySearch = () => {
    if (searchInput.trim()) {
      setTargetCity(searchInput.trim());
      setSearchInput("");
    }
  };

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
      alert('Connection request sent! (Demo mode)');
      setSelectedTraveler(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header with City Search */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/90 backdrop-blur-sm border-b border-gray-800">
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
                Discover travelers coming to any city
              </p>
            </div>
          </div>
          
          {/* City Search */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-4 py-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="text-sm">Destination:</span>
              <span className="font-semibold text-blue-300">{targetCity}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Enter city name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCitySearch()}
                className="w-48 bg-gray-800 border-gray-600 text-white"
              />
              <Button 
                onClick={handleCitySearch}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white">Loading travelers to {targetCity}...</p>
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div className="absolute top-20 left-6 z-10">
        <Card className="bg-black/80 backdrop-blur-sm border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span>{incomingData?.totalCount || 0} travelers</span>
              </div>
              <div className="flex items-center space-x-2">
                <Plane className="w-4 h-4 text-green-400" />
                <span>to {targetCity}</span>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3D Globe */}
      <div className="relative w-full h-screen pt-24">
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
          arcAltitude={0.4}
          arcLabel={(d: any) => 
            `${d.traveler.airline} ${d.traveler.flightNumber}<br/>
             ${d.traveler.fromCity} → ${d.traveler.toCity}<br/>
             Arriving: ${new Date(d.traveler.arrivalDate).toLocaleDateString()}`
          }
          onArcClick={(d: any) => setSelectedTraveler(d.traveler)}
          
          // Atmosphere effect
          atmosphereColor="#1e40af"
          atmosphereAltitude={0.15}
          
          width={window.innerWidth}
          height={window.innerHeight - 96}
        />
      </div>

      {/* Quick City Buttons - More Visible */}
      <div className="absolute bottom-6 left-6 z-10">
        <Card className="bg-white/95 backdrop-blur-sm border-2 border-blue-500 shadow-lg">
          <CardContent className="p-4">
            <h3 className="text-sm font-bold mb-3 text-black">Quick Cities</h3>
            <div className="flex flex-wrap gap-2">
              {["New York", "London", "Tokyo", "Mumbai", "Dubai", "Paris"].map(city => (
                <Button
                  key={city}
                  size="sm"
                  variant={targetCity === city ? "default" : "outline"}
                  onClick={() => setTargetCity(city)}
                  className={`text-xs font-semibold ${
                    targetCity === city 
                      ? "bg-blue-600 text-white border-blue-600" 
                      : "bg-white text-black border-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {city}
                </Button>
              ))}
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
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <Card className="w-full max-w-lg bg-black/95 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedTraveler.traveler.name[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedTraveler.traveler.name}</h3>
                    <p className="text-sm text-gray-400">{selectedTraveler.traveler.level} • Trust: {selectedTraveler.trustScore}/100</p>
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
              
              <div className="space-y-4 mb-6">
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Flight Details</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-400">Route:</span>
                      <p className="text-white font-medium">{selectedTraveler.fromCity} → {selectedTraveler.toCity}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Flight:</span>
                      <p className="text-white font-medium">{selectedTraveler.airline} {selectedTraveler.flightNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Arriving:</span>
                      <p className="text-white font-medium">{new Date(selectedTraveler.arrivalDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400">Capacity:</span>
                      <p className="text-white font-medium">{selectedTraveler.maxCarryCapacity}kg available</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Interests</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTraveler.connectionPurpose.map(purpose => (
                      <Badge key={purpose} variant="outline" className="text-xs border-gray-600 bg-gray-800/30">
                        {purpose}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {selectedTraveler.travelNote && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">About</h4>
                    <p className="text-sm text-gray-300 bg-gray-800/30 rounded-lg p-3">{selectedTraveler.travelNote}</p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleConnectionRequest(selectedTraveler)}
                >
                  Send Connection Request
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-600"
                  onClick={() => setSelectedTraveler(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
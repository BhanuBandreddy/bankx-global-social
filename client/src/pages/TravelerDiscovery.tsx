import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import Globe from 'react-globe.gl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, MapPin, Plane, Users, Calendar, Star, MessageCircle, Filter } from 'lucide-react';

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

interface UserLocation {
  city: string;
  country: string;
  coordinates: [number, number];
}

interface GlobalPattern {
  route: string;
  fromCity: string;
  toCity: string;
  fromCountry: string;
  toCountry: string;
  fromCoordinates: [number, number];
  toCoordinates: [number, number];
  count: number;
  avgTrustScore: number;
  nextDeparture: string;
}

export default function TravelerDiscovery() {
  const [selectedTraveler, setSelectedTraveler] = useState<TravelerData | null>(null);
  const [mapMode, setMapMode] = useState<'incoming' | 'global'>('incoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [purposeFilter, setPurposeFilter] = useState('all');
  const globeRef = useRef();

  // Mock data for demonstration (will be replaced with API calls once DB is ready)
  const userLocation = {
    location: {
      city: "New York",
      country: "United States",
      coordinates: [40.7128, -74.0060] as [number, number]
    }
  };

  const mockTravelers: TravelerData[] = [
    {
      id: "1",
      travelerId: "t_001",
      fromCity: "London",
      toCity: "New York",
      fromCountry: "United Kingdom",
      toCountry: "United States",
      fromCoordinates: [51.5074, -0.1278],
      toCoordinates: [40.7128, -74.0060],
      fromAirport: "LHR",
      toAirport: "JFK",
      departureDate: "2025-07-15T10:30:00Z",
      arrivalDate: "2025-07-15T14:45:00Z",
      airline: "British Airways",
      flightNumber: "BA117",
      maxCarryCapacity: 8.5,
      deliveryFee: 35.00,
      currency: "USD",
      connectionPurpose: ["social", "shopping"],
      travelNote: "Business traveler, open to social connections and helping with deliveries",
      status: "upcoming",
      trustScore: 92,
      verificationStatus: "verified",
      traveler: {
        id: "user_001",
        name: "James Wilson",
        trustScore: 92,
        level: "Gold",
        avatarUrl: undefined
      }
    },
    {
      id: "2",
      travelerId: "t_002",
      fromCity: "Paris",
      toCity: "New York",
      fromCountry: "France",
      toCountry: "United States",
      fromCoordinates: [48.8566, 2.3522],
      toCoordinates: [40.7128, -74.0060],
      fromAirport: "CDG",
      toAirport: "JFK",
      departureDate: "2025-07-16T15:20:00Z",
      arrivalDate: "2025-07-16T18:35:00Z",
      airline: "Air France",
      flightNumber: "AF007",
      maxCarryCapacity: 12.0,
      deliveryFee: 40.00,
      currency: "USD",
      connectionPurpose: ["social", "sightseeing", "delivery"],
      travelNote: "Fashion enthusiast visiting NYC, happy to connect with locals",
      status: "upcoming",
      trustScore: 88,
      verificationStatus: "verified",
      traveler: {
        id: "user_002",
        name: "Sophie Dubois",
        trustScore: 88,
        level: "Silver",
        avatarUrl: undefined
      }
    },
    {
      id: "3",
      travelerId: "t_003",
      fromCity: "Tokyo",
      toCity: "New York",
      fromCountry: "Japan",
      toCountry: "United States",
      fromCoordinates: [35.6762, 139.6503],
      toCoordinates: [40.7128, -74.0060],
      fromAirport: "NRT",
      toAirport: "JFK",
      departureDate: "2025-07-18T11:00:00Z",
      arrivalDate: "2025-07-18T10:15:00Z",
      airline: "Japan Airlines",
      flightNumber: "JL004",
      maxCarryCapacity: 15.0,
      deliveryFee: 55.00,
      currency: "USD",
      connectionPurpose: ["business", "social"],
      travelNote: "Tech conference attendee, interested in NYC startup scene",
      status: "upcoming",
      trustScore: 95,
      verificationStatus: "verified",
      traveler: {
        id: "user_003",
        name: "Kenji Nakamura",
        trustScore: 95,
        level: "Platinum",
        avatarUrl: undefined
      }
    },
    {
      id: "4",
      travelerId: "t_004",
      fromCity: "Mumbai",
      toCity: "New York",
      fromCountry: "India",
      toCountry: "United States",
      fromCoordinates: [19.0760, 72.8777],
      toCoordinates: [40.7128, -74.0060],
      fromAirport: "BOM",
      toAirport: "JFK",
      departureDate: "2025-07-20T02:30:00Z",
      arrivalDate: "2025-07-20T06:45:00Z",
      airline: "Air India",
      flightNumber: "AI101",
      maxCarryCapacity: 10.0,
      deliveryFee: 45.00,
      currency: "USD",
      connectionPurpose: ["social", "shopping", "delivery"],
      travelNote: "Bollywood film distributor, love connecting with diverse communities",
      status: "upcoming",
      trustScore: 89,
      verificationStatus: "verified",
      traveler: {
        id: "user_004",
        name: "Priya Sharma",
        trustScore: 89,
        level: "Gold",
        avatarUrl: undefined
      }
    }
  ];

  const incomingTravelers = {
    travelers: mockTravelers,
    totalCount: mockTravelers.length,
    targetCity: "New York"
  };

  const mockPatterns: GlobalPattern[] = [
    {
      route: "London-New York",
      fromCity: "London",
      toCity: "New York", 
      fromCountry: "United Kingdom",
      toCountry: "United States",
      fromCoordinates: [51.5074, -0.1278],
      toCoordinates: [40.7128, -74.0060],
      count: 12,
      avgTrustScore: 89,
      nextDeparture: "2025-07-15T10:30:00Z"
    },
    {
      route: "Singapore-London",
      fromCity: "Singapore", 
      toCity: "London",
      fromCountry: "Singapore",
      toCountry: "United Kingdom",
      fromCoordinates: [1.3521, 103.8198],
      toCoordinates: [51.5074, -0.1278],
      count: 8,
      avgTrustScore: 93,
      nextDeparture: "2025-07-17T01:15:00Z"
    }
  ];

  const globalPatterns = {
    patterns: mockPatterns,
    totalRoutes: mockPatterns.length,
    totalTravelers: 24
  };

  // Filter travelers based on search and filters
  const filteredTravelers = incomingTravelers.travelers.filter(traveler => {
    const matchesSearch = !searchTerm || 
      traveler.fromCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traveler.fromCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      traveler.traveler.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPurpose = purposeFilter === 'all' || 
      traveler.connectionPurpose.includes(purposeFilter);
    
    // Simple date filter (could be enhanced)
    const matchesDate = dateFilter === 'all' || 
      (dateFilter === 'this_week' && new Date(traveler.arrivalDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesPurpose && matchesDate;
  });

  // Prepare globe data
  const globeData = mapMode === 'incoming' ? 
    filteredTravelers.map(traveler => ({
      lat: traveler.fromCoordinates[0],
      lng: traveler.fromCoordinates[1],
      size: Math.max(0.5, traveler.trustScore / 100),
      color: traveler.verificationStatus === 'verified' ? '#10b981' : '#f59e0b',
      traveler
    })) :
    globalPatterns.patterns.map(pattern => ({
      lat: pattern.fromCoordinates[0],
      lng: pattern.fromCoordinates[1],
      size: Math.max(0.3, pattern.count * 0.2),
      color: pattern.avgTrustScore > 90 ? '#10b981' : pattern.avgTrustScore > 80 ? '#f59e0b' : '#ef4444',
      pattern
    }));

  // Prepare arcs data for routes
  const arcsData = mapMode === 'incoming' ? 
    filteredTravelers.map(traveler => ({
      startLat: traveler.fromCoordinates[0],
      startLng: traveler.fromCoordinates[1],
      endLat: traveler.toCoordinates[0],
      endLng: traveler.toCoordinates[1],
      color: '#3b82f6',
      traveler
    })) :
    globalPatterns.patterns.map(pattern => ({
      startLat: pattern.fromCoordinates[0],
      startLng: pattern.fromCoordinates[1],
      endLat: pattern.toCoordinates[0],
      endLng: pattern.toCoordinates[1],
      color: ['#10b981', '#3b82f6', '#f59e0b'][Math.floor(Math.random() * 3)],
      pattern
    }));

  // Center globe on user's location
  useEffect(() => {
    if (globeRef.current && userLocation.location) {
      const globe = globeRef.current as any;
      globe.pointOfView({
        lat: userLocation.location.coordinates[0],
        lng: userLocation.location.coordinates[1],
        altitude: 2
      }, 2000);
    }
  }, [userLocation]);

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
      }
    } catch (error) {
      console.error('Connection request failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Travelers to Your City
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Real-time tracking of people coming to {userLocation.location.city}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Live Tracking</span>
              </div>
              
              <Tabs value={mapMode} onValueChange={(value) => setMapMode(value as 'incoming' | 'global')} className="w-auto">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="incoming" className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>Incoming</span>
                  </TabsTrigger>
                  <TabsTrigger value="global" className="flex items-center space-x-2">
                    <Plane className="w-4 h-4" />
                    <span>Global</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Plane className="w-5 h-5" />
                    <span>
                      {mapMode === 'incoming' ? 
                        `Travelers to ${userLocation.location.city}` : 
                        'Global Travel Patterns'
                      }
                    </span>
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    {mapMode === 'incoming' ? (
                      <>
                        <Users className="w-4 h-4" />
                        <span>{filteredTravelers.length} travelers</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-4 h-4" />
                        <span>{globalPatterns.totalRoutes} routes</span>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0 h-[500px]">
                <Globe
                  ref={globeRef}
                  globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                  backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                  
                  pointsData={globeData}
                  pointAltitude={0.1}
                  pointRadius={(d: any) => d.size * 0.8}
                  pointColor={(d: any) => d.color}
                  pointLabel={(d: any) => 
                    mapMode === 'incoming' ? 
                      `${d.traveler.traveler.name} from ${d.traveler.fromCity}` :
                      `${d.pattern.fromCity} → ${d.pattern.toCity} (${d.pattern.count} travelers)`
                  }
                  onPointClick={(d: any) => {
                    if (mapMode === 'incoming') {
                      setSelectedTraveler(d.traveler);
                    }
                  }}
                  
                  arcsData={arcsData}
                  arcColor={(d: any) => d.color}
                  arcDashLength={0.4}
                  arcDashGap={4}
                  arcDashAnimateTime={1000}
                  arcStroke={0.5}
                  
                  atmosphereColor="#3b82f6"
                  atmosphereAltitude={0.15}
                  
                  width={600}
                  height={500}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Search travelers</label>
                  <Input
                    type="text"
                    placeholder="Search by name, city, country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Date range</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All dates</SelectItem>
                      <SelectItem value="this_week">This week</SelectItem>
                      <SelectItem value="this_month">This month</SelectItem>
                      <SelectItem value="next_month">Next month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Connection purpose</label>
                  <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All purposes</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="shopping">Shopping</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="sightseeing">Sightseeing</SelectItem>
                      <SelectItem value="delivery">Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Discovery Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">This week</span>
                  <span className="text-sm font-medium">
                    {filteredTravelers.filter(t => 
                      new Date(t.arrivalDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    ).length} travelers
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Currently traveling</span>
                  <span className="text-sm font-medium">
                    {filteredTravelers.filter(t => t.status === 'traveling').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Online now</span>
                  <span className="text-sm font-medium">
                    {Math.floor(filteredTravelers.length * 0.3)}
                  </span>
                </div>
                
                <Separator />
                
                <Button 
                  className="w-full"
                  onClick={() => {
                    const message = `Click travelers to connect: ${filteredTravelers.length} people coming to ${userLocation.location.city}`;
                    alert(message);
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Click travelers to connect
                </Button>
              </CardContent>
            </Card>

            {/* Selected Traveler */}
            {selectedTraveler && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {selectedTraveler.traveler.name[0]}
                    </div>
                    <span>{selectedTraveler.traveler.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">From</span>
                      <p className="font-medium">{selectedTraveler.fromCity}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Arriving</span>
                      <p className="font-medium">
                        {new Date(selectedTraveler.arrivalDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Flight</span>
                    <p className="font-medium">{selectedTraveler.airline} {selectedTraveler.flightNumber}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{selectedTraveler.trustScore}/100 Trust Score</span>
                    <Badge variant={selectedTraveler.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                      {selectedTraveler.verificationStatus}
                    </Badge>
                  </div>
                  
                  <div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Connection interests</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTraveler.connectionPurpose.map(purpose => (
                        <Badge key={purpose} variant="outline" className="text-xs">
                          {purpose}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {selectedTraveler.travelNote && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Note</span>
                      <p className="text-sm mt-1">{selectedTraveler.travelNote}</p>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    onClick={() => handleConnectionRequest(selectedTraveler)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Send Connection Request
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
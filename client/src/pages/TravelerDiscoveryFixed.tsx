import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, TrendingUp, MapPin, ArrowLeft, Home } from 'lucide-react';
import MapboxDrillDown from "@/components/MapboxDrillDown";

interface City {
  city: string;
  country: string;
  iata: string;
  lat: number;
  lon: number;
  type: 'indian_hub' | 'global_hub' | 'regional_hub';
  population: number;
  daily_arrivals: number;
}

// Mock data for demonstration
const mockCities: City[] = [
  {
    city: "Delhi",
    country: "India",
    iata: "DEL",
    lat: 28.5562,
    lon: 77.1000,
    type: "indian_hub",
    population: 32900000,
    daily_arrivals: 45000
  },
  {
    city: "Mumbai", 
    country: "India",
    iata: "BOM",
    lat: 19.0896,
    lon: 72.8656,
    type: "indian_hub",
    population: 21673000,
    daily_arrivals: 38000
  },
  {
    city: "New York",
    country: "United States",
    iata: "JFK",
    lat: 40.7128,
    lon: -74.0060,
    type: "global_hub",
    population: 8336000,
    daily_arrivals: 125000
  },
  {
    city: "London",
    country: "United Kingdom", 
    iata: "LHR",
    lat: 51.5074,
    lon: -0.1278,
    type: "global_hub",
    population: 9540000,
    daily_arrivals: 110000
  }
];

// Mock data for hierarchical drill-down
const cityConnections = {
  "Delhi": {
    daily_arrivals: 45000,
    top_origins: ["Dubai", "London", "New York", "Singapore"],
    people: [
      { id: 1, name: "Raj Patel", origin: "Dubai", arrival: "Today 3:30 PM", purpose: "Business", items: ["Electronics", "Perfumes"], trust_score: 92 },
      { id: 2, name: "Sarah Chen", origin: "London", arrival: "Today 6:15 PM", purpose: "Tourism", items: ["UK Chocolates", "Books"], trust_score: 88 },
      { id: 3, name: "Mike Johnson", origin: "New York", arrival: "Tomorrow 10:20 AM", purpose: "Business", items: ["Tech Gadgets", "Sneakers"], trust_score: 95 }
    ]
  },
  "Mumbai": {
    daily_arrivals: 38000,
    top_origins: ["Dubai", "Singapore", "Frankfurt", "London"],
    people: [
      { id: 4, name: "Lisa Wang", origin: "Singapore", arrival: "Today 8:45 PM", purpose: "Business", items: ["Electronics", "Cosmetics"], trust_score: 91 },
      { id: 5, name: "Ahmed Al-Rashid", origin: "Dubai", arrival: "Tomorrow 2:10 PM", purpose: "Tourism", items: ["Luxury Items", "Spices"], trust_score: 89 }
    ]
  },
  "New York": {
    daily_arrivals: 125000,
    top_origins: ["London", "Paris", "Tokyo", "Mumbai"],
    people: [
      { id: 6, name: "Priya Sharma", origin: "Mumbai", arrival: "Today 11:30 PM", purpose: "Business", items: ["Indian Spices", "Textiles"], trust_score: 93 }
    ]
  },
  "London": {
    daily_arrivals: 110000,
    top_origins: ["Paris", "Amsterdam", "Delhi", "New York"],
    people: [
      { id: 7, name: "David Thompson", origin: "Paris", arrival: "Today 4:20 PM", purpose: "Tourism", items: ["French Wine", "Cheese"], trust_score: 87 }
    ]
  }
};

export default function TravelerDiscovery() {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'mapbox' | 'city' | 'people' | 'chat'>('map');
  const [drillDownPath, setDrillDownPath] = useState<string[]>([]);

  // Navigation functions
  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    setViewMode('city');
    setDrillDownPath(['Map', cityName]);
  };

  const handlePeopleView = (cityName: string) => {
    setSelectedCity(cityName);
    setViewMode('people');
    setDrillDownPath(['Map', cityName, 'People']);
  };

  const handlePersonSelect = (person: any) => {
    setSelectedPerson(person);
    setViewMode('chat');
    setDrillDownPath(['Map', selectedCity!, 'People', person.name]);
  };

  const goBack = () => {
    if (viewMode === 'chat') {
      setViewMode('people');
      setDrillDownPath(['Map', selectedCity!, 'People']);
    } else if (viewMode === 'people') {
      setViewMode('city');
      setDrillDownPath(['Map', selectedCity!]);
    } else if (viewMode === 'city') {
      setViewMode('map');
      setDrillDownPath([]);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header */}
      <div className="neo-brutalist bg-black text-white p-4 mb-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => navigate('/')}
              className="neo-brutalist bg-lime-400 text-black hover:bg-lime-300 px-4 py-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Main
            </Button>
            <Button 
              onClick={() => navigate('/')}
              className="neo-brutalist bg-white text-black hover:bg-gray-100 px-4 py-2"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </div>
          <div style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '2px' }}>
            <h1 className="text-2xl font-black">GLOBAL CONNECTIONS</h1>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-lime-400 text-black p-4" style={{ 
        fontFamily: 'Bebas Neue, sans-serif', 
        letterSpacing: '1px' 
      }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {drillDownPath.length > 0 && (
              <Button onClick={goBack} className="neo-brutalist bg-black text-lime-400 px-3 py-1 text-sm">
                ← Back
              </Button>
            )}
            <div className="flex items-center space-x-2 text-sm font-bold">
              {drillDownPath.length === 0 ? (
                <span>Global Travel Network</span>
              ) : (
                drillDownPath.map((item, index) => (
                  <span key={index}>
                    {index > 0 && " → "}
                    {item}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="flex space-x-4">
            <Button 
              onClick={() => setViewMode('map')}
              className={`neo-brutalist text-sm ${viewMode === 'map' ? 'bg-black text-lime-400' : 'bg-white text-black'}`}
            >
              Data View
            </Button>
            <Button 
              onClick={() => setViewMode('mapbox')}
              className={`neo-brutalist text-sm ${viewMode === 'mapbox' ? 'bg-black text-lime-400' : 'bg-white text-black'}`}
            >
              Map View
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* MAPBOX INTERACTIVE MAP */}
        {viewMode === 'mapbox' && (
          <div>
            <div className="mb-4 p-4 bg-lime-400 neo-brutalist text-black">
              <h3 className="font-black text-lg mb-2" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                INTERACTIVE TRAVEL MAP
              </h3>
              <p className="text-sm">
                Zoom and click markers to drill down: Global → Airports → Individual Travelers
              </p>
            </div>
            <MapboxDrillDown onPersonSelect={handlePersonSelect} />
          </div>
        )}

        {/* 1. MAP VIEW - Global Cities */}
        {viewMode === 'map' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(cityConnections).map(([cityName, data]) => (
              <Card key={cityName} className="neo-brutalist cursor-pointer hover:shadow-lg transition-all" onClick={() => handleCitySelect(cityName)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span style={{ fontFamily: 'Bebas Neue, sans-serif' }}>{cityName}</span>
                    <MapPin className="w-5 h-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-center p-3 bg-lime-400 neo-brutalist text-black">
                      <div className="text-2xl font-black">{data.daily_arrivals.toLocaleString()}</div>
                      <div className="text-xs font-bold">DAILY ARRIVALS</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-bold mb-1">Top Origins:</div>
                      {data.top_origins.slice(0, 3).map((origin, i) => (
                        <div key={i} className="text-gray-600">• {origin}</div>
                      ))}
                    </div>
                    <Button className="w-full neo-brutalist bg-black text-lime-400 text-sm">
                      View {data.people.length} People →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 2. CITY VIEW - City Details */}
        {viewMode === 'city' && selectedCity && (cityConnections as any)[selectedCity] && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="neo-brutalist">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  {selectedCity} OVERVIEW
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 neo-brutalist">
                    <div className="text-3xl font-black text-green-600">
                      {(cityConnections as any)[selectedCity].daily_arrivals.toLocaleString()}
                    </div>
                    <div className="text-sm font-bold text-green-800">
                      PEOPLE ARRIVING TODAY
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold">Top Origin Cities:</h4>
                    {(cityConnections as any)[selectedCity].top_origins.map((origin: string, i: number) => (
                      <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                        <span className="font-bold">{origin}</span>
                        <span className="text-blue-600">Active Routes</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="neo-brutalist bg-yellow-50">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  COMMERCE POTENTIAL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-yellow-200 neo-brutalist">
                    <div className="text-3xl font-black text-yellow-800">
                      ${((cityConnections as any)[selectedCity].daily_arrivals * 45).toLocaleString()}
                    </div>
                    <div className="text-sm font-bold text-yellow-900">
                      DAILY COMMERCE OPPORTUNITY
                    </div>
                  </div>
                  <Button 
                    onClick={() => handlePeopleView(selectedCity)}
                    className="w-full neo-brutalist bg-lime-400 text-black font-black"
                  >
                    Connect with {(cityConnections as any)[selectedCity].people.length} People →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 3. PEOPLE VIEW - Individual Travelers */}
        {viewMode === 'people' && selectedCity && (cityConnections as any)[selectedCity] && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(cityConnections as any)[selectedCity].people.map((person: any) => (
              <Card key={person.id} className="neo-brutalist cursor-pointer hover:shadow-lg transition-all" onClick={() => handlePersonSelect(person)}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span style={{ fontFamily: 'Bebas Neue, sans-serif' }}>{person.name}</span>
                    <Badge className="bg-lime-400 text-black">
                      Trust: {person.trust_score}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="font-bold text-sm">Origin: <span className="text-blue-600">{person.origin}</span></div>
                      <div className="font-bold text-sm">Arrival: <span className="text-green-600">{person.arrival}</span></div>
                      <div className="font-bold text-sm">Purpose: <span className="text-purple-600">{person.purpose}</span></div>
                    </div>
                    <div>
                      <div className="font-bold text-sm mb-1">Can Bring:</div>
                      <div className="flex flex-wrap gap-1">
                        {person.items.map((item: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full neo-brutalist bg-black text-lime-400">
                      Start Chat →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 4. CHAT VIEW - Individual Conversation */}
        {viewMode === 'chat' && selectedPerson && (
          <div className="max-w-4xl mx-auto">
            <Card className="neo-brutalist">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  CHAT WITH {selectedPerson.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 neo-brutalist">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>From:</strong> {selectedPerson.origin}</div>
                      <div><strong>To:</strong> {selectedCity}</div>
                      <div><strong>Arrival:</strong> {selectedPerson.arrival}</div>
                      <div><strong>Trust Score:</strong> {selectedPerson.trust_score}%</div>
                    </div>
                  </div>
                  
                  <div className="bg-lime-400 p-4 neo-brutalist text-black">
                    <div className="font-bold mb-2">🎯 Global Social Connected You!</div>
                    <p className="text-sm">
                      {selectedPerson.name} can bring items from {selectedPerson.origin} to {selectedCity}. 
                      Available items: {selectedPerson.items.join(', ')}
                    </p>
                  </div>

                  <div className="space-y-3 min-h-[300px] max-h-[400px] overflow-y-auto bg-white p-4 neo-brutalist">
                    <div className="text-center text-gray-500 text-sm">Chat conversation would start here...</div>
                    <div className="p-3 bg-blue-50 neo-brutalist">
                      <div className="font-bold text-sm">{selectedPerson.name}:</div>
                      <div className="text-sm">Hi! I'm traveling from {selectedPerson.origin} to {selectedCity} on {selectedPerson.arrival}. What would you like me to bring?</div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Type your message..."
                      className="flex-1 p-3 neo-brutalist"
                    />
                    <Button className="neo-brutalist bg-lime-400 text-black px-6">
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
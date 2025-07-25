import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, TrendingUp, MapPin } from 'lucide-react';

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

const mockFlows = [
  { origin: "New York", destination: "Delhi", travelers: 2340, purpose: "Business" },
  { origin: "London", destination: "Mumbai", travelers: 1890, purpose: "Tourism" },
  { origin: "Dubai", destination: "Delhi", travelers: 2890, purpose: "Transit" },
  { origin: "Singapore", destination: "Mumbai", travelers: 1920, purpose: "Business" }
];

export default function TravelerDiscovery() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [flowType, setFlowType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'flows' | 'stats'>('stats');

  // Calculate stats for selected city
  const cityStats = useMemo(() => {
    if (!selectedCity) return null;
    
    const city = mockCities.find(c => c.city === selectedCity);
    if (!city) return null;
    
    const inboundFlows = mockFlows.filter(f => f.destination === selectedCity);
    const totalInbound = inboundFlows.reduce((sum, f) => sum + f.travelers, 0);
    const uniqueOrigins = new Set(inboundFlows.map(f => f.origin)).size;
    
    return {
      city,
      totalInbound,
      uniqueOrigins,
      inboundFlows
    };
  }, [selectedCity]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="neo-brutalist bg-black text-white p-6 mb-0" style={{ 
        fontFamily: 'Bebas Neue, sans-serif', 
        letterSpacing: '2px' 
      }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-2">GLOBAL CONNECTIONS</h1>
          <p className="text-lime-400 text-lg font-bold">
            Daily arrivals • International flows • Commerce potential
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Select value={flowType} onValueChange={setFlowType}>
            <SelectTrigger className="neo-brutalist">
              <SelectValue placeholder="Flow Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Flows</SelectItem>
              <SelectItem value="india_flows">India-Connected</SelectItem>
              <SelectItem value="global_only">Global Only</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedCity || 'all'} onValueChange={(value) => setSelectedCity(value === 'all' ? null : value)}>
            <SelectTrigger className="neo-brutalist">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {mockCities.filter(c => c.type === 'indian_hub').map(city => (
                <SelectItem key={city.city} value={city.city}>🇮🇳 {city.city}</SelectItem>
              ))}
              {mockCities.filter(c => c.type === 'global_hub').map(city => (
                <SelectItem key={city.city} value={city.city}>🌍 {city.city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant={viewMode === 'flows' ? 'default' : 'outline'}
            onClick={() => setViewMode('flows')}
            className="neo-brutalist"
          >
            <Globe className="w-4 h-4 mr-2" />
            Flow Map
          </Button>
          
          <Button 
            variant={viewMode === 'stats' ? 'default' : 'outline'}
            onClick={() => setViewMode('stats')}
            className="neo-brutalist"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            City Stats
          </Button>
        </div>

        {viewMode === 'flows' && (
          <div className="neo-brutalist bg-gray-50 border-4 border-black h-[600px] relative">
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  GLOBAL TRAVEL FLOWS MAP
                </h3>
                <p className="text-gray-600 mb-6">
                  Interactive Mapbox visualization showing daily arrivals between cities
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  {mockFlows.map((flow, index) => (
                    <div key={index} className="p-3 bg-white neo-brutalist text-sm">
                      <div className="font-bold">{flow.origin} → {flow.destination}</div>
                      <div className="text-green-600">+{flow.travelers.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'stats' && selectedCity && cityStats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* City Overview */}
            <Card className="neo-brutalist">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  {cityStats.city.city} OVERVIEW
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-bold">Country:</span>
                    <span>{cityStats.city.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Population:</span>
                    <span>{cityStats.city.population.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Daily Arrivals:</span>
                    <Badge className="bg-lime-400 text-black">
                      {cityStats.city.daily_arrivals.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold">Hub Type:</span>
                    <Badge variant="outline">
                      {cityStats.city.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inbound Flows */}
            <Card className="neo-brutalist">
              <CardHeader>
                <CardTitle style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
                  ARRIVALS TO {cityStats.city.city}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 neo-brutalist">
                    <div className="text-3xl font-black text-green-600">
                      {cityStats.totalInbound.toLocaleString()}
                    </div>
                    <div className="text-sm font-bold text-green-800">
                      TOTAL TRAVELERS TODAY
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 neo-brutalist">
                    <div className="text-2xl font-black text-blue-600">
                      {cityStats.uniqueOrigins}
                    </div>
                    <div className="text-sm font-bold text-blue-800">
                      ORIGIN CITIES
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {cityStats.inboundFlows.map((flow, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                        <span className="font-bold">{flow.origin}</span>
                        <span className="text-green-600 font-bold">
                          +{flow.travelers.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commerce Potential */}
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
                      ${(cityStats.totalInbound * 45).toLocaleString()}
                    </div>
                    <div className="text-sm font-bold text-yellow-900">
                      DAILY COMMERCE OPPORTUNITY
                    </div>
                    <div className="text-xs text-yellow-700 mt-1">
                      @$45 avg spend per traveler
                    </div>
                  </div>
                  
                  <div className="p-4 bg-orange-100 neo-brutalist">
                    <h4 className="font-bold mb-2">Global Social Impact:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Connect {cityStats.totalInbound.toLocaleString()} daily arrivals</li>
                      <li>• Enable peer-to-peer delivery</li>
                      <li>• Unlock local-global commerce</li>
                      <li>• Build trust-based networks</li>
                    </ul>
                  </div>
                  
                  <div className="text-center">
                    <Button className="neo-brutalist bg-lime-400 text-black font-black">
                      ACTIVATE CONNECTIONS
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Default view when no city is selected */}
        {viewMode === 'stats' && !selectedCity && (
          <div className="text-center p-12 neo-brutalist bg-gray-50">
            <h3 className="text-2xl font-black mb-4" style={{ fontFamily: 'Bebas Neue, sans-serif' }}>
              SELECT A CITY TO VIEW STATS
            </h3>
            <p className="text-gray-600 mb-6">
              Choose a city from the dropdown to see arrival patterns and commerce potential
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mockCities.filter(c => c.type === 'indian_hub').map(city => (
                <Button 
                  key={city.city}
                  onClick={() => setSelectedCity(city.city)}
                  className="neo-brutalist bg-lime-400 text-black"
                >
                  {city.city}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
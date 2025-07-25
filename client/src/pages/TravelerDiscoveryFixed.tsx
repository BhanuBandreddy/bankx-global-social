import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, TrendingUp, MapPin, ArrowLeft, Home } from 'lucide-react';

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
  const navigate = useNavigate();
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

      {/* Subtitle Header */}
      <div className="bg-lime-400 text-black p-4" style={{ 
        fontFamily: 'Bebas Neue, sans-serif', 
        letterSpacing: '1px' 
      }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg font-bold">
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
          <div className="neo-brutalist bg-gray-900 border-4 border-black h-[600px] relative overflow-hidden">
            {/* World Map Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
              {/* Continents as simplified shapes */}
              <svg className="w-full h-full" viewBox="0 0 1000 500">
                {/* Asia */}
                <path d="M600 150 L750 120 L820 180 L780 250 L720 280 L650 260 L600 200 Z" fill="#1e293b" opacity="0.7" />
                {/* Europe */}
                <path d="M480 120 L520 100 L550 130 L530 160 L480 150 Z" fill="#1e293b" opacity="0.7" />
                {/* North America */}
                <path d="M200 100 L350 90 L380 150 L320 200 L250 180 L200 140 Z" fill="#1e293b" opacity="0.7" />
                {/* Africa */}
                <path d="M480 180 L520 170 L540 220 L520 300 L480 290 L460 240 Z" fill="#1e293b" opacity="0.7" />
              </svg>
            </div>

            {/* City Markers */}
            <div className="absolute inset-0">
              {/* Delhi */}
              <div className="absolute" style={{ left: '68%', top: '35%' }}>
                <div className="w-4 h-4 bg-lime-400 rounded-full border-2 border-black pulse-animation"></div>
                <div className="text-white text-xs font-bold mt-1">Delhi</div>
              </div>
              
              {/* Mumbai */}
              <div className="absolute" style={{ left: '66%', top: '42%' }}>
                <div className="w-4 h-4 bg-lime-400 rounded-full border-2 border-black pulse-animation"></div>
                <div className="text-white text-xs font-bold mt-1">Mumbai</div>
              </div>

              {/* New York */}
              <div className="absolute" style={{ left: '25%', top: '28%' }}>
                <div className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-black pulse-animation"></div>
                <div className="text-white text-xs font-bold mt-1">NYC</div>
              </div>

              {/* London */}
              <div className="absolute" style={{ left: '48%', top: '25%' }}>
                <div className="w-4 h-4 bg-yellow-400 rounded-full border-2 border-black pulse-animation"></div>
                <div className="text-white text-xs font-bold mt-1">London</div>
              </div>
            </div>

            {/* Flow Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {/* NYC to Delhi */}
              <path 
                d="M 250 140 Q 450 100 680 175" 
                stroke="#ff2975" 
                strokeWidth="3" 
                fill="none" 
                strokeDasharray="5,5"
                className="flow-line-animation"
              />
              
              {/* London to Mumbai */}
              <path 
                d="M 480 125 Q 550 180 660 210" 
                stroke="#04e762" 
                strokeWidth="3" 
                fill="none" 
                strokeDasharray="5,5"
                className="flow-line-animation"
                style={{ animationDelay: '1s' }}
              />
            </svg>

            {/* Flow Statistics Overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="grid grid-cols-2 gap-4">
                {mockFlows.map((flow, index) => (
                  <div key={index} className="p-3 bg-black bg-opacity-80 neo-brutalist text-white text-sm">
                    <div className="font-bold text-yellow-400">{flow.origin} → {flow.destination}</div>
                    <div className="text-lime-400 font-bold">+{flow.travelers.toLocaleString()} travelers</div>
                    <div className="text-gray-300">{flow.purpose}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-black bg-opacity-80 neo-brutalist p-4 text-white">
              <h4 className="font-bold mb-2">Legend</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-lime-400 rounded-full"></div>
                  <span>Indian Hubs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span>Global Hubs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-1 bg-pink-500"></div>
                  <span>Flow Lines</span>
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
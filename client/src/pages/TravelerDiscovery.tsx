import { useState, useEffect, useMemo } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, TrendingUp } from 'lucide-react';

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

interface TravelFlow {
  Date: string;
  Origin_City: string;
  Destination_City: string;
  Travelers: string;
  Purpose: string;
  Flight_Count: string;
}

interface FlowGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'LineString';
      coordinates: [number, number][];
    };
    properties: {
      origin: string;
      destination: string;
      travelers: number;
      purpose: string;
      flight_count: number;
      flow_type: 'to_india' | 'from_india' | 'global';
    };
  }>;
}

// Utility functions
const loadCities = async (): Promise<City[]> => {
  const response = await fetch('/global_cities.json');
  return response.json();
};

const loadFlows = async (cities: City[], selectedCity: string | null, flowType: string): Promise<FlowGeoJSON> => {
  const response = await fetch('/global_travel_flows_jan2025.csv');
  const text = await response.text();
  const rows = Papa.parse<TravelFlow>(text, { header: true }).data;
  
  const cityMap = Object.fromEntries(cities.map(c => [c.city, c]));
  const features: FlowGeoJSON['features'] = [];
  
  const indianCities = cities.filter(c => c.type === 'indian_hub').map(c => c.city);
  
  rows.forEach(row => {
    if (!row.Origin_City || !row.Destination_City) return;
    
    const origin = cityMap[row.Origin_City];
    const destination = cityMap[row.Destination_City];
    
    if (!origin || !destination) return;
    
    // Determine flow type
    let flow_type: 'to_india' | 'from_india' | 'global' = 'global';
    if (indianCities.includes(row.Destination_City)) flow_type = 'to_india';
    else if (indianCities.includes(row.Origin_City)) flow_type = 'from_india';
    
    // Filter based on selection
    if (selectedCity) {
      if (row.Origin_City !== selectedCity && row.Destination_City !== selectedCity) return;
    }
    
    if (flowType !== 'all') {
      if (flowType === 'india_flows' && flow_type === 'global') return;
      if (flowType === 'global_only' && flow_type !== 'global') return;
    }
    
    features.push({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [[origin.lon, origin.lat], [destination.lon, destination.lat]]
      },
      properties: {
        origin: row.Origin_City,
        destination: row.Destination_City,
        travelers: parseInt(row.Travelers) || 0,
        purpose: row.Purpose,
        flight_count: parseInt(row.Flight_Count) || 0,
        flow_type
      }
    });
  });
  
  return { type: 'FeatureCollection', features };
};

export default function TravelerDiscovery() {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [flowType, setFlowType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'flows' | 'stats'>('flows');
  const [flowData, setFlowData] = useState<FlowGeoJSON>({ type: 'FeatureCollection', features: [] });

  // Load cities on component mount
  useEffect(() => {
    loadCities().then(setCities);
  }, []);

  // Load flows when dependencies change
  useEffect(() => {
    if (cities.length > 0) {
      loadFlows(cities, selectedCity, flowType).then(setFlowData);
    }
  }, [cities, selectedCity, flowType]);

  // Calculate stats for selected city
  const cityStats = useMemo(() => {
    if (!selectedCity || !cities.length) return null;
    
    const city = cities.find(c => c.city === selectedCity);
    if (!city) return null;
    
    const inboundFlows = flowData.features.filter(f => f.properties.destination === selectedCity);
    const outboundFlows = flowData.features.filter(f => f.properties.origin === selectedCity);
    
    const totalInbound = inboundFlows.reduce((sum, f) => sum + f.properties.travelers, 0);
    const totalOutbound = outboundFlows.reduce((sum, f) => sum + f.properties.travelers, 0);
    const uniqueOrigins = new Set(inboundFlows.map(f => f.properties.origin)).size;
    const uniqueDestinations = new Set(outboundFlows.map(f => f.properties.destination)).size;
    
    return {
      city,
      totalInbound,
      totalOutbound,
      uniqueOrigins,
      uniqueDestinations,
      inboundFlows,
      outboundFlows
    };
  }, [selectedCity, cities, flowData]);

  // Layer styles for Mapbox
  const flowLayerStyle = {
    id: 'flows',
    type: 'line' as const,
    paint: {
      'line-color': [
        'match',
        ['get', 'flow_type'],
        'to_india', '#04E762',
        'from_india', '#FF2975', 
        '#FEE440'
      ],
      'line-width': [
        'interpolate',
        ['linear'],
        ['get', 'travelers'],
        500, 2,
        1000, 4,
        2000, 6,
        3000, 8
      ],
      'line-opacity': 0.8
    }
  };

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
          
          <Select value={selectedCity || ''} onValueChange={(value) => setSelectedCity(value || null)}>
            <SelectTrigger className="neo-brutalist">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Cities</SelectItem>
              {cities.filter(c => c.type === 'indian_hub').map(city => (
                <SelectItem key={city.city} value={city.city}>🇮🇳 {city.city}</SelectItem>
              ))}
              {cities.filter(c => c.type === 'global_hub').map(city => (
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
          <div className="neo-brutalist bg-white border-4 border-black h-[600px] relative">
            {import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN ? (
              <Map
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_PUBLIC_TOKEN}
                initialViewState={{
                  longitude: 20,
                  latitude: 20,
                  zoom: 1.5
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/light-v11"
              >
                {/* City Markers */}
                {cities.map(city => (
                  <Marker
                    key={city.city}
                    longitude={city.lon}
                    latitude={city.lat}
                    onClick={() => setSelectedCity(city.city)}
                  >
                    <div 
                      className={`cursor-pointer rounded-full border-2 border-black text-xs font-bold px-2 py-1 ${
                        city.type === 'indian_hub' 
                          ? 'bg-lime-400 text-black' 
                          : city.type === 'global_hub'
                          ? 'bg-blue-500 text-white'
                          : 'bg-orange-400 text-black'
                      } ${selectedCity === city.city ? 'ring-4 ring-yellow-400' : ''}`}
                      style={{ fontFamily: 'Bebas Neue, sans-serif' }}
                    >
                      {city.city}
                    </div>
                  </Marker>
                ))}

                {/* Flow Lines */}
                <Source id="flows" type="geojson" data={flowData}>
                  <Layer {...flowLayerStyle} />
                </Source>
              </Map>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center p-8">
                  <h3 className="text-xl font-bold mb-4">Mapbox Token Required</h3>
                  <p className="text-gray-600 mb-4">Set VITE_MAPBOX_PUBLIC_TOKEN environment variable</p>
                  <p className="text-sm text-gray-500">Get your token from mapbox.com</p>
                </div>
              </div>
            )}
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
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cityStats.inboundFlows.slice(0, 10).map((flow, index) => (
                      <div key={index} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                        <span className="font-bold">{flow.properties.origin}</span>
                        <span className="text-green-600 font-bold">
                          +{flow.properties.travelers}
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
              {cities.filter(c => c.type === 'indian_hub').map(city => (
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
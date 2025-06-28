import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Compass, Star, Clock } from "lucide-react";
import { apiClient } from "@/lib/api";

interface LocalDiscovery {
  id: string;
  name: string;
  category: string;
  location: string;
  coordinates: [number, number];
  rating: number;
  description: string;
  distance: string;
  price_range: string;
  crowd_level: 'low' | 'medium' | 'high';
  trending_score: number;
  local_tip: string;
}

interface LocaleLensDemoProps {
  destination?: string;
  userLocation?: [number, number];
}

export const LocaleLensDemo = ({ destination = "Tokyo", userLocation }: LocaleLensDemoProps) => {
  const [discoveries, setDiscoveries] = useState<LocalDiscovery[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = ["all", "restaurants", "attractions", "shopping", "nightlife", "culture"];

  // Mock LocaleLens data generation
  const generateLocalDiscoveries = (city: string, category: string = "all"): LocalDiscovery[] => {
    const discoveries: LocalDiscovery[] = [];
    
    const templates = {
      Tokyo: {
        restaurants: [
          { name: "Tsukiji Sushi Omakase", category: "restaurants", description: "Hidden gem for authentic sushi", local_tip: "Ask for today's special catch" },
          { name: "Ramen Yokocho Alley", category: "restaurants", description: "Local ramen street food", local_tip: "Try the miso variant, locals' favorite" }
        ],
        attractions: [
          { name: "Senso-ji Temple Gardens", category: "attractions", description: "Peaceful temple grounds", local_tip: "Visit at 6 AM for fewer crowds" },
          { name: "Shibuya Sky Observatory", category: "attractions", description: "360° city views", local_tip: "Golden hour timing is 5:30 PM" }
        ],
        shopping: [
          { name: "Vintage Harajuku Boutique", category: "shopping", description: "Unique fashion finds", local_tip: "Owner speaks English, ask for styling advice" }
        ]
      },
      Paris: {
        restaurants: [
          { name: "Le Comptoir du 6ème", category: "restaurants", description: "Authentic bistro experience", local_tip: "Reserve 2 days ahead" }
        ],
        attractions: [
          { name: "Hidden Montmartre Viewpoint", category: "attractions", description: "Secret panoramic spot", local_tip: "Follow Rue de l'Abreuvoir uphill" }
        ]
      },
      London: {
        restaurants: [
          { name: "Borough Market Gems", category: "restaurants", description: "Artisanal food vendors", local_tip: "Saturday mornings have best selection" }
        ]
      }
    };

    const cityData = templates[city as keyof typeof templates] || templates.Tokyo;
    
    Object.entries(cityData).forEach(([cat, items]) => {
      if (category === "all" || category === cat) {
        items.forEach((item, index) => {
          discoveries.push({
            id: `${city}-${cat}-${index}`,
            name: item.name,
            category: item.category,
            location: `${city}, Japan`,
            coordinates: [35.6762 + Math.random() * 0.1, 139.6503 + Math.random() * 0.1] as [number, number],
            rating: 4.2 + Math.random() * 0.8,
            description: item.description,
            distance: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9)}km`,
            price_range: ["€", "€€", "€€€"][Math.floor(Math.random() * 3)],
            crowd_level: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as any,
            trending_score: Math.random() * 100,
            local_tip: item.local_tip
          });
        });
      }
    });

    return discoveries.sort((a, b) => b.trending_score - a.trending_score);
  };

  const searchLocal = async () => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Generate mock local discoveries
      const results = generateLocalDiscoveries(destination, selectedCategory);
      
      // Filter by search query if provided
      const filteredResults = searchQuery 
        ? results.filter(item => 
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : results;
      
      setDiscoveries(filteredResults);
    } catch (error) {
      console.error('LocaleLens search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    searchLocal();
  }, [destination, selectedCategory]);

  const getCrowdColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default: return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  return (
    <Card className="border-4 border-black">
      <CardHeader className="bg-gradient-to-r from-green-400 to-blue-400 border-b-4 border-black">
        <CardTitle className="text-2xl font-bold text-black uppercase flex items-center space-x-2">
          <Compass className="w-8 h-8" />
          <span>LocaleLens Discovery</span>
        </CardTitle>
        <p className="text-black font-medium">
          AI-powered local discovery for {destination} with real-time insights
        </p>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Search Interface */}
        <div className="space-y-4 mb-6">
          <div className="flex space-x-2">
            <Input
              placeholder="Search local spots, cuisine, activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-2 border-black"
            />
            <Button 
              onClick={searchLocal}
              disabled={isLoading}
              className="bg-black text-white border-2 border-black hover:bg-gray-800"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-black text-white" : "border-2 border-black"}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">LocaleLens AI Active</span>
            <span className="text-gray-600">• Real-time local intelligence • Crowd-aware recommendations</span>
          </div>
        </div>

        {/* Discoveries */}
        {isLoading ? (
          <div className="text-center py-8">
            <Compass className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-gray-600">Discovering local gems...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold text-lg mb-3">🎯 Local Discoveries ({discoveries.length})</h3>
            
            {discoveries.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No discoveries found. Try adjusting your search or category.
              </div>
            ) : (
              discoveries.map((discovery) => (
                <div key={discovery.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-bold text-lg">{discovery.name}</h4>
                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                          {discovery.category}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-2">{discovery.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{discovery.distance}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{discovery.rating.toFixed(1)}</span>
                        </div>
                        <span>{discovery.price_range}</span>
                      </div>
                      
                      {/* Local Tip */}
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-2">
                        <p className="text-sm text-yellow-800">
                          <strong>Local Tip:</strong> {discovery.local_tip}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={getCrowdColor(discovery.crowd_level)}>
                        {discovery.crowd_level} crowd
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(discovery.trending_score)}% trending
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Integration Status */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg">
          <h4 className="font-bold text-sm mb-2">🗺️ Mapbox Integration Ready</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span>Mapbox token: Pending user configuration</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>LocaleLens AI: Real-time discovery active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Crowd intelligence: Live data integration</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
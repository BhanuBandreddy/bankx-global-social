
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DestinationMap } from "../DestinationMap";

interface Product {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  price: string;
  priceInr: string;
  rating: number;
  description: string;
  type: 'duty-free' | 'local' | 'restaurant';
  image?: string;
  timeFromAirport?: string;
  crowdLevel?: 'low' | 'medium' | 'high';
}

interface JourneyContext {
  isMultiCity: boolean;
  currentCity?: string;
  nextCity?: string;
  totalCities?: number;
  allCities?: string[];
}

interface SharedProductDiscoveryProps {
  onProductSelect: (product: Product) => void;
  isDemo?: boolean;
  destination?: string | string[];
  userRoute?: string;
  journeyContext?: JourneyContext;
}

// Helper function to convert destination to string for comparison
const getDestinationString = (destination: string | string[]): string => {
  if (Array.isArray(destination)) {
    // For multi-city trips, use the first non-"Home" destination
    const validDestination = destination.find(dest => dest && dest.toLowerCase() !== 'home');
    return validDestination || destination[0] || '';
  }
  return destination || '';
};

// Dynamic product generation based on destination
const generateProductsForDestination = (destination: string | string[], route: string): Product[] => {
  const destString = getDestinationString(destination);
  
  // Default to New York products if destination contains NYC/New York
  if (destString.toLowerCase().includes('new york') || destString.toLowerCase().includes('nyc') || 
      route?.toLowerCase().includes('new york') || route?.toLowerCase().includes('nyc')) {
    return [
      {
        id: "1",
        name: "Apple Watch Series 9",
        location: "JFK Terminal 4, Duty Free",
        coordinates: [-73.7781, 40.6413], // JFK Airport coordinates
        price: "$350",
        priceInr: "₹29,120",
        rating: 4.8,
        description: "Latest Apple Watch, 25% cheaper than city stores",
        type: "duty-free",
        timeFromAirport: "At airport",
        crowdLevel: "medium"
      },
      {
        id: "2", 
        name: "Joe's Pizza Slice",
        location: "150 E 14th St, Greenwich Village",
        coordinates: [-73.9876, 40.7323], // Greenwich Village
        price: "$3",
        priceInr: "₹250",
        rating: 4.7,
        description: "Authentic NYC pizza, local favorite since 1975",
        type: "restaurant",
        timeFromAirport: "45 min by AirTrain + Subway",
        crowdLevel: "high"
      },
      {
        id: "3",
        name: "Yankees Championship Cap",
        location: "Yankee Stadium Store, Bronx",
        coordinates: [-73.9265, 40.8296], // Yankee Stadium
        price: "$35",
        priceInr: "₹2,910",
        rating: 4.6,
        description: "Official MLB merchandise, limited edition design",
        type: "local",
        timeFromAirport: "1 hr by subway",
        crowdLevel: "medium"
      },
      {
        id: "4",
        name: "Levain Bakery Cookies",
        location: "1484 3rd Ave, Upper East Side",
        coordinates: [-73.9568, 40.7829], // Upper East Side
        price: "$12",
        priceInr: "₹998",
        rating: 4.9,
        description: "World-famous 6oz cookies, warm and gooey",
        type: "local",
        timeFromAirport: "50 min by subway",
        crowdLevel: "low"
      }
    ];
  }
  
  // Default to Washington DC products if destination contains DC/Washington
  if (destString.toLowerCase().includes('washington') || destString.toLowerCase().includes(' dc') || 
      route?.toLowerCase().includes('washington') || route?.toLowerCase().includes(' dc')) {
    return [
      {
        id: "1",
        name: "Smithsonian Merchandise",
        location: "Ronald Reagan Airport, Terminal B",
        coordinates: [-77.0365, 38.8512], // DCA Airport coordinates
        price: "$25",
        priceInr: "₹2,080",
        rating: 4.7,
        description: "Official Smithsonian museum collection items",
        type: "duty-free",
        timeFromAirport: "At airport",
        crowdLevel: "medium"
      },
      {
        id: "2", 
        name: "Ben's Chili Bowl Half-Smoke",
        location: "1213 U Street NW, U Street Corridor",
        coordinates: [-77.0297, 38.9169], // U Street
        price: "$8",
        priceInr: "₹665",
        rating: 4.8,
        description: "DC institution since 1958, famous half-smoke sausage",
        type: "restaurant",
        timeFromAirport: "30 min by Metro",
        crowdLevel: "high"
      },
      {
        id: "3",
        name: "Washington Nationals Jersey",
        location: "Nationals Park Team Store",
        coordinates: [-77.0074, 38.8730], // Nationals Park
        price: "$85",
        priceInr: "₹7,070",
        rating: 4.5,
        description: "Official MLB team merchandise, home jersey",
        type: "local",
        timeFromAirport: "25 min by Metro",
        crowdLevel: "medium"
      },
      {
        id: "4",
        name: "Georgetown Cupcakes",
        location: "3301 M Street NW, Georgetown",
        coordinates: [-77.0651, 38.9051], // Georgetown
        price: "$18",
        priceInr: "₹1,498",
        rating: 4.6,
        description: "Famous DC cupcakes, as seen on TLC show",
        type: "local",
        timeFromAirport: "35 min by Metro + walk",
        crowdLevel: "low"
      }
    ];
  }

  // Check for London products
  if (destString.toLowerCase().includes('london') || 
      route?.toLowerCase().includes('london')) {
    return [
      {
        id: "1",
        name: "Burberry Trench Coat",
        location: "Heathrow Terminal 5, Duty Free",
        coordinates: [-0.4543, 51.4700], // Heathrow Airport coordinates
        price: "£450",
        priceInr: "₹46,800",
        rating: 4.9,
        description: "Iconic British fashion, 20% duty-free savings",
        type: "duty-free",
        timeFromAirport: "At airport",
        crowdLevel: "medium"
      },
      {
        id: "2", 
        name: "Fish & Chips at Poppies",
        location: "6-8 Hanbury St, Spitalfields",
        coordinates: [-0.0719, 51.5200], // Spitalfields
        price: "£12",
        priceInr: "₹1,248",
        rating: 4.7,
        description: "Traditional British fish & chips since 1945",
        type: "restaurant",
        timeFromAirport: "45 min by Tube",
        crowdLevel: "high"
      },
      {
        id: "3",
        name: "Beatles Vinyl Collection",
        location: "Abbey Road Studios Shop",
        coordinates: [-0.1795, 51.5319], // Abbey Road
        price: "£35",
        priceInr: "₹3,640",
        rating: 4.8,
        description: "Original Beatles albums from the legendary studio",
        type: "local",
        timeFromAirport: "50 min by Tube",
        crowdLevel: "medium"
      },
      {
        id: "4",
        name: "Earl Grey Tea Selection",
        location: "Fortnum & Mason, Piccadilly",
        coordinates: [-0.1420, 51.5074], // Piccadilly
        price: "£28",
        priceInr: "₹2,912",
        rating: 4.6,
        description: "Premium British tea blends from 1707",
        type: "local",
        timeFromAirport: "1 hr by Tube",
        crowdLevel: "low"
      }
    ];
  }

  // Fallback to Paris products for any other destination
  return [
    {
      id: "1",
      name: "Chanel No. 19",
      location: "CDG Terminal 2E, Duty Free",
      coordinates: [2.5479, 49.0097],
      price: "€200",
      priceInr: "₹18,160",
      rating: 4.9,
      description: "Authentic Chanel perfume, 30% cheaper than city stores",
      type: "duty-free",
      timeFromAirport: "At airport",
      crowdLevel: "medium"
    },
    {
      id: "2", 
      name: "L'As du Fallafel",
      location: "34 Rue des Rosiers, Le Marais",
      coordinates: [2.3590, 48.8571],
      price: "€12",
      priceInr: "₹1,090",
      rating: 4.7,
      description: "Legendary falafel spot, zero tourist traps detected",
      type: "restaurant",
      timeFromAirport: "45 min by RER",
      crowdLevel: "high"
    },
    {
      id: "3",
      name: "Pierre Hermé Macarons",
      location: "72 Rue Bonaparte, Saint-Germain",
      coordinates: [2.3344, 48.8533],
      price: "€24",
      priceInr: "₹2,180",
      rating: 4.8,
      description: "World's best macarons, limited edition flavors",
      type: "local",
      timeFromAirport: "50 min by Metro",
      crowdLevel: "medium"
    },
    {
      id: "4",
      name: "Vintage Hermès Scarf",
      location: "Marché aux Puces, Saint-Ouen",
      coordinates: [2.3317, 48.9014],
      price: "€180",
      priceInr: "₹16,340",
      rating: 4.6,
      description: "Authentic vintage piece, verified by LocaleLens AI",
      type: "local",
      timeFromAirport: "1 hr by Metro",
      crowdLevel: "low"
    }
  ];
};

export const SharedProductDiscovery = ({ 
  onProductSelect, 
  isDemo = false, 
  destination = "Paris", 
  userRoute = "",
  journeyContext
}: SharedProductDiscoveryProps) => {
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'duty-free' | 'local' | 'restaurant'>('all');

  // Generate products based on the actual destination
  const allProducts = generateProductsForDestination(destination, userRoute);
  
  const filteredProducts = selectedFilter === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.type === selectedFilter);

  const handleReserve = (product: Product) => {
    onProductSelect(product);
    const journeyInfo = journeyContext?.isMultiCity ? 
      ` (Multi-city journey: ${journeyContext.currentCity} → ${journeyContext.nextCity})` : '';
    
    toast({
      title: "🎯 LocaleLens AI Discovery",
      description: `Perfect match found: ${product.name}${journeyInfo} - ${isDemo ? 'Demo: ' : ''}initiating TrustPay escrow`,
    });
  };

  const handleMapProductClick = (product: Product) => {
    const productElement = document.getElementById(`product-${product.id}`);
    if (productElement) {
      productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      productElement.style.background = '#fef3c7';
      setTimeout(() => {
        productElement.style.background = '';
      }, 2000);
    }
  };

  const getCrowdIcon = (level?: string) => {
    switch (level) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      default: return '';
    }
  };

  // Get display destination for UI
  const displayDestination = getDestinationString(destination);

  return (
    <Card className="border-4 border-black">
      <CardHeader className="bg-green-100 border-b-4 border-black">
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-6 h-6" />
          <span>
            {isDemo ? 'Demo: ' : ''}Local Discovery (LocaleLens AI)
            {journeyContext?.isMultiCity && (
              <span className="ml-2 text-sm text-green-700">
                • Multi-city journey ({journeyContext.totalCities} cities)
              </span>
            )}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Journey Context Banner */}
        {journeyContext?.isMultiCity && (
          <div className="p-4 bg-blue-50 border-4 border-blue-200 rounded">
            <h4 className="font-bold text-blue-800 mb-2">🗺️ Your Journey Context</h4>
            <p className="text-sm text-blue-700">
              Currently in: <strong>{journeyContext.currentCity}</strong>
              {journeyContext.nextCity && (
                <>
                  {' '} • Next destination: <strong>{journeyContext.nextCity}</strong>
                </>
              )}
              {' '} • Total cities: <strong>{journeyContext.totalCities}</strong>
            </p>
          </div>
        )}

        {/* Interactive Map */}
        <div>
          <h3 className="text-lg font-bold mb-3">🗺️ Destination Map</h3>
          <DestinationMap 
            destination={displayDestination} 
            products={allProducts}
            onProductClick={handleMapProductClick}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 flex-wrap">
          {[
            { key: 'all', label: 'All Products', count: allProducts.length },
            { key: 'duty-free', label: 'Duty-Free', count: allProducts.filter(p => p.type === 'duty-free').length },
            { key: 'local', label: 'Local Gems', count: allProducts.filter(p => p.type === 'local').length },
            { key: 'restaurant', label: 'Food', count: allProducts.filter(p => p.type === 'restaurant').length }
          ].map(filter => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key as any)}
              className={`px-3 py-2 border-4 border-black text-sm font-bold transition-all ${
                selectedFilter === filter.key 
                  ? 'bg-lime-400 text-black' 
                  : 'bg-white text-black hover:bg-gray-100'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid gap-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              id={`product-${product.id}`}
              className="border-4 border-black bg-white p-4 hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-bold text-black">{product.name}</h3>
                    <span className={`px-2 py-1 text-xs font-bold border-2 border-black ${
                      product.type === 'duty-free' ? 'bg-purple-200' :
                      product.type === 'local' ? 'bg-yellow-200' : 'bg-red-200'
                    }`}>
                      {product.type === 'duty-free' ? '✈️ DUTY-FREE' : 
                       product.type === 'local' ? '💎 LOCAL' : '🍽️ FOOD'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{product.location}</span>
                  </div>

                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium ml-1">{product.rating}</span>
                    </div>
                    {product.timeFromAirport && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">{product.timeFromAirport}</span>
                      </div>
                    )}
                    {product.crowdLevel && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span className="text-sm">{getCrowdIcon(product.crowdLevel)}</span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-xl font-bold text-black">{product.price}</div>
                  <div className="text-sm text-gray-600">{product.priceInr}</div>
                  <Button
                    onClick={() => handleReserve(product)}
                    className="mt-2 bg-lime-400 text-black border-4 border-black hover:bg-lime-500"
                  >
                    Reserve via TrustPay
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-purple-50 border-4 border-purple-200">
          <h4 className="font-bold text-purple-800 mb-2">🎯 LocaleLens AI Insights</h4>
          <p className="text-sm text-purple-700">
            Curated from 47,000+ traveler reviews + real-time crowd data. Zero tourist traps detected.
            Recommendations optimized for your {displayDestination} route with live FX rates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

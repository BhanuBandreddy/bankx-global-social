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
  destination?: string;
  userRoute?: string;
  journeyContext?: JourneyContext;
}

// Enhanced product generation with journey-aware recommendations
const generateProductsForDestination = (destination: string, route: string, journeyContext?: JourneyContext): Product[] => {
  // London products (enhanced with journey context)
  if (destination?.toLowerCase().includes('london') || 
      route?.toLowerCase().includes('london')) {
    const baseProducts = [
      {
        id: "1",
        name: "London Eye Fast Track",
        location: "Westminster Bridge Road, London",
        coordinates: [-0.1196, 51.5033] as [number, number],
        price: "£27",
        priceInr: "₹2,835",
        rating: 4.6,
        description: "Skip the queue at London's iconic observation wheel",
        type: "local" as const,
        timeFromAirport: "45 min by Tube",
        crowdLevel: "high" as const
      },
      {
        id: "2", 
        name: "Borough Market Food Tour",
        location: "Borough Market, London Bridge",
        coordinates: [-0.0906, 51.5055] as [number, number],
        price: "£35",
        priceInr: "₹3,675",
        rating: 4.8,
        description: "Taste authentic British foods at historic market",
        type: "restaurant" as const,
        timeFromAirport: "30 min by Tube",
        crowdLevel: "medium" as const
      },
      {
        id: "3",
        name: "Harrods Tea & Biscuits",
        location: "Harrods, Knightsbridge",
        coordinates: [-0.1634, 51.4994] as [number, number],
        price: "£45",
        priceInr: "₹4,725",
        rating: 4.5,
        description: "Iconic British tea collection from luxury department store",
        type: "local" as const,
        timeFromAirport: "40 min by Tube",
        crowdLevel: "high" as const
      }
    ];

    // Add journey-specific products if traveling to Paris next
    if (journeyContext?.isMultiCity && journeyContext.nextCity?.toLowerCase().includes('paris')) {
      baseProducts.push({
        id: "4",
        name: "Eurostar Premium Upgrade",
        location: "St Pancras International",
        coordinates: [-0.1276, 51.5308] as [number, number],
        price: "£89",
        priceInr: "₹9,345",
        rating: 4.7,
        description: "⚡ Upgrade for tomorrow's Paris journey - priority boarding & lounge access",
        type: "local" as const,
        timeFromAirport: "35 min by Tube",
        crowdLevel: "low" as const
      });
    }

    return baseProducts;
  }
  
  // Paris products (enhanced with journey context)
  if (destination?.toLowerCase().includes('paris') || 
      route?.toLowerCase().includes('paris')) {
    const baseProducts = [
      {
        id: "1",
        name: "Louvre Skip-the-Line",
        location: "Louvre Museum, 1st Arrondissement",
        coordinates: [2.3376, 48.8606] as [number, number],
        price: "€22",
        priceInr: "₹2,000",
        rating: 4.9,
        description: "Priority access to world's largest art museum",
        type: "local" as const,
        timeFromAirport: "45 min by RER",
        crowdLevel: "high" as const
      },
      {
        id: "2", 
        name: "L'As du Fallafel",
        location: "34 Rue des Rosiers, Le Marais",
        coordinates: [2.3590, 48.8571] as [number, number],
        price: "€12",
        priceInr: "₹1,090",
        rating: 4.7,
        description: "Legendary falafel spot in historic Jewish quarter",
        type: "restaurant" as const,
        timeFromAirport: "45 min by RER",
        crowdLevel: "high" as const
      },
      {
        id: "3",
        name: "Pierre Hermé Macarons",
        location: "72 Rue Bonaparte, Saint-Germain",
        coordinates: [2.3344, 48.8533] as [number, number],
        price: "€24",
        priceInr: "₹2,180",
        rating: 4.8,
        description: "World's finest macarons, limited edition flavors",
        type: "local" as const,
        timeFromAirport: "50 min by Metro",
        crowdLevel: "medium" as const
      }
    ];

    // Add journey-specific products if traveling to Amsterdam next
    if (journeyContext?.isMultiCity && journeyContext.nextCity?.toLowerCase().includes('amsterdam')) {
      baseProducts.push({
        id: "4",
        name: "Thalys Premium Class",
        location: "Gare du Nord, Paris",
        coordinates: [2.3554, 48.8807] as [number, number],
        price: "€125",
        priceInr: "₹11,375",
        rating: 4.6,
        description: "⚡ Tomorrow's Amsterdam journey - premium comfort + meal included",
        type: "local" as const,
        timeFromAirport: "30 min by Metro",
        crowdLevel: "low" as const
      });
    }

    return baseProducts;
  }

  // Amsterdam products
  if (destination?.toLowerCase().includes('amsterdam') || 
      route?.toLowerCase().includes('amsterdam')) {
    return [
      {
        id: "1",
        name: "Anne Frank House Ticket",
        location: "Prinsengracht 263-267, Amsterdam",
        coordinates: [4.8840, 52.3752] as [number, number],
        price: "€16",
        priceInr: "₹1,456",
        rating: 4.8,
        description: "Pre-booked entry to historic house and museum",
        type: "local" as const,
        timeFromAirport: "20 min by train",
        crowdLevel: "high" as const
      },
      {
        id: "2", 
        name: "Stroopwafels at Albert Cuyp",
        location: "Albert Cuyp Market",
        coordinates: [4.8945, 52.3570] as [number, number],
        price: "€8",
        priceInr: "₹728",
        rating: 4.7,
        description: "Fresh stroopwafels from century-old market stall",
        type: "restaurant" as const,
        timeFromAirport: "25 min by tram",
        crowdLevel: "medium" as const
      },
      {
        id: "3",
        name: "Van Gogh Museum Priority",
        location: "Museumplein 6, Amsterdam",
        coordinates: [4.8810, 52.3584] as [number, number],
        price: "€22",
        priceInr: "₹2,002",
        rating: 4.9,
        description: "Skip the line at world's largest Van Gogh collection",
        type: "local" as const,
        timeFromAirport: "30 min by train + tram",
        crowdLevel: "high" as const
      }
    ];
  }

  // Default fallback products
  return [
    {
      id: "1",
      name: "Local Discovery Pass",
      location: "City Center",
      coordinates: [0, 0] as [number, number],
      price: "$25",
      priceInr: "₹2,080",
      rating: 4.5,
      description: "Curated local experiences in your destination",
      type: "local" as const,
      timeFromAirport: "Varies",
      crowdLevel: "medium" as const
    }
  ];
};

export const SharedProductDiscovery = ({ 
  onProductSelect, 
  isDemo = false, 
  destination = "London", 
  userRoute = "",
  journeyContext
}: SharedProductDiscoveryProps) => {
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'duty-free' | 'local' | 'restaurant'>('all');

  // Generate products based on the actual destination and journey context
  const allProducts = generateProductsForDestination(destination, userRoute, journeyContext);
  
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
            <div className="mt-2 text-xs text-blue-600">
              🚄 Journey-optimized recommendations include cross-city transport options
            </div>
          </div>
        )}

        {/* Interactive Map */}
        <div>
          <h3 className="text-lg font-bold mb-3">🗺️ Destination Map</h3>
          <DestinationMap 
            destination={destination} 
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
                    {/* Journey-specific indicator */}
                    {product.description.includes('⚡') && (
                      <span className="px-2 py-1 text-xs font-bold bg-blue-200 border-2 border-blue-400 text-blue-800">
                        🚄 JOURNEY
                      </span>
                    )}
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
            {journeyContext?.isMultiCity ? (
              <> Multi-city journey optimization includes cross-destination logistics and transport upgrades.</>
            ) : (
              <> Recommendations optimized for your {destination} visit with live FX rates.</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


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

interface SharedProductDiscoveryProps {
  onProductSelect: (product: Product) => void;
  isDemo?: boolean;
  destination?: string;
}

const parisProducts: Product[] = [
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

export const SharedProductDiscovery = ({ onProductSelect, isDemo = false, destination = "Paris" }: SharedProductDiscoveryProps) => {
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'duty-free' | 'local' | 'restaurant'>('all');

  const filteredProducts = selectedFilter === 'all' 
    ? parisProducts 
    : parisProducts.filter(p => p.type === selectedFilter);

  const handleReserve = (product: Product) => {
    onProductSelect(product);
    toast({
      title: "🎯 LocaleLens AI Discovery",
      description: `Perfect match found: ${product.name} - ${isDemo ? 'Demo: ' : ''}initiating TrustPay escrow`,
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
          <span>{isDemo ? 'Demo: ' : ''}Local Discovery (LocaleLens AI)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Interactive Map */}
        <div>
          <h3 className="text-lg font-bold mb-3">🗺️ Destination Map</h3>
          <DestinationMap 
            destination={destination} 
            products={parisProducts}
            onProductClick={handleMapProductClick}
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 flex-wrap">
          {[
            { key: 'all', label: 'All Products', count: parisProducts.length },
            { key: 'duty-free', label: 'Duty-Free', count: parisProducts.filter(p => p.type === 'duty-free').length },
            { key: 'local', label: 'Local Gems', count: parisProducts.filter(p => p.type === 'local').length },
            { key: 'restaurant', label: 'Food', count: parisProducts.filter(p => p.type === 'restaurant').length }
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
            Recommendations optimized for your {destination} route with live FX rates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  location: string;
  price: string;
  priceInr: string;
  rating: number;
  description: string;
  image?: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Chanel No. 19",
    location: "CDG Duty-Free Terminal 2E",
    price: "€200",
    priceInr: "₹18,160",
    rating: 4.9,
    description: "Authentic Chanel perfume, duty-free exclusive"
  },
  {
    id: "2", 
    name: "Hidden Falafel Spot",
    location: "5 min from your Airbnb",
    price: "€12",
    priceInr: "₹1,090",
    rating: 4.7,
    description: "Local favorite, no tourists know about this gem"
  }
];

interface ProductDiscoveryProps {
  onProductSelect: (product: Product) => void;
}

export const ProductDiscovery = ({ onProductSelect }: ProductDiscoveryProps) => {
  const { toast } = useToast();

  const handleReserve = (product: Product) => {
    onProductSelect(product);
    toast({
      title: "LocaleLens AI Discovery",
      description: `Found perfect match: ${product.name} - proceeding to TrustPay escrow`,
    });
  };

  return (
    <Card className="border-4 border-black">
      <CardHeader className="bg-green-100 border-b-4 border-black">
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="w-6 h-6" />
          <span>Step 2: Local Discovery (LocaleLens AI)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-4">
          {mockProducts.map((product) => (
            <div
              key={product.id}
              className="border-4 border-black bg-white p-4 hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-black">{product.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <MapPin className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">{product.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium ml-1">{product.rating}</span>
                    </div>
                    <span className="text-sm text-gray-600">{product.description}</span>
                  </div>
                </div>
                <div className="text-right">
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
            Curated from quilt data + your past preferences. Zero tourist traps detected.
            These recommendations blend local knowledge with your travel profile.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

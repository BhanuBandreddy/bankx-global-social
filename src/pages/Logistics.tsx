
import { Navbar } from "@/components/Navbar";
import { PathSyncLogistics } from "@/components/PathSyncLogistics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Truck, Globe } from "lucide-react";

const Logistics = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8">
        <Card className="border-4 border-black mb-6">
          <CardHeader className="bg-orange-100 border-b-4 border-black">
            <CardTitle className="flex items-center space-x-2">
              <Truck className="w-6 h-6" />
              <span>PathSync Social Logistics</span>
            </CardTitle>
            <p className="text-gray-600">
              Connect with travelers and merchants for peer-to-peer delivery
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 border-2 border-blue-200 p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-bold">Social Network</h3>
                <p className="text-sm text-gray-600">Trusted community delivery</p>
              </div>
              <div className="bg-green-50 border-2 border-green-200 p-4 text-center">
                <Truck className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-bold">Smart Matching</h3>
                <p className="text-sm text-gray-600">Route-optimized logistics</p>
              </div>
              <div className="bg-purple-50 border-2 border-purple-200 p-4 text-center">
                <Globe className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-bold">Global Reach</h3>
                <p className="text-sm text-gray-600">Worldwide coverage</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <PathSyncLogistics
          escrowTransactionId="mock_transaction_123"
          productLocation="Paris"
        />
      </div>
    </div>
  );
};

export default Logistics;


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, MapPin, CreditCard, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const DemoFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [itinerary, setItinerary] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [escrowActive, setEscrowActive] = useState(false);
  const [courierFound, setCourierFound] = useState(false);
  const { toast } = useToast();

  const steps = [
    { id: 'upload', name: 'Upload Itinerary', agent: 'GlobeGuides™ Concierge', icon: Upload },
    { id: 'discover', name: 'Local Discovery', agent: 'LocaleLens AI', icon: MapPin },
    { id: 'payment', name: 'Secure Payment', agent: 'TrustPay Orchestrator', icon: CreditCard },
    { id: 'logistics', name: 'Peer Logistics', agent: 'PathSync Social Logistics', icon: Users },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate GlobeGuides processing
      setTimeout(() => {
        setItinerary({
          route: "Chennai → Paris",
          date: "12 Aug 2024",
          weather: "24°C",
          alerts: "Metro strike planned"
        });
        setCurrentStep(1);
        toast({
          title: "🛬 Welcome to Paris!",
          description: "12 Aug, local weather 24°C, metro strike planned. 3 local pick-ups available.",
        });
      }, 1500);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Demo Progress Header */}
      <Card className="border-4 border-black">
        <CardHeader className="bg-lime-400 border-b-4 border-black">
          <CardTitle className="text-2xl font-bold text-black uppercase">
            Global Socials Demo Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-2 ${
                    index <= currentStep ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div className={`w-12 h-12 border-4 border-black flex items-center justify-center ${
                    index === currentStep ? 'bg-lime-400' : 
                    index < currentStep ? 'bg-green-300' : 'bg-gray-100'
                  }`}>
                    <IconComponent className="w-6 h-6 text-black" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm">{step.name}</div>
                    <div className="text-xs text-gray-600">{step.agent}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: GlobeGuides - File Upload */}
      {currentStep === 0 && (
        <Card className="border-4 border-black">
          <CardHeader className="bg-purple-100 border-b-4 border-black">
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-6 h-6" />
              <span>Step 1: Upload Travel Itinerary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="border-4 border-dashed border-gray-300 p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-4">Drag & drop your PDF itinerary here</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button className="bg-black text-white border-4 border-black hover:bg-gray-800">
                  Choose File
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Itinerary Display */}
      {itinerary && (
        <Card className="border-4 border-black">
          <CardHeader className="bg-blue-100 border-b-4 border-black">
            <CardTitle>📋 Parsed Itinerary (GlobeGuides™)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 border-2 border-gray-300">
                <div className="font-bold">Route</div>
                <div>{itinerary.route}</div>
              </div>
              <div className="p-4 bg-gray-50 border-2 border-gray-300">
                <div className="font-bold">Date</div>
                <div>{itinerary.date}</div>
              </div>
              <div className="p-4 bg-gray-50 border-2 border-gray-300">
                <div className="font-bold">Weather</div>
                <div>{itinerary.weather}</div>
              </div>
              <div className="p-4 bg-yellow-100 border-2 border-yellow-400">
                <div className="font-bold">Alert</div>
                <div>{itinerary.alerts}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Demo Controls */}
      <Card className="border-4 border-black">
        <CardHeader className="bg-gray-100 border-b-4 border-black">
          <CardTitle>Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <Button 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              variant="outline"
              className="border-4 border-black"
            >
              Previous Step
            </Button>
            <Button 
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              disabled={currentStep === 3}
              className="bg-black text-white border-4 border-black hover:bg-gray-800"
            >
              Next Step
            </Button>
            <Button 
              onClick={() => {
                setCurrentStep(0);
                setItinerary(null);
                setSelectedProduct(null);
                setEscrowActive(false);
                setCourierFound(false);
              }}
              variant="outline"
              className="border-4 border-red-500 text-red-500 hover:bg-red-50"
            >
              Reset Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

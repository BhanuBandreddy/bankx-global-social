
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, MapPin, CreditCard, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SharedProductDiscovery } from "./shared/ProductDiscovery";
import { SharedTrustPayment } from "./shared/TrustPayment";
import { PathSyncLogistics } from "./PathSyncLogistics";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ItineraryData {
  route: string;
  date: string;
  weather: string;
  alerts: string;
  departureTime?: string;
  arrivalTime?: string;
  gate?: string;
  flight?: string;
  destination?: string;
}

// Helper function to convert file to base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function to safely render data
const renderValue = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object' && value !== null) {
    if (value.departure && value.arrival) {
      return `Departure: ${value.departure}, Arrival: ${value.arrival}`;
    }
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${val}`)
      .join(', ');
  }
  return String(value);
};

export const DemoFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [escrowTransactionId, setEscrowTransactionId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const steps = [
    { id: 'upload', name: 'Upload Itinerary', agent: 'GlobeGuides™ Concierge', icon: Upload },
    { id: 'discover', name: 'Local Discovery', agent: 'LocaleLens AI', icon: MapPin },
    { id: 'payment', name: 'Secure Payment', agent: 'TrustPay Orchestrator', icon: CreditCard },
    { id: 'logistics', name: 'Peer Logistics', agent: 'PathSync Social Logistics', icon: Users },
  ];

  const validateFile = (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, or WebP)",
        variant: "destructive"
      });
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 10MB",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return;
    setIsProcessing(true);
    
    try {
      console.log('Processing file:', file.name);
      
      // Use authenticated user ID or create a proper demo UUID
      const userId = user?.id || crypto.randomUUID();
      console.log('Using user ID:', userId);
      
      const base64Image = await convertFileToBase64(file);
      console.log('Converted image to base64, length:', base64Image.length);
      
      const { data, error } = await supabase.functions.invoke('parse-itinerary', {
        body: {
          imageBase64: base64Image,
          fileName: file.name,
          fileType: file.type,
          userId: userId
        }
      });
      
      console.log('Supabase function response:', { data, error });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to process image');
      }
      
      if (!data) {
        throw new Error('No response data received');
      }
      
      if (data.success && data.itinerary) {
        setItinerary(data.itinerary);
        setCurrentStep(1);
        
        const destination = data.itinerary.destination || 
                           data.itinerary.route?.split(' → ')[1] || 
                           data.itinerary.arrivalLocation || 
                           'your destination';
        
        const travelDate = data.itinerary.date || 
                          data.itinerary.departureDate || 
                          data.itinerary.travelDate || 
                          'your travel date';
        
        const alerts = data.itinerary.alerts || 
                      data.itinerary.notes || 
                      data.itinerary.importantInfo || 
                      'Have a great trip!';
        
        toast({
          title: `🛬 Welcome to ${destination}!`,
          description: `${travelDate}. ${alerts}. 3 local pick-ups available.`,
        });
      } else {
        throw new Error(data.error || 'Failed to parse itinerary');
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to parse itinerary. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      await processFile(file);
    }
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    setCurrentStep(2);
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setEscrowTransactionId(transactionId);
    setCurrentStep(3);
    
    toast({
      title: "🚀 Proceeding to Logistics",
      description: "Payment secured! PathSync is matching you with optimal logistics partners.",
    });
  };

  const handlePaymentCancel = () => {
    setSelectedProduct(null);
    setCurrentStep(1);
  };

  const extractDestinationFromRoute = (route: string): string => {
    if (!route) return "Unknown Destination";
    
    const parts = route.split(' → ');
    if (parts.length > 1) {
      return parts[1].trim();
    }
    return route;
  };

  // Extract destination for map and product discovery
  const getDestinationName = (): string => {
    if (!itinerary) return "Paris";
    return itinerary.destination || extractDestinationFromRoute(itinerary.route) || "Paris";
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

      {/* Step 1: GlobeGuides - Image Upload */}
      {currentStep === 0 && (
        <Card className="border-4 border-black">
          <CardHeader className="bg-purple-100 border-b-4 border-black">
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-6 h-6" />
              <span>Step 1: Upload Travel Itinerary Image</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div 
              className={`border-4 border-dashed p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-300 bg-white'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                  <p className="text-lg font-medium">GlobeGuides™ is analyzing your itinerary image...</p>
                  <p className="text-sm text-gray-600">Extracting travel details, weather, and local insights</p>
                </div>
              ) : (
                <>
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-purple-600' : 'text-gray-400'}`} />
                  <p className="text-lg font-medium mb-4">
                    {isDragOver ? 'Drop your image here!' : 'Drag & drop your itinerary image here'}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    GlobeGuides™ will analyze your travel image and provide smart insights
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Supported formats: JPEG, PNG, WebP (max 10MB)
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                    disabled={isProcessing}
                  />
                  <label htmlFor="file-upload">
                    <Button 
                      className="bg-black text-white border-4 border-black hover:bg-gray-800"
                      disabled={isProcessing}
                      asChild
                    >
                      <span className="cursor-pointer">
                        Choose Image File
                      </span>
                    </Button>
                  </label>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Parsed Itinerary Display */}
      {itinerary && (
        <Card className="border-4 border-black">
          <CardHeader className="bg-blue-100 border-b-4 border-black">
            <CardTitle>📋 Parsed Itinerary (GlobeGuides™)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 border-2 border-gray-300">
                <div className="font-bold">Route</div>
                <div>{renderValue(itinerary.route)}</div>
              </div>
              <div className="p-4 bg-gray-50 border-2 border-gray-300">
                <div className="font-bold">Date</div>
                <div>{renderValue(itinerary.date)}</div>
              </div>
              <div className="p-4 bg-gray-50 border-2 border-gray-300">
                <div className="font-bold">Weather</div>
                <div>{renderValue(itinerary.weather)}</div>
              </div>
              <div className="p-4 bg-yellow-100 border-2 border-yellow-400">
                <div className="font-bold">Alert</div>
                <div>{renderValue(itinerary.alerts)}</div>
              </div>
            </div>
            
            {(itinerary.flight || itinerary.gate) && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {itinerary.flight && (
                  <div className="p-4 bg-green-50 border-2 border-green-300">
                    <div className="font-bold">Flight</div>
                    <div>{renderValue(itinerary.flight)}</div>
                  </div>
                )}
                {itinerary.gate && (
                  <div className="p-4 bg-green-50 border-2 border-green-300">
                    <div className="font-bold">Gate/Terminal</div>
                    <div>{renderValue(itinerary.gate)}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && (
        <SharedProductDiscovery 
          onProductSelect={handleProductSelect} 
          isDemo={true}
          destination={getDestinationName()}
          userRoute={itinerary?.route || ""}
        />
      )}

      {currentStep === 2 && selectedProduct && (
        <SharedTrustPayment
          product={selectedProduct}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentCancel={handlePaymentCancel}
          isDemo={true}
        />
      )}

      {currentStep === 3 && (
        <PathSyncLogistics
          escrowTransactionId={escrowTransactionId}
          userItinerary={itinerary ? {
            route: itinerary.route,
            date: itinerary.date,
            isActive: true
          } : undefined}
          productLocation={selectedProduct?.name.includes('Chennai') ? 'Chennai' : getDestinationName()}
        />
      )}

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
                setEscrowTransactionId('');
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

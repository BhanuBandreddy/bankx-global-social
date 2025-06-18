import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, MapPin, CreditCard, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SharedProductDiscovery } from "./shared/ProductDiscovery";
import { SharedTrustPayment } from "./shared/TrustPayment";
import { PathSyncLogistics } from "./PathSyncLogistics";
import { extractTextFromPDF } from "@/utils/pdfUtils";
import { supabase } from "@/integrations/supabase/client";

interface ItineraryData {
  route: string;
  date: string;
  weather: string;
  alerts: string;
  departureTime?: string;
  arrivalTime?: string;
  gate?: string;
  flight?: string;
}

// Helper function to convert file to base64
const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data:application/pdf;base64, prefix
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
    // Handle weather object specifically
    if (value.departure && value.arrival) {
      return `Departure: ${value.departure}, Arrival: ${value.arrival}`;
    }
    // Handle other objects by stringifying key-value pairs
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

  const steps = [
    { id: 'upload', name: 'Upload Itinerary', agent: 'GlobeGuides™ Concierge', icon: Upload },
    { id: 'discover', name: 'Local Discovery', agent: 'LocaleLens AI', icon: MapPin },
    { id: 'payment', name: 'Secure Payment', agent: 'TrustPay Orchestrator', icon: CreditCard },
    { id: 'logistics', name: 'Peer Logistics', agent: 'PathSync Social Logistics', icon: Users },
  ];

  const validateFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
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
      
      // Convert PDF to base64
      const base64PDF = await convertFileToBase64(file);
      console.log('Converted PDF to base64, length:', base64PDF.length);
      
      // Send PDF directly to OpenAI via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('parse-itinerary', {
        body: {
          pdfBase64: base64PDF,
          fileName: file.name,
          fileType: file.type
        }
      });
      
      console.log('Supabase function response:', { data, error });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to process PDF');
      }
      
      if (!data) {
        throw new Error('No response data received');
      }
      
      if (data.success && data.itinerary) {
        setItinerary(data.itinerary);
        setCurrentStep(1);
        
        // More flexible toast message that works with any data structure
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
      console.error('Error processing PDF:', error);
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Demo Progress Header */}
      <Card className="border-4 border-charcoal">
        <CardHeader className="bg-gold border-b-4 border-charcoal">
          <CardTitle className="text-2xl font-bold text-charcoal uppercase">
            Global Socials Demo Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 bg-charcoal/5">
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
                  <div className={`w-12 h-12 border-4 border-charcoal flex items-center justify-center ${
                    index === currentStep ? 'bg-gold' : 
                    index < currentStep ? 'bg-gold/70' : 'bg-gray-100'
                  }`}>
                    <IconComponent className="w-6 h-6 text-charcoal" />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-sm">{step.name}</div>
                    <div className="text-xs text-gold">{step.agent}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step 1: GlobeGuides - File Upload */}
      {currentStep === 0 && (
        <Card className="border-4 border-charcoal border-t-4 border-t-gold">
          <CardHeader className="bg-purple-100 border-b-4 border-charcoal">
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-6 h-6" />
              <span>Step 1: Upload Travel Itinerary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-charcoal/5">
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
                  <p className="text-lg font-medium">GlobeGuides™ is parsing your itinerary...</p>
                  <p className="text-sm text-gray-600">Extracting travel details, weather, and local insights</p>
                </div>
              ) : (
                <>
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-purple-600' : 'text-gray-400'}`} />
                  <p className="text-lg font-medium mb-4">
                    {isDragOver ? 'Drop your PDF here!' : 'Drag & drop your PDF itinerary here'}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    GlobeGuides™ will parse your travel details and provide smart insights
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
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
                        Choose PDF File
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
        <Card className="border-4 border-charcoal border-t-4 border-t-gold">
          <CardHeader className="bg-blue-100 border-b-4 border-charcoal">
            <CardTitle>📋 Parsed Itinerary (GlobeGuides™)</CardTitle>
          </CardHeader>
          <CardContent className="p-6 bg-charcoal/5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white border-2 border-charcoal">
                <div className="font-bold text-gold">Route</div>
                <div>{renderValue(itinerary.route)}</div>
              </div>
              <div className="p-4 bg-white border-2 border-charcoal">
                <div className="font-bold text-gold">Date</div>
                <div>{renderValue(itinerary.date)}</div>
              </div>
              <div className="p-4 bg-white border-2 border-charcoal">
                <div className="font-bold text-gold">Weather</div>
                <div>{renderValue(itinerary.weather)}</div>
              </div>
              <div className="p-4 bg-gold/20 border-2 border-gold">
                <div className="font-bold text-charcoal">Alert</div>
                <div>{renderValue(itinerary.alerts)}</div>
              </div>
            </div>
            
            {(itinerary.flight || itinerary.gate) && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {itinerary.flight && (
                  <div className="p-4 bg-gold/10 border-2 border-gold">
                    <div className="font-bold text-charcoal">Flight</div>
                    <div>{renderValue(itinerary.flight)}</div>
                  </div>
                )}
                {itinerary.gate && (
                  <div className="p-4 bg-gold/10 border-2 border-gold">
                    <div className="font-bold text-charcoal">Gate/Terminal</div>
                    <div>{renderValue(itinerary.gate)}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: LocaleLens - Product Discovery */}
      {currentStep === 1 && (
        <SharedProductDiscovery 
          onProductSelect={handleProductSelect} 
          isDemo={true}
          destination={itinerary ? extractDestinationFromRoute(itinerary.route) : "Paris"}
          userRoute={itinerary?.route || ""}
        />
      )}

      {/* Step 3: TrustPay - Secure Payment */}
      {currentStep === 2 && selectedProduct && (
        <SharedTrustPayment
          product={selectedProduct}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentCancel={handlePaymentCancel}
          isDemo={true}
        />
      )}

      {/* Step 4: PathSync - Enhanced Peer Logistics */}
      {currentStep === 3 && (
        <PathSyncLogistics
          escrowTransactionId={escrowTransactionId}
          userItinerary={itinerary ? {
            route: itinerary.route,
            date: itinerary.date,
            isActive: true
          } : undefined}
          productLocation={selectedProduct?.name.includes('Chennai') ? 'Chennai' : extractDestinationFromRoute(itinerary?.route || '')}
        />
      )}

      {/* Demo Controls */}
      <Card className="border-4 border-charcoal">
        <CardHeader className="bg-charcoal/10 border-b-4 border-charcoal">
          <CardTitle>Demo Controls</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <Button 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              variant="outline"
              className="border-4 border-charcoal hover:bg-charcoal/10"
            >
              Previous Step
            </Button>
            <Button 
              onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}
              disabled={currentStep === 3}
              className="bg-gold text-charcoal border-4 border-gold hover:bg-gold/90 hover:shadow-gold"
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


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, MapPin, CreditCard, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProductDiscovery } from "./ProductDiscovery";
import { TrustPayment } from "./TrustPayment";
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

export const DemoFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [escrowTransactionId, setEscrowTransactionId] = useState<string>('');
  const [courierFound, setCourierFound] = useState(false);
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
      
      // Extract text from PDF
      const pdfText = await extractTextFromPDF(file);
      console.log('Extracted PDF text:', pdfText);

      // Call Supabase edge function to parse with OpenAI
      const { data, error } = await supabase.functions.invoke('parse-itinerary', {
        body: {
          pdfText,
          fileName: file.name
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      console.log('Parse response:', data);

      if (data.success) {
        setItinerary(data.itinerary);
        setCurrentStep(1);
        
        // Show GlobeGuides success toast
        toast({
          title: `🛬 Welcome to ${data.itinerary.route.split(' → ')[1]}!`,
          description: `${data.itinerary.date}, ${data.itinerary.weather}. ${data.itinerary.alerts}. 3 local pick-ups available.`,
        });
      } else {
        throw new Error('Failed to parse itinerary');
      }

    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Processing Error",
        description: "Failed to parse itinerary. Please try again.",
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
      description: "Payment secured! PathSync is finding peer couriers for your delivery.",
    });
  };

  const handlePaymentCancel = () => {
    setSelectedProduct(null);
    setCurrentStep(1);
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
            
            {(itinerary.flight || itinerary.gate) && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {itinerary.flight && (
                  <div className="p-4 bg-green-50 border-2 border-green-300">
                    <div className="font-bold">Flight</div>
                    <div>{itinerary.flight}</div>
                  </div>
                )}
                {itinerary.gate && (
                  <div className="p-4 bg-green-50 border-2 border-green-300">
                    <div className="font-bold">Gate/Terminal</div>
                    <div>{itinerary.gate}</div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: LocaleLens - Product Discovery */}
      {currentStep === 1 && (
        <ProductDiscovery onProductSelect={handleProductSelect} />
      )}

      {/* Step 3: TrustPay - Secure Payment */}
      {currentStep === 2 && selectedProduct && (
        <TrustPayment
          product={selectedProduct}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentCancel={handlePaymentCancel}
        />
      )}

      {/* Step 4: PathSync - Peer Logistics */}
      {currentStep === 3 && (
        <Card className="border-4 border-black">
          <CardHeader className="bg-orange-100 border-b-4 border-black">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-6 h-6" />
              <span>Step 4: PathSync Social Logistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="bg-green-50 border-4 border-green-300 p-4">
              <h3 className="font-bold text-green-800 mb-2">🔒 Escrow Active</h3>
              <p className="text-sm text-green-700">
                Transaction ID: {escrowTransactionId}<br/>
                Funds secured until delivery confirmation
              </p>
            </div>
            
            <div className="bg-white border-4 border-black p-4">
              <h4 className="font-bold mb-3">🤝 Peer Courier Network</h4>
              <p className="text-sm mb-4">
                PathSync is connecting you with trusted peer couriers traveling your route.
                Escrow will be released automatically upon delivery confirmation.
              </p>
              
              <div className="space-y-2 text-sm">
                <div>✅ 3 verified couriers found on Chennai → Paris route</div>
                <div>✅ Trust scores: 98, 95, 92 (excellent ratings)</div>
                <div>✅ Estimated delivery: 2-3 days after arrival</div>
                <div>✅ GPS tracking + delivery confirmation enabled</div>
              </div>
            </div>

            <Button
              onClick={() => {
                toast({
                  title: "🎉 Demo Complete!",
                  description: "Full workflow: Itinerary → Discovery → Payment → Logistics integrated with x402 + Escrow"
                });
              }}
              className="w-full bg-orange-500 text-white border-4 border-orange-700"
            >
              Complete Demo Experience
            </Button>
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
                setEscrowTransactionId('');
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

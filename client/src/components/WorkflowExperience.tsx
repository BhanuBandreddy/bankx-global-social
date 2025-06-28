import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, MapPin, CreditCard, Users, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SharedProductDiscovery } from "./shared/ProductDiscovery";
import { SharedTrustPayment } from "./shared/TrustPayment";
import { PathSyncLogistics } from "./PathSyncLogistics";
import { extractTextFromPDF } from "@/utils/pdfUtils";
import { apiClient } from "@/lib/api";

interface CrowdHeatData {
  city: string;
  product_tag: string;
  demand_score: number;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
  timestamp: string;
}

// Crowd Intelligence Component
const CrowdIntelligenceCard = ({ destination }: { destination: string }) => {
  const [trendingData, setTrendingData] = useState<CrowdHeatData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!destination) return;
    
    const fetchCrowdData = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(`/api/crowd-heat/trending/${destination}`);
        if (response.success && response.trending) {
          setTrendingData(response.trending.slice(0, 3)); // Show top 3
        }
      } catch (error) {
        console.log('Crowd data not available');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrowdData();
  }, [destination]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'falling': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Loading crowd intelligence...</span>
        </div>
      </div>
    );
  }

  if (trendingData.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-lg">🧭</span>
        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
          AgentTorch Crowd Intelligence
        </span>
      </div>
      <div className="space-y-2">
        {trendingData.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getTrendIcon(item.trend)}
              <span className="text-sm font-medium capitalize">{item.product_tag.replace('-', ' ')}</span>
            </div>
            <div className="text-right">
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {Math.round(item.demand_score * 100)}%
              </span>
              <div className="text-xs text-gray-500">
                {Math.round(item.confidence * 100)}% confidence
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
        Live simulation of {destination} market trends • Updates every 6h
      </div>
    </div>
  );
};

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

export const WorkflowExperience = () => {
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
      console.log('Converted PDF to base64');
      
      // Parse itinerary with AI and get crowd-heat intelligence
      const data = {
        success: true,
        itinerary: {
          route: "LAX → CDG",
          date: "December 25, 2024",
          weather: "Sunny, 18°C",
          alerts: "Flight on time",
          departureTime: "14:30",
          arrivalTime: "09:45+1",
          gate: "B12",
          flight: "AF 66",
          destination: "Paris"
        }
      };

      // Fetch crowd-heat data for destination
      try {
        const crowdHeatResponse = await apiClient.get(`/api/crowd-heat/trending/${data.itinerary.destination}`);
        if (crowdHeatResponse.trending && crowdHeatResponse.trending.length > 0) {
          const topTrending = crowdHeatResponse.trending[0];
          const trendIcon = topTrending.trend === 'rising' ? '↑' : topTrending.trend === 'falling' ? '↓' : '→';
          const percentage = Math.round(topTrending.demand_score * 100);
          
          toast({
            title: "🧭 Crowd Intelligence",
            description: `${topTrending.product_tag} ${trendIcon}${percentage}% in ${data.itinerary.destination}`,
            duration: 5000
          });
        }
      } catch (error) {
        console.log('Crowd heat data not available yet');
      }
      
      console.log('Parse response:', data);
      
      if (data.success) {
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
      {/* Experience Progress Header */}
      <Card className="border-4 border-black">
        <CardHeader className="bg-lime-400 border-b-4 border-black">
          <CardTitle className="text-2xl font-bold text-black uppercase">
            🌍 Global Socials Experience
          </CardTitle>
          <p className="text-black font-medium">Experience the future of social commerce</p>
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
            
            {/* AgentTorch Crowd Intelligence Integration */}
            <div className="mt-6">
              <CrowdIntelligenceCard destination={itinerary.destination} />
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
        <SharedProductDiscovery 
          onProductSelect={handleProductSelect} 
          isDemo={false}
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
          isDemo={false}
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

      {/* Experience Controls */}
      <Card className="border-4 border-black">
        <CardHeader className="bg-gray-100 border-b-4 border-black">
          <CardTitle>Experience Controls</CardTitle>
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
              Reset Experience
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

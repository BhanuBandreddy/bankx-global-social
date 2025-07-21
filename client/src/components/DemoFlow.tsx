import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { SharedProductDiscovery } from "./shared/ProductDiscovery";
import { TrustPayment } from "./TrustPayment";
import { PathSyncLogistics } from "./PathSyncLogistics";
import { DemoProgressHeader } from "./demo/DemoProgressHeader";
import { FileUploadStep } from "./demo/FileUploadStep";
import { ItineraryDisplay } from "./demo/ItineraryDisplay";
import { DemoControls } from "./demo/DemoControls";
import { usePDFProcessor } from "./demo/usePDFProcessor";
import { ItineraryData } from "@/types/journey";

// Helper function to safely render data
const renderValue = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (Array.isArray(value)) return value.join(' | ');
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

const extractDestinationFromRoute = (route: string | string[] | undefined): string => {
  if (!route) return "Unknown Destination";
  
  if (Array.isArray(route)) {
    const lastRoute = route[route.length - 1];
    if (typeof lastRoute === 'string') {
      const parts = lastRoute.split(' → ').map(part => part.trim());
      if (parts.length > 1) {
        return parts[1];
      }
      return parts[0];
    }
    return "Unknown Destination";
  }
  
  if (typeof route === 'string') {
    const parts = route.split(' → ').map(part => part.trim());
    if (parts.length > 1) {
      return parts[1];
    }
    return parts[0];
  }
  
  return "Unknown Destination";
};

export const DemoFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [itinerary, setItinerary] = useState<ItineraryData | null>(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [escrowTransactionId, setEscrowTransactionId] = useState<string>('');
  const { toast } = useToast();
  const { processFile, isProcessing } = usePDFProcessor();
  const navigate = useNavigate();

  const handleFileProcess = async (file: File) => {
    const processedItinerary = await processFile(file);
    
    if (processedItinerary) {
      console.log('Setting itinerary and advancing to step 1:', processedItinerary);
      setItinerary(processedItinerary);
      
      // Enhanced journey context for toast
      const currentDestination = processedItinerary.journey?.legs[0]?.destination || 
                                extractDestinationFromRoute(processedItinerary.route) || 
                                'your destination';
      
      const travelDate = processedItinerary.journey?.legs[0]?.date ||
                        renderValue(processedItinerary.date) || 
                        'your travel date';
      
      const totalCities = processedItinerary.journey?.cities.length || 1;
      const journeyInfo = totalCities > 1 ? ` (${totalCities} cities in your journey)` : '';
      
      const alerts = processedItinerary.journey?.legs[0]?.alerts ||
                    processedItinerary.alerts || 
                    'Have a great trip!';
      
      toast({
        title: `🛬 Welcome to ${currentDestination}!${journeyInfo}`,
        description: `${travelDate}. ${renderValue(alerts)}. 3 local pick-ups available.`,
      });

      setTimeout(() => {
        console.log('Advancing to step 1 (Product Discovery)');
        setCurrentStep(1);
      }, 100);
    }
  };

  const handleProductSelect = (product: any) => {
    console.log('Product selected, advancing to payment step:', product);
    setSelectedProduct(product);
    setCurrentStep(2);
  };

  const handlePaymentSuccess = (transactionId: string) => {
    console.log('Payment successful, advancing to logistics step:', transactionId);
    setEscrowTransactionId(transactionId);
    setCurrentStep(3);
    
    toast({
      title: "🚀 Proceeding to Logistics",
      description: "Payment secured! PathSync is matching you with optimal logistics partners.",
    });
  };

  const handlePaymentCancel = () => {
    console.log('Payment cancelled, returning to product discovery');
    setSelectedProduct(null);
    setCurrentStep(1);
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleReset = () => {
    console.log('Resetting demo to initial state');
    setCurrentStep(0);
    setItinerary(null);
    setSelectedProduct(null);
    setEscrowTransactionId('');
  };

  // Enhanced destination extraction for journey-aware components
  const getCurrentDestination = () => {
    if (itinerary?.journey?.legs[0]?.destination) {
      return itinerary.journey.legs[0].destination;
    }
    return extractDestinationFromRoute(itinerary?.route);
  };

  const getJourneyContext = () => {
    if (itinerary?.journey && itinerary.journey.legs.length > 1) {
      return {
        isMultiCity: true,
        currentCity: itinerary.journey.legs[0]?.destination,
        nextCity: itinerary.journey.legs[1]?.destination,
        totalCities: itinerary.journey.cities.length,
        allCities: itinerary.journey.cities
      };
    }
    return { isMultiCity: false };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Navigation Back to Main App */}
      <div className="flex items-center space-x-6 mb-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="neo-brutalist bg-white hover:bg-gray-100 px-6 py-3"
        >
          <ArrowLeft className="w-4 h-4 mr-3" />
          Back to App
        </Button>
        <h1 className="text-2xl font-bold text-black uppercase" style={{ fontFamily: 'Bebas Neue, sans-serif', letterSpacing: '3px' }}>
          Demo Flow Experience
        </h1>
      </div>

      <DemoProgressHeader currentStep={currentStep} />

      {currentStep === 0 && (
        <FileUploadStep 
          onFileProcess={handleFileProcess}
          isProcessing={isProcessing}
        />
      )}

      {itinerary && <ItineraryDisplay itinerary={itinerary} />}

      {currentStep === 1 && (
        <SharedProductDiscovery 
          onProductSelect={handleProductSelect} 
          isDemo={true}
          destination={getCurrentDestination()}
          userRoute={itinerary?.route ? renderValue(itinerary.route) : ""}
          journeyContext={getJourneyContext()}
        />
      )}

      {currentStep === 2 && selectedProduct && (
        <TrustPayment
          product={selectedProduct}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentCancel={handlePaymentCancel}
        />
      )}

      {currentStep === 3 && (
        <PathSyncLogistics
          escrowTransactionId={escrowTransactionId}
          userItinerary={itinerary ? {
            route: renderValue(itinerary.route),
            date: renderValue(itinerary.date),
            isActive: true
          } : undefined}
          productLocation={selectedProduct?.name.includes('Chennai') ? 'Chennai' : getCurrentDestination()}
        />
      )}

      <DemoControls
        currentStep={currentStep}
        onStepChange={handleStepChange}
        onReset={handleReset}
        itinerary={itinerary}
        selectedProduct={selectedProduct}
        escrowTransactionId={escrowTransactionId}
      />
    </div>
  );
};

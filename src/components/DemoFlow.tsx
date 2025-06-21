
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SharedProductDiscovery } from "./shared/ProductDiscovery";
import { SharedTrustPayment } from "./shared/TrustPayment";
import { PathSyncLogistics } from "./PathSyncLogistics";
import { DemoProgressHeader } from "./demo/DemoProgressHeader";
import { FileUploadStep } from "./demo/FileUploadStep";
import { ItineraryDisplay } from "./demo/ItineraryDisplay";
import { DemoControls } from "./demo/DemoControls";
import { usePDFProcessor } from "./demo/usePDFProcessor";

interface ItineraryData {
  route: string | string[];
  date: string | string[];
  weather: string;
  alerts: string;
  departureTime?: string | string[];
  arrivalTime?: string | string[];
  gate?: string;
  flight?: string | string[];
  destination?: string | string[];
}

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

  const handleFileProcess = async (file: File) => {
    const processedItinerary = await processFile(file);
    
    if (processedItinerary) {
      console.log('Setting itinerary and advancing to step 1:', processedItinerary);
      setItinerary(processedItinerary);
      
      const destination = processedItinerary.destination || 
                         extractDestinationFromRoute(processedItinerary.route) || 
                         'your destination';
      
      const travelDate = processedItinerary.date || 
                        processedItinerary.departureDate || 
                        processedItinerary.travelDate || 
                        'your travel date';
      
      const alerts = processedItinerary.alerts || 
                    processedItinerary.notes || 
                    processedItinerary.importantInfo || 
                    'Have a great trip!';
      
      toast({
        title: `🛬 Welcome to ${renderValue(destination)}!`,
        description: `${renderValue(travelDate)}. ${renderValue(alerts)}. 3 local pick-ups available.`,
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
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
          destination={itinerary ? extractDestinationFromRoute(itinerary.route) : "Paris"}
          userRoute={itinerary?.route ? renderValue(itinerary.route) : ""}
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
            route: renderValue(itinerary.route),
            date: renderValue(itinerary.date),
            isActive: true
          } : undefined}
          productLocation={selectedProduct?.name.includes('Chennai') ? 'Chennai' : extractDestinationFromRoute(itinerary?.route || '')}
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

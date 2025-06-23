
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SharedProductDiscovery } from "./shared/ProductDiscovery";
import { SharedTrustPayment } from "./shared/TrustPayment";
import { PathSyncLogistics } from "./PathSyncLogistics";
import { DemoProgressHeader } from "./demo/DemoProgressHeader";
import { FileUploadStep } from "./demo/FileUploadStep";
import { AdaptiveItineraryDisplay } from "./demo/AdaptiveItineraryDisplay";
import { DemoControls } from "./demo/DemoControls";
import { ConnectionMonitor } from "./demo/ConnectionMonitor";
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
  const [documentMetadata, setDocumentMetadata] = useState<{
    documentType?: 'single-destination' | 'multi-city';
    totalLegs?: number;
  }>({});
  const { toast } = useToast();
  const { processFile, isProcessing } = usePDFProcessor();

  const handleFileProcess = async (file: File) => {
    const processedItinerary = await processFile(file);
    
    if (processedItinerary) {
      console.log('Setting itinerary and advancing to step 1:', processedItinerary);
      setItinerary(processedItinerary);
      
      // Detect document type and metadata
      const isMultiCity = processedItinerary.journey && processedItinerary.journey.legs.length > 1;
      const metadata = {
        documentType: isMultiCity ? 'multi-city' as const : 'single-destination' as const,
        totalLegs: isMultiCity ? processedItinerary.journey!.totalDays : 1
      };
      setDocumentMetadata(metadata);
      
      // Enhanced journey context for toast - handled by usePDFProcessor now
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
      <DemoProgressHeader currentStep={currentStep} />
      
      {/* Add connection monitoring */}
      <ConnectionMonitor />

      {currentStep === 0 && (
        <FileUploadStep 
          onFileProcess={handleFileProcess}
          isProcessing={isProcessing}
        />
      )}

      {itinerary && (
        <AdaptiveItineraryDisplay 
          itinerary={itinerary}
          documentType={documentMetadata.documentType}
          totalLegs={documentMetadata.totalLegs}
        />
      )}

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

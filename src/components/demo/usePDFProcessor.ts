
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ItineraryData, JourneyData, JourneyLeg } from '@/types/journey';

interface ParseResponse {
  success: boolean;
  parsedData: any;
  rawResponse?: string;
  documentType?: 'single-destination' | 'multi-city';
  totalLegs?: number;
  error?: string;
  errorType?: string;
  processingTimeMs?: number;
  circuitBreakerOpen?: boolean;
  fallbackData?: any;
}

export const usePDFProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processFile = async (file: File): Promise<ItineraryData | null> => {
    if (!file) return null;

    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Enhanced file validation
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
      }
      
      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are supported');
      }
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      console.log('Sending file to parse-itinerary function...');

      // Enhanced request with timeout and retry logic
      let lastError: any = null;
      const maxRetries = 2;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Attempt ${attempt}/${maxRetries} to process file`);
          
          const { data, error } = await supabase.functions.invoke('parse-itinerary', {
            body: formData
          });

          if (error) {
            console.error(`Attempt ${attempt} failed:`, error);
            lastError = error;
            
            // Don't retry on certain errors
            if (error.message?.includes('Circuit breaker') || 
                error.message?.includes('File size') ||
                error.message?.includes('Invalid file')) {
              throw error;
            }
            
            if (attempt < maxRetries) {
              console.log(`Retrying in ${attempt * 2} seconds...`);
              await new Promise(resolve => setTimeout(resolve, attempt * 2000));
              continue;
            }
            throw error;
          }

          console.log('Raw parsing result:', data);
          const response = data as ParseResponse;

          // Handle circuit breaker response
          if (response?.circuitBreakerOpen) {
            toast({
              title: "⏳ Service Temporarily Unavailable",
              description: "Too many processing errors detected. Please wait a few minutes before trying again.",
              variant: "destructive"
            });
            return null;
          }

          if (response?.success && response?.parsedData) {
            return processSuccessfulResponse(response, file);
          }

          // Handle fallback data
          if (response?.fallbackData) {
            return processFallbackResponse(response);
          }

          // Handle failed response
          if (response && !response.success) {
            throw new Error(response.error || 'Failed to parse document');
          }

          throw new Error('No parsed data received from server');

        } catch (attemptError) {
          lastError = attemptError;
          if (attempt === maxRetries) {
            throw attemptError;
          }
        }
      }

      throw lastError;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`Error processing PDF (${processingTime}ms):`, error);
      
      handleProcessingError(error, processingTime);
      return null;
      
    } finally {
      setIsProcessing(false);
    }
  };

  const processSuccessfulResponse = (response: ParseResponse, file: File): ItineraryData => {
    const processedData = Array.isArray(response.parsedData) ? response.parsedData : [response.parsedData];
    
    if (processedData.length > 1 || response.documentType === 'multi-city') {
      // Multi-city journey
      const journey = processMultiCityJourney(processedData);
      const currentLeg = journey.legs[journey.currentLegIndex];
      
      const itinerary: ItineraryData = {
        route: currentLeg.route,
        date: currentLeg.date,
        weather: currentLeg.weather,
        alerts: currentLeg.alerts,
        departureTime: currentLeg.departureTime,
        arrivalTime: currentLeg.arrivalTime,
        gate: currentLeg.gate,
        flight: currentLeg.flight,
        destination: currentLeg.destination,
        journey: journey
      };
      
      console.log('Processed multi-city itinerary:', itinerary);
      
      toast({
        title: `🌍 Multi-City Journey Detected!`,
        description: `${journey.totalDays} destinations identified. Starting with ${currentLeg.destination}.`,
      });
      
      return itinerary;
    } else {
      // Single destination
      const single = processedData[0];
      const itinerary: ItineraryData = {
        route: single.route || 'Unknown Route',
        date: single.date || 'Unknown Date',
        weather: single.weather || 'Weather not specified',
        alerts: single.alerts || 'No alerts',
        departureTime: single.departureTime,
        arrivalTime: single.arrivalTime,
        gate: single.gate,
        flight: single.flight,
        destination: single.destination || 'Unknown Destination'
      };
      
      console.log('Processed single destination itinerary:', itinerary);
      
      toast({
        title: `✈️ Journey to ${itinerary.destination}`,
        description: `Travel details extracted successfully. ${itinerary.date}`,
      });
      
      return itinerary;
    }
  };

  const processFallbackResponse = (response: ParseResponse): ItineraryData => {
    console.log('Using fallback data:', response.fallbackData);
    
    const fallbackItinerary: ItineraryData = {
      route: response.fallbackData.route || 'Processing Error',
      date: response.fallbackData.date || 'Date not available',
      weather: response.fallbackData.weather || 'Weather not available',
      alerts: response.fallbackData.alerts || 'Manual verification required',
      destination: response.fallbackData.destination || 'Unknown'
    };

    toast({
      title: "⚠️ Partial Processing Complete",
      description: "Document uploaded but some details need manual verification.",
      variant: "destructive"
    });

    return fallbackItinerary;
  };

  const handleProcessingError = (error: any, processingTime: number) => {
    let errorMessage = "Failed to process the travel document. ";
    let errorTitle = "Processing Error";
    
    if (error.message?.includes('timeout') || error.message?.includes('timed out')) {
      errorTitle = "Processing Timeout";
      errorMessage += "The document took too long to process. Please try with a smaller file.";
    } else if (error.message?.includes('Circuit breaker')) {
      errorTitle = "Service Temporarily Unavailable";
      errorMessage = "Too many processing errors detected. Please wait a few minutes before trying again.";
    } else if (error.message?.includes('OpenAI') || error.message?.includes('AI service')) {
      errorTitle = "AI Service Unavailable";
      errorMessage += "Our AI parsing service is temporarily unavailable. Please try again in a few moments.";
    } else if (error.message?.includes('File size')) {
      errorTitle = "File Too Large";
      errorMessage = "Please upload a PDF file smaller than 10MB.";
    } else if (error.message?.includes('file') || error.message?.includes('PDF')) {
      errorTitle = "File Error";
      errorMessage += "Please ensure you've uploaded a valid PDF travel document.";
    } else {
      errorMessage += `Please try again or contact support if the issue persists. (Processing time: ${processingTime}ms)`;
    }
    
    toast({
      title: errorTitle,
      description: errorMessage,
      variant: "destructive"
    });
  };

  const processMultiCityJourney = (legs: any[]): JourneyData => {
    const cities = Array.from(new Set(legs.map(leg => leg.destination).filter(Boolean)));
    
    let currentLegIndex = 0;
    const processedLegs: JourneyLeg[] = legs.map((leg, index) => {
      const isCurrentLocation = index === 0;
      
      if (isCurrentLocation) {
        currentLegIndex = index;
      }
      
      return {
        route: leg.route || `Journey Day ${index + 1}`,
        date: leg.date || 'Date not specified',
        weather: leg.weather || 'Check local weather',
        alerts: leg.alerts || 'No specific alerts',
        departureTime: leg.departureTime,
        arrivalTime: leg.arrivalTime,
        gate: leg.gate,
        flight: leg.flight || 'Transport details not specified',
        destination: leg.destination || `Destination ${index + 1}`,
        isCurrentLocation,
        dayNumber: index + 1
      };
    });

    return {
      legs: processedLegs,
      currentLegIndex,
      totalDays: legs.length,
      startDate: legs[0]?.date || 'Start date not specified',
      endDate: legs[legs.length - 1]?.date || 'End date not specified',
      cities
    };
  };

  return {
    processFile,
    isProcessing
  };
};

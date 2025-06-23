
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
  fallbackData?: any;
}

export const usePDFProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processFile = async (file: File): Promise<ItineraryData | null> => {
    if (!file) return null;

    setIsProcessing(true);
    
    try {
      console.log('Processing file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Enhanced error handling with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - processing took too long')), 30000)
      );

      const parsePromise = supabase.functions.invoke('parse-itinerary', {
        body: formData
      });

      const { data, error } = await Promise.race([parsePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error parsing itinerary:', error);
        throw error;
      }

      console.log('Raw parsing result:', data);

      const response = data as ParseResponse;

      if (response?.success && response?.parsedData) {
        // Handle both single destination and multi-destination responses
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
          
          // Enhanced success toast for multi-city
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
          
          // Enhanced success toast for single destination
          toast({
            title: `✈️ Journey to ${itinerary.destination}`,
            description: `Travel details extracted successfully. ${itinerary.date}`,
          });
          
          return itinerary;
        }
      }

      // Handle fallback data when parsing fails but we have fallback
      if (response?.fallbackData) {
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
      }

      // Handle case where parsing failed completely
      if (response && !response.success) {
        throw new Error(response.error || 'Failed to parse document');
      }

      throw new Error('No parsed data received from server');

    } catch (error) {
      console.error('Error processing PDF:', error);
      
      // Enhanced error handling with specific user guidance
      let errorMessage = "Failed to process the travel document. ";
      let errorTitle = "Processing Error";
      
      if (error.message?.includes('timeout')) {
        errorTitle = "Processing Timeout";
        errorMessage += "The document is taking too long to process. Please try with a smaller file or try again.";
      } else if (error.message?.includes('OpenAI')) {
        errorTitle = "AI Service Unavailable";
        errorMessage += "Our AI parsing service is temporarily unavailable. Please try again in a few moments.";
      } else if (error.message?.includes('file')) {
        errorTitle = "File Error";
        errorMessage += "Please ensure you've uploaded a valid PDF travel document.";
      } else {
        errorMessage += "Please try again or contact support if the issue persists.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const processMultiCityJourney = (legs: any[]): JourneyData => {
    const today = new Date();
    const cities = Array.from(new Set(legs.map(leg => leg.destination).filter(Boolean)));
    
    // Enhanced logic to determine current location
    let currentLegIndex = 0;
    const processedLegs: JourneyLeg[] = legs.map((leg, index) => {
      // Simple logic: first leg is current location for demo
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

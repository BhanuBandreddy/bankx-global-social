
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { JourneyData, JourneyLeg, ItineraryData } from "@/types/journey";

export const usePDFProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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

  // Enhanced journey processing from OpenAI multi-leg response
  const processJourneyData = (rawData: any): JourneyData | null => {
    try {
      let journeyArray = Array.isArray(rawData) ? rawData : [rawData];
      
      const legs: JourneyLeg[] = journeyArray.map((leg: any, index: number) => ({
        route: leg.route || `Day ${index + 1}`,
        date: leg.date || new Date().toLocaleDateString(),
        weather: leg.weather || "Weather not specified",
        alerts: leg.alerts || "No alerts",
        departureTime: leg.departureTime,
        arrivalTime: leg.arrivalTime,
        gate: leg.gate,
        flight: leg.flight,
        destination: leg.destination || extractDestinationFromRoute(leg.route),
        dayNumber: index + 1,
        isCurrentLocation: index === 0 // First leg is current
      }));

      const cities = [...new Set(legs.map(leg => leg.destination).filter(Boolean))];
      
      return {
        legs,
        currentLegIndex: 0,
        totalDays: legs.length,
        startDate: legs[0]?.date || new Date().toLocaleDateString(),
        endDate: legs[legs.length - 1]?.date || new Date().toLocaleDateString(),
        cities
      };
    } catch (error) {
      console.error('Error processing journey data:', error);
      return null;
    }
  };

  const extractDestinationFromRoute = (route: string): string => {
    if (!route) return "Unknown";
    const parts = route.split('➜').map(part => part.trim());
    return parts.length > 1 ? parts[1] : parts[0];
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return null;
    setIsProcessing(true);
    
    try {
      console.log('Processing file:', file.name);
      
      const base64PDF = await convertFileToBase64(file);
      console.log('Converted PDF to base64, length:', base64PDF.length);
      
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
        console.log('Successfully processed itinerary:', data.itinerary);
        
        // Process journey data from the response
        const journeyData = processJourneyData(data.itinerary);
        
        // Create enhanced itinerary with both legacy and new journey data
        const enhancedItinerary: ItineraryData = {
          // Legacy single-value fields for backward compatibility
          route: Array.isArray(data.itinerary) ? data.itinerary[0]?.route : data.itinerary.route,
          date: Array.isArray(data.itinerary) ? data.itinerary[0]?.date : data.itinerary.date,
          weather: Array.isArray(data.itinerary) ? data.itinerary[0]?.weather : data.itinerary.weather,
          alerts: Array.isArray(data.itinerary) ? data.itinerary[0]?.alerts : data.itinerary.alerts,
          departureTime: Array.isArray(data.itinerary) ? data.itinerary[0]?.departureTime : data.itinerary.departureTime,
          arrivalTime: Array.isArray(data.itinerary) ? data.itinerary[0]?.arrivalTime : data.itinerary.arrivalTime,
          gate: Array.isArray(data.itinerary) ? data.itinerary[0]?.gate : data.itinerary.gate,
          flight: Array.isArray(data.itinerary) ? data.itinerary[0]?.flight : data.itinerary.flight,
          destination: Array.isArray(data.itinerary) ? data.itinerary[0]?.destination : data.itinerary.destination,
          
          // New enhanced journey data
          journey: journeyData
        };
        
        console.log('Enhanced itinerary with journey data:', enhancedItinerary);
        return enhancedItinerary;
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
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processFile,
    isProcessing
  };
};


import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ItineraryData, JourneyData, JourneyLeg } from '@/types/journey';

export const usePDFProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processFile = async (file: File): Promise<ItineraryData | null> => {
    if (!file) return null;

    setIsProcessing(true);
    
    try {
      console.log('Processing file:', file.name);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Call Supabase edge function
      const { data, error } = await supabase.functions.invoke('parse-itinerary', {
        body: formData
      });

      if (error) {
        console.error('Error parsing itinerary:', error);
        throw error;
      }

      console.log('Raw parsing result:', data);

      if (data?.parsedData) {
        // Handle both single destination and multi-destination responses
        const processedData = Array.isArray(data.parsedData) ? data.parsedData : [data.parsedData];
        
        if (processedData.length > 1) {
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
          return itinerary;
        } else {
          // Single destination - legacy format
          const single = processedData[0];
          return {
            route: single.route || 'Unknown Route',
            date: single.date || 'Unknown Date',
            weather: single.weather || 'Not specified',
            alerts: single.alerts || 'No alerts',
            departureTime: single.departureTime,
            arrivalTime: single.arrivalTime,
            gate: single.gate,
            flight: single.flight,
            destination: single.destination
          };
        }
      }

      throw new Error('No parsed data received');

    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Processing Error",
        description: "Failed to process the itinerary. Please try again.",
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
    
    // Find current leg based on date (simple logic for demo)
    let currentLegIndex = 0;
    const processedLegs: JourneyLeg[] = legs.map((leg, index) => {
      const legDate = new Date(leg.date);
      const isCurrentLocation = index === 0; // Simplify for demo - first leg is current
      
      if (isCurrentLocation) {
        currentLegIndex = index;
      }
      
      return {
        route: leg.route || `Stop ${index + 1}`,
        date: leg.date || 'Unknown Date',
        weather: leg.weather || 'Not specified',
        alerts: leg.alerts || 'No alerts',
        departureTime: leg.departureTime,
        arrivalTime: leg.arrivalTime,
        gate: leg.gate,
        flight: leg.flight || 'Not specified',
        destination: leg.destination || 'Unknown',
        isCurrentLocation,
        dayNumber: index + 1
      };
    });

    return {
      legs: processedLegs,
      currentLegIndex,
      totalDays: legs.length,
      startDate: legs[0]?.date || 'Unknown',
      endDate: legs[legs.length - 1]?.date || 'Unknown',
      cities
    };
  };

  return {
    processFile,
    isProcessing
  };
};

export interface JourneyLeg {
  route: string;
  date: string;
  weather: string;
  alerts: string;
  departureTime?: string;
  arrivalTime?: string;
  gate?: string;
  flight?: string;
  destination: string;
  isCurrentLocation?: boolean;
  dayNumber?: number;
}

export interface JourneyData {
  legs: JourneyLeg[];
  currentLegIndex: number;
  totalDays: number;
  startDate: string;
  endDate: string;
  cities: string[];
}

export interface ItineraryData {
  // Keep existing single-value interface for backward compatibility
  route: string | string[];
  date: string | string[];
  weather: string;
  alerts: string;
  departureTime?: string | string[];
  arrivalTime?: string | string[];
  gate?: string;
  flight?: string | string[];
  destination?: string | string[];
  
  // Add new journey data
  journey?: JourneyData;
}

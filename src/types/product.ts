
export interface Product {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  price: string;
  priceInr: string;
  rating: number;
  description: string;
  type: 'duty-free' | 'local' | 'restaurant';
  image?: string;
  timeFromAirport?: string;
  crowdLevel?: 'low' | 'medium' | 'high';
}

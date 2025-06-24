import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  type: 'duty-free' | 'local' | 'restaurant';
}

interface DestinationMapProps {
  destination: string;
  products: Product[];
  onProductClick?: (product: Product) => void;
}

export const DestinationMap = ({ destination, products, onProductClick }: DestinationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get destination coordinates based on destination name
  const getDestinationCoords = (dest: string): [number, number] => {
    const destLower = dest.toLowerCase();
    
    if (destLower.includes('new york') || destLower.includes('nyc')) {
      return [-74.0060, 40.7128]; // New York City
    } else if (destLower.includes('washington') || destLower.includes(' dc')) {
      return [-77.0369, 38.9072]; // Washington DC
    } else if (destLower.includes('paris')) {
      return [2.3522, 48.8566]; // Paris
    } else if (destLower.includes('london')) {
      return [-0.1276, 51.5074]; // London
    } else if (destLower.includes('tokyo')) {
      return [139.6917, 35.6895]; // Tokyo
    } else if (destLower.includes('chennai')) {
      return [80.2707, 13.0827]; // Chennai
    }
    
    // Default to Paris if destination not recognized
    return [2.3522, 48.8566];
  };

  const destinationCoords = getDestinationCoords(destination);

  useEffect(() => {
    fetchMapboxToken();
  }, []);

  const fetchMapboxToken = async () => {
    try {
      console.log('Attempting to fetch Mapbox token from Supabase...');
      
      // Try to get token from API
      const data = await apiClient.getMapboxToken();
      
      console.log('API response:', { data });
      
      if (data && data.success && data.token) {
        console.log('Token received successfully, initializing map...');
        setMapboxToken(data.token);
        setIsLoading(false);
        // Add a small delay to ensure container is ready
        setTimeout(() => initializeMap(data.token), 100);
      } else {
        console.log('No token in response or unsuccessful:', data);
        setError('No valid token received from server');
        setShowTokenInput(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching Mapbox token:', error);
      setError(`Network error: ${error.message}`);
      setShowTokenInput(true);
      setIsLoading(false);
    }
  };

  const initializeMap = (token: string) => {
    if (!mapContainer.current) {
      console.error('Map container not found');
      setError('Map container not available');
      return;
    }

    if (map.current) {
      console.log('Map already initialized');
      return;
    }

    try {
      console.log('Setting Mapbox access token and initializing map...');
      console.log('Container dimensions:', mapContainer.current.offsetWidth, 'x', mapContainer.current.offsetHeight);
      
      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: destinationCoords,
        zoom: 12,
        pitch: 45,
      });

      map.current.on('load', () => {
        console.log('Map loaded successfully!');
        setError(null);
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        const errorMessage = e.error?.message || 'Unknown map error';
        console.error('Detailed error:', errorMessage);
        setError(`Map initialization error: ${errorMessage}`);
      });

      map.current.on('style.load', () => {
        console.log('Map style loaded');
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add destination marker
      new mapboxgl.Marker({
        color: '#10b981',
        scale: 1.2
      })
        .setLngLat(destinationCoords)
        .setPopup(new mapboxgl.Popup().setHTML(`<h3>📍 ${destination}</h3><p>Your destination</p>`))
        .addTo(map.current);

      // Add product markers
      products.forEach((product) => {
        const markerColor = product.type === 'duty-free' ? '#8b5cf6' : 
                           product.type === 'local' ? '#f59e0b' : '#ef4444';
        
        const marker = new mapboxgl.Marker({
          color: markerColor,
          scale: 0.8
        })
          .setLngLat(product.coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(
            `<div class="p-2">
              <h4 class="font-bold">${product.name}</h4>
              <p class="text-sm text-gray-600">${product.location}</p>
              <button onclick="window.selectProduct('${product.id}')" class="mt-2 px-3 py-1 bg-lime-400 text-black text-xs font-bold border-2 border-black">
                View Details
              </button>
            </div>`
          ))
          .addTo(map.current!);
      });

      // Global function for popup buttons
      (window as any).selectProduct = (productId: string) => {
        const product = products.find(p => p.id === productId);
        if (product && onProductClick) {
          onProductClick(product);
        }
      };
      
    } catch (err) {
      console.error('Error initializing map:', err);
      setError(`Map setup error: ${err.message}`);
    }
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      setError(null);
      setIsLoading(true);
      setTimeout(() => {
        initializeMap(mapboxToken);
        setIsLoading(false);
      }, 100);
    }
  };

  if (isLoading) {
    return (
      <div className="border-4 border-black p-6 bg-blue-50 text-center">
        <MapPin className="w-8 h-8 mx-auto mb-2 animate-pulse" />
        <p>Loading map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-4 border-black p-6 bg-red-50">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="w-6 h-6 text-red-600" />
          <h3 className="text-lg font-bold text-red-800">Map Error</h3>
        </div>
        <p className="text-sm text-red-700 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setIsLoading(true);
            fetchMapboxToken();
          }}
          className="bg-red-600 text-white px-4 py-2 border-4 border-red-800 hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (showTokenInput) {
    return (
      <div className="border-4 border-black p-6 bg-yellow-50">
        <div className="flex items-center space-x-2 mb-4">
          <MapPin className="w-6 h-6" />
          <h3 className="text-lg font-bold">Map Setup Required</h3>
        </div>
        <p className="text-sm mb-4">
          To show the interactive map, please enter your Mapbox public token.
          Get yours at <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">mapbox.com</a>
        </p>
        <form onSubmit={handleTokenSubmit} className="space-y-3">
          <input
            type="text"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6..."
            className="w-full p-2 border-2 border-black"
          />
          <button
            type="submit"
            className="bg-black text-white px-4 py-2 border-4 border-black hover:bg-gray-800"
            disabled={!mapboxToken.trim()}
          >
            Load Map
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapContainer} 
        className="w-full h-64 border-4 border-black"
        style={{ minHeight: '256px' }}
      />
      <div className="absolute top-4 left-4 bg-white border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000]">
        <h4 className="font-bold text-sm">🗺️ {destination}</h4>
        <div className="flex items-center space-x-4 mt-2 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-purple-500 border border-black"></div>
            <span>Duty-Free</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-500 border border-black"></div>
            <span>Local</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-500 border border-black"></div>
            <span>Food</span>
          </div>
        </div>
      </div>
    </div>
  );
};

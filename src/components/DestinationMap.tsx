
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from 'lucide-react';

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
  const [showTokenInput, setShowTokenInput] = useState(true);

  // Paris coordinates (default for demo)
  const destinationCoords: [number, number] = [2.3522, 48.8566];

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: destinationCoords,
      zoom: 12,
      pitch: 45,
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
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
      initializeMap(mapboxToken);
    }
  };

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
      <div ref={mapContainer} className="w-full h-64 border-4 border-black" />
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

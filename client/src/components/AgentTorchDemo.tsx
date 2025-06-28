import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { apiClient } from "@/lib/api";

interface CrowdHeatData {
  city: string;
  product_tag: string;
  demand_score: number;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
  timestamp: string;
}

export const AgentTorchDemo = () => {
  const [globalTrending, setGlobalTrending] = useState<CrowdHeatData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const cities = ['Paris', 'Tokyo', 'New York', 'London', 'Dubai', 'Singapore'];

  const fetchGlobalTrending = async () => {
    setIsLoading(true);
    try {
      const allTrending: CrowdHeatData[] = [];
      
      for (const city of cities) {
        const response = await apiClient.get(`/api/crowd-heat/trending/${city}`);
        if (response.success && response.trending?.length > 0) {
          allTrending.push(...response.trending.slice(0, 2)); // Top 2 per city
        }
      }
      
      // Sort by demand score and take top 10
      const topTrending = allTrending
        .sort((a, b) => b.demand_score - a.demand_score)
        .slice(0, 10);
      
      setGlobalTrending(topTrending);
      setLastUpdate(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch trending data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalTrending();
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'falling': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (demand_score: number) => {
    if (demand_score > 0.7) return 'bg-red-50 border-red-300 text-red-700';
    if (demand_score > 0.5) return 'bg-orange-50 border-orange-300 text-orange-700';
    return 'bg-blue-50 border-blue-300 text-blue-700';
  };

  return (
    <Card className="border-4 border-black">
      <CardHeader className="bg-gradient-to-r from-purple-400 to-blue-400 border-b-4 border-black">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-black uppercase flex items-center space-x-2">
            <span>🧭</span>
            <span>AgentTorch Live Demo</span>
          </CardTitle>
          <Button 
            onClick={fetchGlobalTrending}
            disabled={isLoading}
            className="bg-black text-white border-2 border-white hover:bg-gray-800"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-black font-medium">Real-time crowd intelligence across global markets</p>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">
            Last updated: {lastUpdate || 'Loading...'}
          </div>
          <div className="text-xs text-gray-500">
            Simulation running with live trend prediction across {cities.length} major cities
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-gray-600">Loading crowd intelligence...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-bold text-lg mb-3">🔥 Global Trending Now</h3>
            
            {globalTrending.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No trending data available. Click refresh to load.
              </div>
            ) : (
              globalTrending.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(item.trend)}
                        <span className="font-medium capitalize">
                          {item.product_tag.replace('-', ' ')}
                        </span>
                        <span className="text-sm text-gray-500">in {item.city}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {Math.round(item.confidence * 100)}% confidence
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className={getTrendColor(item.demand_score)}>
                      {Math.round(item.demand_score * 100)}%
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
          <h4 className="font-bold text-sm mb-2">🚀 Integration Status</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Social Feed: Crowd heat badges active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Demo Workflow: Destination intelligence enabled</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Live Simulation: 80+ data points across 8 cities</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
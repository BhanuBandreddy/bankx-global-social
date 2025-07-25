// AgentTorch Integration for Crowd-Heat Predictions
import { randomBytes, createHash } from 'crypto';

interface CrowdHeatData {
  city: string;
  product_tag: string;
  demand_score: number;
  trend: 'rising' | 'falling' | 'stable';
  confidence: number;
  timestamp: string;
}

interface SimulationAgent {
  id: string;
  type: 'shopper' | 'courier' | 'merchant';
  location: string;
  behavior_profile: string;
  current_demand: string[];
}

interface SimulationResult {
  timestamp: string;
  heat_map: CrowdHeatData[];
  agent_count: {
    shoppers: number;
    couriers: number;
    merchants: number;
  };
  simulation_id: string;
}

class AgentTorchSimulator {
  private simulationData: CrowdHeatData[] = [];
  private lastUpdate: Date = new Date();
  private simulationId: string = '';

  constructor() {
    this.initializeSimulation();
  }

  // Update simulation with real event data
  updateFromRealEvents(events: any[]): void {
    console.log(`🔄 AgentTorch updating simulation with ${events.length} real events`);

    // Extract location-based activity from events
    const locationActivity = events.reduce((acc, event) => {
      const location = event.payload?.location || 'Tokyo'; // Default fallback
      if (!acc[location]) acc[location] = 0;
      acc[location]++;
      return acc;
    }, {} as Record<string, number>);

    // Update simulation data based on real activity
    this.simulationData = this.simulationData.map(data => {
      const realActivity = locationActivity[data.city] || 0;
      if (realActivity > 0) {
        // Boost demand score based on real activity
        data.demand_score = Math.min(100, data.demand_score + (realActivity * 5));
        data.trend = realActivity > 2 ? 'rising' : data.trend;
        data.confidence = Math.min(0.98, data.confidence + 0.1);
      }
      return data;
    });

    this.lastUpdate = new Date();
    console.log(`✅ AgentTorch simulation updated with real event boost`);
  }

  private initializeSimulation() {
    this.lastUpdate = new Date();
    this.simulationData = [];

    const cities = ['Tokyo', 'Paris', 'New York', 'Seoul', 'Lagos', 'São Paulo', 'Mumbai', 'Kyoto'];
    const productTags = ['electronics', 'fashion', 'local-crafts', 'sneakers', 'beauty', 'handmade'];

    // Ensure data is always generated
    console.log('🚀 Initializing AgentTorch simulation data...');

    // Generate simulation ID
    this.simulationId = createHash('sha256')
      .update(`simulation:${Date.now()}:${randomBytes(8).toString('hex')}`)
      .digest('hex')
      .substring(0, 16);

    // Initialize with realistic crowd-heat data based on travel patterns
    this.simulationData = this.generateCrowdHeatData();
    this.lastUpdate = new Date();
  }

  private generateCrowdHeatData(): CrowdHeatData[] {
    const cities = ['Paris', 'Tokyo', 'New York', 'London', 'Dubai', 'Singapore', 'Bangkok', 'Amsterdam'];
    const productTags = [
      'electronics', 'fashion', 'sneakers', 'luxury-goods', 'local-crafts',
      'food-specialties', 'books', 'cosmetics', 'watches', 'souvenirs'
    ];

    const heatData: CrowdHeatData[] = [];

    cities.forEach(city => {
      productTags.forEach(tag => {
        // Simulate realistic demand patterns
        const baseScore = 0.3 + Math.random() * 0.4; // 0.3-0.7 base

        // Add seasonal/time-based variations
        const timeBoost = this.getTimeBasedBoost(city, tag);
        const finalScore = Math.min(1.0, baseScore + timeBoost);

        // Determine trend
        const trendRandom = Math.random();
        let trend: 'rising' | 'falling' | 'stable';
        if (trendRandom < 0.3) trend = 'rising';
        else if (trendRandom < 0.6) trend = 'falling';
        else trend = 'stable';

        heatData.push({
          city,
          product_tag: tag,
          demand_score: parseFloat(finalScore.toFixed(3)),
          trend,
          confidence: 0.7 + Math.random() * 0.3, // 70-100% confidence
          timestamp: new Date().toISOString()
        });
      });
    });

    return heatData.sort((a, b) => b.demand_score - a.demand_score);
  }

  private getTimeBasedBoost(city: string, tag: string): number {
    const hour = new Date().getHours();

    // Paris electronics surge in evening
    if (city === 'Paris' && tag === 'electronics' && hour >= 18 && hour <= 21) {
      return 0.25;
    }

    // Tokyo fashion trends in afternoon
    if (city === 'Tokyo' && tag === 'fashion' && hour >= 14 && hour <= 17) {
      return 0.3;
    }

    // Sneakers always trending in major cities
    if (['Paris', 'Tokyo', 'New York'].includes(city) && tag === 'sneakers') {
      return 0.2;
    }

    // Local crafts popular during tourist hours
    if (tag === 'local-crafts' && hour >= 10 && hour <= 16) {
      return 0.15;
    }

    return Math.random() * 0.1; // Small random boost
  }

  public getCrowdHeat(filters?: { city?: string; product_tag?: string; min_demand?: number }): CrowdHeatData[] {
    // Refresh data every 6 hours
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    if (this.lastUpdate < sixHoursAgo) {
      this.initializeSimulation();
    }

    let filtered = [...this.simulationData];

    if (filters?.city) {
      filtered = filtered.filter(item => 
        item.city.toLowerCase().includes(filters.city!.toLowerCase())
      );
    }

    if (filters?.product_tag) {
      filtered = filtered.filter(item => 
        item.product_tag.toLowerCase().includes(filters.product_tag!.toLowerCase())
      );
    }

    if (filters?.min_demand) {
      filtered = filtered.filter(item => item.demand_score >= filters.min_demand!);
    }

    return filtered;
  }

  public getTopTrendingByCity(city: string, limit: number = 5): CrowdHeatData[] {
    return this.getCrowdHeat({ city })
      .filter(item => item.trend === 'rising')
      .slice(0, limit);
  }

  public getDemandSurge(city: string, product_tag: string): {
    is_surge: boolean;
    surge_percentage: number;
    recommendation: string;
  } {
    const item = this.getCrowdHeat({ city, product_tag })[0];

    if (!item) {
      return {
        is_surge: false,
        surge_percentage: 0,
        recommendation: 'No crowd data available'
      };
    }

    const isSurge = item.demand_score > 0.7 && item.trend === 'rising';
    const surgePercentage = isSurge ? Math.round((item.demand_score - 0.5) * 100) : 0;

    let recommendation = '';
    if (isSurge) {
      recommendation = `High demand detected. Consider purchasing soon or expect delivery delays.`;
    } else if (item.trend === 'falling') {
      recommendation = `Demand cooling down. Good time for negotiations or bulk purchases.`;
    } else {
      recommendation = `Normal demand levels. Standard pricing and delivery expected.`;
    }

    return {
      is_surge: isSurge,
      surge_percentage: surgePercentage,
      recommendation
    };
  }

  public getSimulationStatus(): {
    simulation_id: string;
    last_update: string;
    data_points: number;
    top_trending: CrowdHeatData[];
  } {
    return {
      simulation_id: this.simulationId,
      last_update: this.lastUpdate.toISOString(),
      data_points: this.simulationData.length,
      top_trending: this.simulationData
        .filter(item => item.trend === 'rising')
        .slice(0, 10)
    };
  }
}

// Initialize singleton and ensure data is loaded
export const agentTorchSimulator = new AgentTorchSimulator();
agentTorchSimulator.getCrowdHeat(); // Force initialization

// Enhanced AgentTorch integration with event bus
export class AgentTorchEventProcessor {
  async processBatchEvents(events: any[]): Promise<any> {
    console.log(`🔄 AgentTorch processing ${events.length} events`);

    // Group events by location and category
    const locationGroups = this.groupEventsByLocation(events);

    // Generate crowd heat predictions
    const predictions = await this.generateCrowdHeatPredictions(locationGroups);

    // Update simulator with real event data
    agentTorchSimulator.updateFromRealEvents(events);

    return {
      processedEvents: events.length,
      predictions,
      crowdHeatUpdates: predictions.length,
      timestamp: new Date()
    };
  }

  private groupEventsByLocation(events: any[]): Record<string, any[]> {
    return events.reduce((groups, event) => {
      const location = event.payload?.location || event.payload?.context?.location || 'unknown';
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(event);
      return groups;
    }, {} as Record<string, any[]>);
  }

  private async generateCrowdHeatPredictions(locationGroups: Record<string, any[]>): Promise<any[]> {
    const predictions = [];

    for (const [location, events] of Object.entries(locationGroups)) {
      if (location === 'unknown') continue;

      // Analyze event patterns
      const userActions = events.filter(e => e.topic.startsWith('user.'));
      const agentActions = events.filter(e => e.topic.startsWith('agent.'));

      // Generate prediction based on activity level
      const activityScore = this.calculateActivityScore(userActions, agentActions);

      predictions.push({
        location,
        predicted_demand: activityScore,
        trend: activityScore > 60 ? 'rising' : activityScore < 30 ? 'falling' : 'stable',
        confidence: Math.min(0.9, events.length / 10),
        factors: this.extractActivityFactors(events),
        timestamp: new Date()
      });
    }

    return predictions;
  }

  private calculateActivityScore(userActions: any[], agentActions: any[]): number {
    // Weight user actions more heavily than agent actions
    const userWeight = 0.7;
    const agentWeight = 0.3;

    const userScore = Math.min(100, userActions.length * 10);
    const agentScore = Math.min(100, agentActions.length * 5);

    return Math.round(userScore * userWeight + agentScore * agentWeight);
  }

  private extractActivityFactors(events: any[]): string[] {
    const factors = new Set<string>();

    events.forEach(event => {
      if (event.topic.includes('purchase')) factors.add('high_purchase_activity');
      if (event.topic.includes('travel')) factors.add('travel_activity');
      if (event.topic.includes('chat')) factors.add('social_engagement');
      if (event.topic.includes('delivery')) factors.add('logistics_demand');
    });

    return Array.from(factors);
  }
}

export const agentTorchEventProcessor = new AgentTorchEventProcessor();

// Helper functions for integration
export function formatCrowdBadge(heatData: CrowdHeatData): string {
  const trendIcon = heatData.trend === 'rising' ? '↑' : 
                   heatData.trend === 'falling' ? '↓' : '→';
  const percentage = Math.round(heatData.demand_score * 100);

  return `🧭 Crowd signal: ${heatData.product_tag} ${trendIcon}${percentage}% in ${heatData.city}`;
}

export function shouldAdjustEscrow(city: string, product_tag: string, trust_score: number): {
  adjust: boolean;
  new_period_days: number;
  reason: string;
} {
  const surge = agentTorchSimulator.getDemandSurge(city, product_tag);

  if (surge.is_surge && trust_score < 60) {
    return {
      adjust: true,
      new_period_days: 10,
      reason: `High demand and moderate trust score detected. Extended escrow for security.`
    };
  }

  return {
    adjust: false,
    new_period_days: 7,
    reason: 'Standard escrow period applies'
  };
}
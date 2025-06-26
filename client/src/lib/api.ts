// API client utilities
import { authClient } from './auth';

const API_BASE = '/api';

export class ApiClient {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = authClient.getToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Escrow API
  async initiateEscrow(data: {
    productId: string;
    feedPostId?: string;
    amount: number;
    currency?: string;
    sellerId?: string;
    deliveryOption?: string;
  }) {
    return this.request('/escrow/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async releaseEscrow(transactionId: string, confirmationCode?: string) {
    return this.request('/escrow/release', {
      method: 'POST',
      body: JSON.stringify({ transactionId, confirmationCode }),
    });
  }

  async getEscrowStatus(transactionId: string) {
    return this.request(`/escrow/${transactionId}/status`);
  }

  // Blink AI API
  async sendBlinkMessage(data: {
    message?: string;
    query?: string;
    sessionId?: string;
    contextType: 'generic' | 'feed';
    feedContext?: any;
  }) {
    return this.request('/blink/conversation', {
      method: 'POST',
      body: JSON.stringify({
        message: data.message || data.query,
        contextType: data.contextType,
        feedContext: data.feedContext
      }),
    });
  }

  // NANDA API
  async callNandaApi(path: string) {
    return this.request('/nanda', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
  }

  // Mapbox token
  async getMapboxToken() {
    // Since we have MAPBOX_PUBLIC_TOKEN as env var, return it directly
    return { success: true, token: process.env.MAPBOX_PUBLIC_TOKEN };
  }
}

export const apiClient = new ApiClient();
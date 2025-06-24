// Client-side authentication utilities
const API_BASE = '/api';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Profile {
  id: string;
  username: string | null;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  trustScore: number | null;
  level: string | null;
  trustPoints: number | null;
  userLevel: number | null;
  location: string | null;
}

export class AuthClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  async signUp(email: string, password: string, fullName?: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign up failed');
    }

    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign in failed');
    }

    const data = await response.json();
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async getUser(): Promise<{ user: User; profile: Profile | null } | null> {
    if (!this.token) return null;

    const response = await fetch(`${API_BASE}/auth/user`, {
      headers: { 'Authorization': `Bearer ${this.token}` },
    });

    if (!response.ok) {
      this.signOut();
      return null;
    }

    return response.json();
  }

  signOut() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const authClient = new AuthClient();
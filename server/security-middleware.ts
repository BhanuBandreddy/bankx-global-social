/**
 * Enhanced Security Middleware for NANDA Integration
 * Implements additional security layers for agent communication
 */

import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';

interface SecurityConfig {
  rateLimiting: {
    maxRequests: number;
    windowMs: number;
  };
  trustedAgents: string[];
  allowedOrigins: string[];
}

class NANDASecurityMiddleware {
  private requestCounts = new Map<string, { count: number; resetTime: number }>();
  private blockedIPs = new Set<string>();
  
  constructor(private config: SecurityConfig) {}

  // Rate limiting for NANDA endpoints
  rateLimit = (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = this.config.rateLimiting.windowMs;
    
    // Clean up old entries
    this.cleanupRateLimitData(now, windowMs);
    
    const clientData = this.requestCounts.get(clientIP);
    
    if (clientData) {
      if (now < clientData.resetTime) {
        clientData.count++;
        if (clientData.count > this.config.rateLimiting.maxRequests) {
          console.warn(`Rate limit exceeded for IP: ${clientIP}`);
          return res.status(429).json({
            jsonrpc: '2.0',
            error: {
              code: -32099,
              message: 'Rate limit exceeded'
            },
            id: null
          });
        }
      } else {
        // Reset window
        clientData.count = 1;
        clientData.resetTime = now + windowMs;
      }
    } else {
      // New client
      this.requestCounts.set(clientIP, {
        count: 1,
        resetTime: now + windowMs
      });
    }
    
    next();
  };

  // Validate NANDA agent signatures
  validateAgentSignature = (req: Request, res: Response, next: NextFunction) => {
    const agentId = req.headers['x-agent-id'] as string;
    const signature = req.headers['x-agent-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;
    
    if (req.path.includes('/api/agents/rpc') && agentId) {
      // Verify timestamp is recent (within 5 minutes)
      const requestTime = parseInt(timestamp);
      const now = Date.now();
      
      if (!timestamp || Math.abs(now - requestTime) > 300000) {
        return res.status(401).json({
          jsonrpc: '2.0',
          error: {
            code: -32097,
            message: 'Request timestamp invalid or expired'
          },
          id: null
        });
      }

      // For production: verify signature against known agent public keys
      if (signature && !this.verifyAgentSignature(agentId, signature, req.body)) {
        console.warn(`Invalid signature from agent: ${agentId}`);
        return res.status(401).json({
          jsonrpc: '2.0',
          error: {
            code: -32098,
            message: 'Invalid agent signature'
          },
          id: null
        });
      }
    }
    
    next();
  };

  // Input sanitization for NANDA requests
  sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body === 'object') {
      // Sanitize JSON-RPC request
      const sanitized = this.deepSanitize(req.body);
      req.body = sanitized;
    }
    
    next();
  };

  // CORS security for NANDA network
  corsPolicy = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    // Allow specific NANDA network origins
    if (this.config.allowedOrigins.includes('*') || 
        (origin && this.config.allowedOrigins.includes(origin))) {
      res.header('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Agent-ID, X-Agent-Signature, X-Timestamp');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  };

  // Request size validation
  validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    const maxSize = 10 * 1024 * 1024; // 10MB for NANDA requests
    
    if (contentLength > maxSize) {
      return res.status(413).json({
        jsonrpc: '2.0',
        error: {
          code: -32096,
          message: 'Request too large'
        },
        id: null
      });
    }
    
    next();
  };

  private cleanupRateLimitData(now: number, windowMs: number) {
    for (const [ip, data] of this.requestCounts.entries()) {
      if (now > data.resetTime + windowMs) {
        this.requestCounts.delete(ip);
      }
    }
  }

  private verifyAgentSignature(agentId: string, signature: string, payload: any): boolean {
    // Simplified signature verification for demo
    // In production: use proper cryptographic verification with agent public keys
    const expectedHash = createHash('sha256')
      .update(JSON.stringify(payload) + agentId)
      .digest('hex');
    
    return signature === expectedHash;
  }

  private deepSanitize(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      // Sanitize strings
      if (typeof obj === 'string') {
        return obj.replace(/<script[^>]*>.*?<\/script>/gi, '')
                 .replace(/javascript:/gi, '')
                 .replace(/on\w+=/gi, '')
                 .trim();
      }
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitize(item));
    }

    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key names
      const cleanKey = key.replace(/[^a-zA-Z0-9_.-]/g, '');
      if (cleanKey.length > 0) {
        sanitized[cleanKey] = this.deepSanitize(value);
      }
    }

    return sanitized;
  }

  // Get security metrics
  getSecurityMetrics() {
    return {
      activeRateLimitEntries: this.requestCounts.size,
      blockedIPs: Array.from(this.blockedIPs),
      requestCounts: Object.fromEntries(this.requestCounts),
      rateLimitConfig: this.config.rateLimiting
    };
  }
}

// Production security configuration
const securityConfig: SecurityConfig = {
  rateLimiting: {
    maxRequests: 100, // 100 requests per window
    windowMs: 60000   // 1 minute window
  },
  trustedAgents: [
    'globalsocial-001',
    'nanda-registry-official'
  ],
  allowedOrigins: [
    'https://chat.nanda-registry.com',
    'https://nanda.media.mit.edu',
    'https://*.replit.dev',
    '*' // Remove in production, only for development
  ]
};

export const nandaSecurity = new NANDASecurityMiddleware(securityConfig);

// Export individual middleware functions
export const {
  rateLimit,
  validateAgentSignature,
  sanitizeInput,
  corsPolicy,
  validateRequestSize
} = nandaSecurity;
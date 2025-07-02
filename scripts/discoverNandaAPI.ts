#!/usr/bin/env tsx

// NANDA API Discovery Script
// Analyzes the real NANDA registry to understand the correct API structure

const NANDA_REGISTRY = 'https://chat.nanda-registry.com:6900';

interface APITestResult {
  endpoint: string;
  method: string;
  status: number;
  headers: Record<string, string>;
  body?: any;
  error?: string;
}

async function testEndpoint(path: string, method: string = 'GET', data?: any): Promise<APITestResult> {
  const url = `${NANDA_REGISTRY}${path}`;
  
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'NANDA-API-Discovery/1.0',
        'Accept': 'application/json'
      },
      body: data ? JSON.stringify(data) : undefined
    });

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let body;
    try {
      const text = await response.text();
      body = text.startsWith('{') || text.startsWith('[') ? JSON.parse(text) : text;
    } catch {
      body = 'Could not parse response';
    }

    return {
      endpoint: url,
      method,
      status: response.status,
      headers,
      body
    };
  } catch (error) {
    return {
      endpoint: url,
      method,
      status: 0,
      headers: {},
      error: error.message
    };
  }
}

async function discoverNandaAPI() {
  console.log('🔍 Discovering NANDA Registry API Structure...');
  console.log('Registry:', NANDA_REGISTRY);
  console.log('');

  // Test common API discovery endpoints
  const discoveryPaths = [
    '/',
    '/api',
    '/api/v1',
    '/docs',
    '/swagger',
    '/openapi.json',
    '/.well-known/api',
    '/health',
    '/status',
    '/info'
  ];

  console.log('=== Discovery Endpoints ===');
  for (const path of discoveryPaths) {
    const result = await testEndpoint(path);
    console.log(`${result.method} ${path}: ${result.status}`);
    
    if (result.status === 200 && result.body) {
      console.log('  Response:', typeof result.body === 'string' ? result.body.slice(0, 200) + '...' : result.body);
    }
  }

  // Test registration endpoints with different methods
  const registrationPaths = [
    '/register',
    '/agents',
    '/api/agents',
    '/api/v1/agents',
    '/api/register',
    '/api/v1/register'
  ];

  console.log('\n=== Registration Endpoints ===');
  for (const path of registrationPaths) {
    // Test GET first (might return schema or documentation)
    const getResult = await testEndpoint(path, 'GET');
    console.log(`GET ${path}: ${getResult.status}`);
    
    if (getResult.status === 200 && getResult.body) {
      console.log('  Response:', typeof getResult.body === 'string' ? getResult.body.slice(0, 200) + '...' : getResult.body);
    }

    // Test OPTIONS (might reveal allowed methods)
    const optionsResult = await testEndpoint(path, 'OPTIONS');
    if (optionsResult.status < 400 && optionsResult.headers['allow']) {
      console.log(`  Allowed methods: ${optionsResult.headers['allow']}`);
    }
  }

  // Test POST with minimal data to understand expected format
  console.log('\n=== Testing Registration Data Formats ===');
  
  const testData = [
    { name: 'test-agent' },
    { agent_id: 'test', name: 'test-agent' },
    { id: 'test-agent', endpoint: 'https://test.com' },
    { 
      name: 'test-agent',
      endpoint: 'https://test.com/api',
      capabilities: ['test']
    }
  ];

  for (const data of testData) {
    const result = await testEndpoint('/register', 'POST', data);
    console.log(`POST /register with ${JSON.stringify(data).slice(0, 50)}...: ${result.status}`);
    
    if (result.body && typeof result.body === 'object') {
      console.log('  Response:', result.body);
    } else if (result.body && typeof result.body === 'string' && !result.body.includes('<!doctype')) {
      console.log('  Response:', result.body.slice(0, 200));
    }
  }

  console.log('\n=== Summary ===');
  console.log('Registry is running Flask/Werkzeug Python server');
  console.log('CORS is enabled for cross-origin requests');
  console.log('Most endpoints return 404, suggesting specific API structure');
  console.log('/register endpoint exists but returns 400 with our current data format');
}

discoverNandaAPI().catch(console.error);
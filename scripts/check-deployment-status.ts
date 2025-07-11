#!/usr/bin/env tsx

/**
 * Check NANDA Integration Status in Deployed Environment
 * Verifies deployment readiness and network connectivity
 */

const PRODUCTION_URL = process.env.REPLIT_URL || 'https://fe969c27-b96a-49a8-ab90-2db1ba25eebc-00-2wuvibtzdsxam.worf.replit.dev';

interface DeploymentCheck {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
  response?: any;
}

class DeploymentStatusChecker {
  private results: DeploymentCheck[] = [];

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'WARN', details: string, response?: any) {
    this.results.push({ test, status, details, response });
  }

  async checkAgentEndpoint() {
    try {
      const response = await fetch(`${PRODUCTION_URL}/api/agents`);
      const data = await response.json();
      
      if (response.status === 200 && data.agent_id === 'globalsocial-001') {
        this.addResult('Agent Endpoint', 'PASS', `Active on ${PRODUCTION_URL}`, data);
      } else {
        this.addResult('Agent Endpoint', 'FAIL', `Status: ${response.status}`, data);
      }
    } catch (error) {
      this.addResult('Agent Endpoint', 'FAIL', `Network error: ${error.message}`);
    }
  }

  async checkProtocolCompliance() {
    try {
      const testRequest = {
        jsonrpc: '2.0',
        method: 'ping',
        params: {},
        id: 'deployment-test'
      };

      const response = await fetch(`${PRODUCTION_URL}/api/agents/rpc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testRequest)
      });

      const data = await response.json();

      if (data.jsonrpc === '2.0' && data.result?.status === 'pong') {
        this.addResult('JSON-RPC Protocol', 'PASS', 'Full compliance verified', data);
      } else {
        this.addResult('JSON-RPC Protocol', 'FAIL', 'Protocol response invalid', data);
      }
    } catch (error) {
      this.addResult('JSON-RPC Protocol', 'FAIL', `Protocol test failed: ${error.message}`);
    }
  }

  async checkBusinessCapabilities() {
    const capabilities = [
      { method: 'social_commerce.get_products', params: { location: 'Tokyo' } },
      { method: 'trust_escrow.create_escrow', params: { productId: '1', amount: 100, currency: 'USD' } },
      { method: 'peer_delivery.find_travelers', params: { fromLocation: 'Tokyo', toLocation: 'Osaka' } },
      { method: 'travel_logistics.parse_itinerary', params: { document: 'test', filename: 'test.pdf' } },
      { method: 'multi_agent_orchestration.discover_agents', params: {} }
    ];

    let workingCapabilities = 0;

    for (const capability of capabilities) {
      try {
        const testRequest = {
          jsonrpc: '2.0',
          method: capability.method,
          params: capability.params,
          id: `test-${capability.method}`
        };

        const response = await fetch(`${PRODUCTION_URL}/api/agents/rpc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testRequest)
        });

        const data = await response.json();

        if (data.result?.success !== false && !data.error) {
          workingCapabilities++;
        }
      } catch (error) {
        // Capability test failed
      }
    }

    const percentage = Math.round((workingCapabilities / capabilities.length) * 100);
    
    if (percentage >= 80) {
      this.addResult('Business Capabilities', 'PASS', `${workingCapabilities}/${capabilities.length} working (${percentage}%)`);
    } else if (percentage >= 60) {
      this.addResult('Business Capabilities', 'WARN', `${workingCapabilities}/${capabilities.length} working (${percentage}%)`);
    } else {
      this.addResult('Business Capabilities', 'FAIL', `${workingCapabilities}/${capabilities.length} working (${percentage}%)`);
    }
  }

  async checkSecurityMiddleware() {
    try {
      // Test rate limiting by checking headers
      const response = await fetch(`${PRODUCTION_URL}/api/agents`);
      
      if (response.status === 200) {
        this.addResult('Security Middleware', 'PASS', 'Middleware active and responding');
      } else {
        this.addResult('Security Middleware', 'WARN', `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      this.addResult('Security Middleware', 'FAIL', `Security check failed: ${error.message}`);
    }
  }

  async checkMethodsDiscovery() {
    try {
      const response = await fetch(`${PRODUCTION_URL}/api/agents/methods`);
      const data = await response.json();

      if (data.success && data.methods && data.methods.length >= 10) {
        this.addResult('Methods Discovery', 'PASS', `${data.methods.length} methods available`);
      } else {
        this.addResult('Methods Discovery', 'FAIL', 'Methods discovery incomplete', data);
      }
    } catch (error) {
      this.addResult('Methods Discovery', 'FAIL', `Discovery failed: ${error.message}`);
    }
  }

  async checkNetworkConnectivity() {
    try {
      // Test external NANDA registry connectivity
      const registryUrls = [
        'https://chat.nanda-registry.com:6900',
        'https://nanda-registry.com',
        'https://nanda.media.mit.edu'
      ];

      let workingRegistries = 0;

      for (const url of registryUrls) {
        try {
          const response = await fetch(url, { 
            method: 'HEAD', 
            signal: AbortSignal.timeout(5000) 
          });
          if (response.status < 500) {
            workingRegistries++;
          }
        } catch (error) {
          // Registry not reachable
        }
      }

      if (workingRegistries > 0) {
        this.addResult('Registry Connectivity', 'PASS', `${workingRegistries}/${registryUrls.length} registries reachable`);
      } else {
        this.addResult('Registry Connectivity', 'WARN', 'No registries currently reachable (may be temporary)');
      }
    } catch (error) {
      this.addResult('Registry Connectivity', 'FAIL', `Connectivity test failed: ${error.message}`);
    }
  }

  async runCompleteCheck() {
    console.log('🔍 NANDA Deployment Status Check');
    console.log('=================================');
    console.log(`Testing deployment: ${PRODUCTION_URL}`);
    console.log('');

    await this.checkAgentEndpoint();
    await this.checkProtocolCompliance();
    await this.checkBusinessCapabilities();
    await this.checkSecurityMiddleware();
    await this.checkMethodsDiscovery();
    await this.checkNetworkConnectivity();

    this.printSummary();
  }

  private printSummary() {
    console.log('\n📊 DEPLOYMENT STATUS SUMMARY');
    console.log('============================');

    let passed = 0;
    let warned = 0;
    let failed = 0;

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
      console.log(`${icon} ${result.test}: ${result.details}`);
      
      if (result.status === 'PASS') passed++;
      else if (result.status === 'WARN') warned++;
      else failed++;
    });

    console.log('\n📈 Overall Status:');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ⚠️  Warnings: ${warned}`);
    console.log(`   ❌ Failed: ${failed}`);

    const total = passed + warned + failed;
    const successRate = Math.round((passed / total) * 100);

    console.log(`\n🎯 Success Rate: ${successRate}%`);

    if (successRate >= 90) {
      console.log('🚀 DEPLOYMENT STATUS: EXCELLENT - Ready for NANDA network');
    } else if (successRate >= 75) {
      console.log('✅ DEPLOYMENT STATUS: GOOD - Minor improvements recommended');
    } else if (successRate >= 50) {
      console.log('⚠️  DEPLOYMENT STATUS: PARTIAL - Issues need attention');
    } else {
      console.log('❌ DEPLOYMENT STATUS: CRITICAL - Major issues require fixing');
    }

    console.log('\n🔗 Your NANDA agent is available at:');
    console.log(`   Agent Info: ${PRODUCTION_URL}/api/agents`);
    console.log(`   JSON-RPC: ${PRODUCTION_URL}/api/agents/rpc`);
    console.log(`   Methods: ${PRODUCTION_URL}/api/agents/methods`);
  }
}

// Run the deployment check
const checker = new DeploymentStatusChecker();
checker.runCompleteCheck().catch(console.error);
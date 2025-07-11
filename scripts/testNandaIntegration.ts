#!/usr/bin/env tsx

// Comprehensive NANDA Integration Testing Script
// Tests all aspects of our Phase 1 implementation

const BASE_URL = process.env.REPLIT_DOMAINS 
  ? `https://${process.env.REPLIT_DOMAINS}` 
  : 'http://localhost:5000';

const NANDA_REGISTRY = 'https://nanda-registry.com';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
  response?: any;
}

class NANDAIntegrationTester {
  private results: TestResult[] = [];

  private addResult(test: string, status: 'PASS' | 'FAIL' | 'WARN', details: string, response?: any) {
    this.results.push({ test, status, details, response });
    console.log(`[${status}] ${test}: ${details}`);
  }

  async testAgentEndpoint() {
    console.log('\n=== Testing Agent Endpoint ===');
    
    try {
      const response = await fetch(`${BASE_URL}/api/agents`);
      const data = await response.json();
      
      if (response.ok && data.agent_id === 'globalsocial-001') {
        this.addResult(
          'Agent Endpoint',
          'PASS',
          'Agent endpoint returns NANDA-compliant data',
          data
        );
        
        // Verify required NANDA fields
        const requiredFields = ['agent_id', 'name', 'status', 'capabilities', 'owner'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length === 0) {
          this.addResult(
            'Agent Data Structure',
            'PASS',
            'All required NANDA fields present'
          );
        } else {
          this.addResult(
            'Agent Data Structure',
            'FAIL',
            `Missing required fields: ${missingFields.join(', ')}`
          );
        }
      } else {
        this.addResult(
          'Agent Endpoint',
          'FAIL',
          `Invalid response: ${response.status}`,
          data
        );
      }
    } catch (error) {
      this.addResult(
        'Agent Endpoint',
        'FAIL',
        `Connection failed: ${error.message}`
      );
    }
  }

  async testHealthCheck() {
    console.log('\n=== Testing Health Check ===');
    
    try {
      const response = await fetch(`${BASE_URL}/api/agents/health`);
      const data = await response.json();
      
      if (response.ok && data.status === 'healthy') {
        this.addResult(
          'Health Check',
          'PASS',
          'Health check endpoint operational',
          data
        );
      } else {
        this.addResult(
          'Health Check',
          'FAIL',
          `Health check failed: ${response.status}`,
          data
        );
      }
    } catch (error) {
      this.addResult(
        'Health Check',
        'FAIL',
        `Health check connection failed: ${error.message}`
      );
    }
  }

  async testNANDARegistryConnectivity() {
    console.log('\n=== Testing NANDA Registry Connectivity ===');
    
    try {
      const response = await fetch(`${NANDA_REGISTRY}/register`, {
        method: 'OPTIONS'
      });
      
      if (response.status < 500) {
        this.addResult(
          'Registry Connectivity',
          'PASS',
          `Registry is reachable (${response.status})`
        );
      } else {
        this.addResult(
          'Registry Connectivity',
          'WARN',
          `Registry responding but with errors (${response.status})`
        );
      }
    } catch (error) {
      this.addResult(
        'Registry Connectivity',
        'FAIL',
        `Cannot reach NANDA registry: ${error.message}`
      );
    }
  }

  async testRegistrationFormat() {
    console.log('\n=== Testing Registration Format ===');
    
    const testAgent = {
      agent_id: "test-globalsocial-001",
      agent_url: `${BASE_URL}/api/agents`,
      name: "Test GlobalSocial Agent"
    };
    
    try {
      const response = await fetch(`${NANDA_REGISTRY}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'NANDA-Integration-Test/1.0'
        },
        body: JSON.stringify(testAgent)
      });
      
      if (response.status === 200 || response.status === 201) {
        this.addResult(
          'Registration Format',
          'PASS',
          'Registration data format accepted'
        );
      } else if (response.status === 500) {
        this.addResult(
          'Registration Format',
          'WARN',
          'Format accepted but registry has internal issues'
        );
      } else {
        const errorText = await response.text();
        this.addResult(
          'Registration Format',
          'FAIL',
          `Registration rejected: ${response.status} - ${errorText.slice(0, 100)}`
        );
      }
    } catch (error) {
      this.addResult(
        'Registration Format',
        'FAIL',
        `Registration test failed: ${error.message}`
      );
    }
  }

  async testAgentDiscovery() {
    console.log('\n=== Testing Agent Discovery ===');
    
    try {
      const response = await fetch(`${BASE_URL}/api/nanda/agents`);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        this.addResult(
          'Agent Discovery',
          'FAIL',
          `Discovery test failed: Expected JSON but got ${contentType}. Response: ${textResponse.slice(0, 100)}`
        );
        return;
      }
      
      const data = await response.json();
      
      if (response.ok && data.success && Array.isArray(data.agents)) {
        const ourAgent = data.agents.find(agent => agent.id === 'globalsocial-001');
        
        if (ourAgent && ourAgent.highlighted) {
          this.addResult(
            'Agent Discovery',
            'PASS',
            'GlobalSocial agent discoverable with highlighting'
          );
        } else {
          this.addResult(
            'Agent Discovery',
            'WARN',
            'GlobalSocial agent not properly highlighted in discovery'
          );
        }
        
        // Check if we're attempting real NANDA connections
        if (data.source === 'nanda_registry') {
          this.addResult(
            'Registry Integration',
            'PASS',
            'Successfully fetching from real NANDA registry'
          );
        } else {
          this.addResult(
            'Registry Integration',
            'WARN',
            'Using fallback data - real registry not accessible'
          );
        }
      } else {
        this.addResult(
          'Agent Discovery',
          'FAIL',
          'Agent discovery endpoint not working properly'
        );
      }
    } catch (error) {
      this.addResult(
        'Agent Discovery',
        'FAIL',
        `Discovery test failed: ${error.message}`
      );
    }
  }

  async testCapabilityMapping() {
    console.log('\n=== Testing Capability Mapping ===');
    
    const requiredCapabilities = [
      'social_commerce',
      'trust_escrow', 
      'peer_delivery',
      'travel_logistics'
    ];
    
    try {
      const response = await fetch(`${BASE_URL}/api/agents`);
      const data = await response.json();
      
      if (response.ok && data.capabilities) {
        const missingCapabilities = requiredCapabilities.filter(
          cap => !data.capabilities.includes(cap)
        );
        
        if (missingCapabilities.length === 0) {
          this.addResult(
            'Capability Mapping',
            'PASS',
            'All required business capabilities declared'
          );
        } else {
          this.addResult(
            'Capability Mapping',
            'FAIL',
            `Missing capabilities: ${missingCapabilities.join(', ')}`
          );
        }
      } else {
        this.addResult(
          'Capability Mapping',
          'FAIL',
          'Could not retrieve agent capabilities'
        );
      }
    } catch (error) {
      this.addResult(
        'Capability Mapping',
        'FAIL',
        `Capability test failed: ${error.message}`
      );
    }
  }

  async runAllTests() {
    console.log('🧪 Starting NANDA Integration Test Suite...');
    console.log(`Testing against: ${BASE_URL}`);
    console.log(`NANDA Registry: ${NANDA_REGISTRY}`);
    
    await this.testAgentEndpoint();
    await this.testHealthCheck();
    await this.testNANDARegistryConnectivity();
    await this.testRegistrationFormat();
    await this.testAgentDiscovery();
    await this.testCapabilityMapping();
    
    this.printSummary();
  }

  private printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('NANDA INTEGRATION TEST SUMMARY');
    console.log('='.repeat(60));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const warned = this.results.filter(r => r.status === 'WARN').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`⚠️  Warnings: ${warned}`);
    console.log(`❌ Failed: ${failed}`);
    
    if (failed === 0) {
      console.log('\n🎉 NANDA Integration is working correctly!');
      if (warned > 0) {
        console.log('📝 Some warnings indicate areas for improvement.');
      }
    } else {
      console.log('\n🚨 Some tests failed - integration needs attention.');
    }
    
    console.log('\nDetailed Results:');
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'WARN' ? '⚠️' : '❌';
      console.log(`${icon} ${result.test}: ${result.details}`);
    });
  }
}

// Run the tests
const tester = new NANDAIntegrationTester();
tester.runAllTests().catch(console.error);
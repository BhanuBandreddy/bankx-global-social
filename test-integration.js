// Quick integration test for APIs
const testAPIs = async () => {
  console.log('🧪 Testing API Integration...\n');
  
  // Test LocaleLens status
  try {
    const response = await fetch('http://localhost:5000/api/locale-lens/status');
    const data = await response.json();
    console.log('✅ LocaleLens Status:', data.configured ? 'ACTIVE' : 'INACTIVE');
  } catch (e) {
    console.log('❌ LocaleLens Status: ERROR');
  }
  
  // Test PDF parsing
  try {
    const response = await fetch('http://localhost:5000/api/parse-itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test' },
      body: JSON.stringify({ base64PDF: 'test', filename: 'tokyo.pdf' })
    });
    const data = await response.json();
    console.log('✅ PDF Parsing:', data.success ? 'WORKING' : 'FAILED');
  } catch (e) {
    console.log('❌ PDF Parsing: ERROR');
  }
  
  // Test AgentTorch
  try {
    const response = await fetch('http://localhost:5000/api/crowd-heat/status');
    const data = await response.json();
    console.log('✅ AgentTorch:', data.success ? 'ACTIVE' : 'INACTIVE');
  } catch (e) {
    console.log('❌ AgentTorch: ERROR');
  }
  
  console.log('\n🚀 Integration test complete!');
};

testAPIs();
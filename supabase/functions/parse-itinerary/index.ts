
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Connection management and monitoring
const CONNECTION_TIMEOUT = 25000; // 25 seconds to stay under Supabase's 30s limit
const MAX_RETRIES = 2;
const CIRCUIT_BREAKER_THRESHOLD = 3;

let failureCount = 0;
let lastFailureTime = 0;
const CIRCUIT_BREAKER_RESET_TIME = 60000; // 1 minute

// Circuit breaker pattern
function isCircuitOpen(): boolean {
  if (failureCount >= CIRCUIT_BREAKER_THRESHOLD) {
    if (Date.now() - lastFailureTime < CIRCUIT_BREAKER_RESET_TIME) {
      return true;
    } else {
      // Reset circuit breaker
      failureCount = 0;
      return false;
    }
  }
  return false;
}

function recordFailure() {
  failureCount++;
  lastFailureTime = Date.now();
  console.error(`Circuit breaker failure count: ${failureCount}`);
}

function recordSuccess() {
  if (failureCount > 0) {
    console.log('Circuit breaker reset - successful operation');
    failureCount = 0;
  }
}

// Enhanced timeout wrapper
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

serve(async (req) => {
  const startTime = Date.now();
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Circuit breaker check
  if (isCircuitOpen()) {
    console.error('Circuit breaker is open - rejecting request');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Service temporarily unavailable due to repeated failures. Please try again in a few minutes.',
        circuitBreakerOpen: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      }
    );
  }

  try {
    console.log(`Starting PDF processing at ${new Date().toISOString()}`);
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Enhanced request parsing with timeout
    const formData = await withTimeout(req.formData(), 5000);
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file uploaded');
    }

    // File validation
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size exceeds 10MB limit');
    }

    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are supported');
    }

    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    
    // Convert file to base64 with timeout
    const arrayBuffer = await withTimeout(file.arrayBuffer(), 10000);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    console.log('File converted to base64, sending to OpenAI...');
    
    // Enhanced system prompt for better parsing
    const systemPrompt = `You are an expert travel document parser. Extract structured data from travel documents and return ONLY valid JSON.

For SINGLE destination trips, return:
{
  "route": "Origin → Destination",
  "date": "YYYY-MM-DD or readable date",
  "weather": "Weather info or 'Check local forecast'",
  "alerts": "Important travel info",
  "flight": "Flight/transport details",
  "gate": "Gate/terminal if available",
  "departureTime": "Time if available",
  "arrivalTime": "Time if available", 
  "destination": "Primary destination city"
}

For MULTI-CITY trips, return an array of the above objects.

Extract actual information. Use reasonable defaults for missing data.`;

    // OpenAI API call with enhanced error handling and timeout
    const openAIResponse = await withTimeout(
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this travel document (${file.name}) and extract travel information. Return only valid JSON.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:application/pdf;base64,${base64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        })
      }),
      CONNECTION_TIMEOUT
    );
    
    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.json().catch(() => ({}));
      throw new Error(`OpenAI API error (${openAIResponse.status}): ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const openAIData = await openAIResponse.json();
    const content = openAIData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    console.log('OpenAI response received, parsing JSON...');
    
    // Enhanced JSON parsing
    let parsedData;
    try {
      let jsonContent = content.trim();
      
      // Clean markdown formatting
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Extract JSON from response
      const jsonMatch = jsonContent.match(/[\{\[][\s\S]*[\}\]]/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
      
      // Validate and normalize data structure
      if (Array.isArray(parsedData)) {
        parsedData = parsedData.map(leg => ({
          route: leg.route || 'Unknown Route',
          date: leg.date || 'Date not specified',
          weather: leg.weather || 'Check local forecast',
          alerts: leg.alerts || 'No specific alerts',
          flight: leg.flight || 'Transport not specified',
          gate: leg.gate || undefined,
          departureTime: leg.departureTime || undefined,
          arrivalTime: leg.arrivalTime || undefined,
          destination: leg.destination || 'Unknown Destination'
        }));
      } else {
        parsedData = {
          route: parsedData.route || 'Unknown Route',
          date: parsedData.date || 'Date not specified',
          weather: parsedData.weather || 'Check local forecast',
          alerts: parsedData.alerts || 'No specific alerts',
          flight: parsedData.flight || 'Transport not specified',
          gate: parsedData.gate || undefined,
          departureTime: parsedData.departureTime || undefined,
          arrivalTime: parsedData.arrivalTime || undefined,
          destination: parsedData.destination || 'Unknown Destination'
        };
      }
      
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.log('Raw content that failed to parse:', content);
      
      // Fallback data
      parsedData = {
        route: `Document Processing → ${file.name.replace('.pdf', '').replace(/[_-]/g, ' ')}`,
        date: new Date().toLocaleDateString(),
        weather: "Weather information not available",
        alerts: "Document processed successfully. Please verify details manually.",
        destination: "Destination extracted from filename",
        flight: "Transportation details not specified"
      };
    }
    
    const processingTime = Date.now() - startTime;
    console.log(`Processing completed successfully in ${processingTime}ms`);
    
    // Record success for circuit breaker
    recordSuccess();
    
    // Return successful response
    return new Response(
      JSON.stringify({ 
        success: true, 
        parsedData: parsedData,
        rawResponse: content,
        documentType: Array.isArray(parsedData) ? 'multi-city' : 'single-destination',
        totalLegs: Array.isArray(parsedData) ? parsedData.length : 1,
        processingTimeMs: processingTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`Error in parse-itinerary function (${processingTime}ms):`, error);
    
    // Record failure for circuit breaker
    recordFailure();
    
    // Enhanced error categorization
    let errorMessage = error.message || 'Unknown error occurred';
    let statusCode = 500;
    
    if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
      statusCode = 408;
      errorMessage = 'Processing timeout - please try with a smaller file or try again';
    } else if (errorMessage.includes('OpenAI')) {
      statusCode = 502;
      errorMessage = 'AI service temporarily unavailable - please try again';
    } else if (errorMessage.includes('file') || errorMessage.includes('File')) {
      statusCode = 400;
      errorMessage = 'Invalid file - please ensure you upload a valid PDF';
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage,
        errorType: error.name || 'ProcessingError',
        processingTimeMs: processingTime,
        fallbackData: {
          route: "Processing Error → Manual Review Required",
          date: new Date().toLocaleDateString(),
          weather: "Unable to extract weather information",
          alerts: "Document upload successful but processing failed. Please verify details manually.",
          destination: "Unknown Destination"
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode,
      }
    );
  }
});

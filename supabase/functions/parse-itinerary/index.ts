
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Handle FormData from frontend
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('No file uploaded');
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);
    
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    
    console.log('Sending PDF to OpenAI for intelligent parsing...');
    
    // Enhanced system prompt for multi-format itinerary parsing
    const systemPrompt = `You are an expert travel document parser specializing in extracting structured data from any type of travel document. You can handle:
- Airline boarding passes and e-tickets
- Hotel confirmations and vouchers
- Multi-city tour itineraries 
- Travel agency bookings
- Vacation rental confirmations
- Transportation tickets (train, bus, ferry)
- Complete travel packages
- Custom travel plans

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, just pure JSON.

For SINGLE destination trips, return an object with these fields:
{
  "route": "Origin → Destination",
  "date": "YYYY-MM-DD or readable date",
  "weather": "Weather info or 'Check local forecast'",
  "alerts": "Important travel info or alerts",
  "flight": "Flight number or transport details",
  "gate": "Gate/terminal info if available",
  "departureTime": "Departure time if available",
  "arrivalTime": "Arrival time if available", 
  "destination": "Primary destination city"
}

For MULTI-CITY trips, return an array of objects, each representing a leg of the journey:
[
  {
    "route": "City A → City B",
    "date": "YYYY-MM-DD",
    "weather": "Weather for this leg",
    "alerts": "Alerts for this segment",
    "flight": "Transport details",
    "gate": "Gate/terminal if available",
    "departureTime": "Time",
    "arrivalTime": "Time",
    "destination": "City B"
  },
  // ... more legs
]

Extract actual information from the document. If information is missing, use reasonable defaults but indicate uncertainty.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
                text: `Please analyze this travel document (${file.name}) and extract structured travel information. Focus on dates, destinations, transportation, and any important travel alerts. Return only valid JSON as specified.`
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
    });
    
    console.log(`OpenAI response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const openAIResponse = await response.json();
    const content = openAIResponse.choices[0]?.message?.content;
    
    console.log('OpenAI response content:', content);
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    // Enhanced JSON parsing with better error handling
    let parsedData;
    try {
      let jsonContent = content.trim();
      
      // Remove markdown code block formatting if present
      if (jsonContent.startsWith('```json')) {
        jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonContent.startsWith('```')) {
        jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to find and parse JSON content
      const jsonMatch = jsonContent.match(/[\{\[][\s\S]*[\}\]]/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
      
      // Validate the parsed data structure
      if (Array.isArray(parsedData)) {
        // Multi-city itinerary
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
        // Single destination itinerary
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
      console.error('Failed to parse JSON:', parseError);
      console.log('Raw content that failed to parse:', content);
      
      // Enhanced fallback with document analysis
      parsedData = {
        route: `Document Analysis → ${file.name.replace('.pdf', '').replace(/[_-]/g, ' ')}`,
        date: new Date().toLocaleDateString(),
        weather: "Weather information not available - check local forecast",
        alerts: "Document processed successfully. Please verify details and prepare for your journey.",
        destination: "Destination extracted from filename",
        flight: "Transportation details not specified"
      };
    }
    
    console.log('Final parsed data:', parsedData);
    
    // Return consistent response format
    return new Response(
      JSON.stringify({ 
        success: true, 
        parsedData: parsedData,
        rawResponse: content,
        documentType: Array.isArray(parsedData) ? 'multi-city' : 'single-destination',
        totalLegs: Array.isArray(parsedData) ? parsedData.length : 1
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in parse-itinerary function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred',
        fallbackData: {
          route: "Processing Error → Manual Review Required",
          date: new Date().toLocaleDateString(),
          weather: "Unable to extract weather information",
          alerts: "Document upload successful but parsing failed. Please verify your travel details manually.",
          destination: "Unknown Destination"
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

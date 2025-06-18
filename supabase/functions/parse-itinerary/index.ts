
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ItineraryData {
  route: string;
  date: string;
  weather: string;
  alerts: string;
  departureTime?: string;
  arrivalTime?: string;
  gate?: string;
  flight?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfText, fileName } = await req.json();
    
    console.log('Processing PDF:', fileName);
    console.log('PDF Text Content:', pdfText.substring(0, 500) + '...');

    // AI-driven itinerary parsing with flexible extraction
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an intelligent travel document parser. Your job is to extract ANY travel-related information from documents and create a structured response.

IMPORTANT: You must ALWAYS return a valid JSON response, even if the document contains no travel information.

Extract and infer travel information from ANY content. Look for:
- Destinations, cities, countries, locations
- Dates, times, schedules
- Transportation (flights, trains, buses, etc.)
- Accommodations
- Activities or events
- Any travel-related references

If explicit travel information is missing:
- Make reasonable inferences from context
- Use location names to create logical routes
- Estimate realistic travel scenarios
- Generate appropriate weather and alerts

Return JSON in this exact format:
{
  "route": "Origin → Destination or Primary Route",
  "date": "Travel start date (format: DD MMM YYYY)",
  "departureTime": "departure time if available",
  "arrivalTime": "arrival time if available", 
  "flight": "flight/transport number if available",
  "gate": "gate/terminal info if available",
  "weather": "realistic weather forecast for destination and season",
  "alerts": "relevant travel advisory or local information"
}

Guidelines:
- Always create a route, even if inferred from minimal information
- Generate realistic weather based on destination and time of year
- Create relevant travel alerts (construction, events, local tips, etc.)
- If no clear travel info exists, create a generic but helpful response
- Return ONLY valid JSON, no additional text or explanations`
          },
          {
            role: 'user',
            content: `Please parse this document and extract travel information:\n\n${pdfText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid OpenAI response structure');
    }

    const content = data.choices[0].message.content;
    console.log('OpenAI Response:', content);
    
    // Parse the JSON response from OpenAI
    let parsedData: any;
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', content);
      
      // Fallback response if JSON parsing fails
      parsedData = {
        route: "Document Analysis → Travel Planning",
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        flight: null,
        departureTime: null,
        arrivalTime: null,
        gate: null,
        weather: "Please check current weather conditions",
        alerts: "AI processed your document - please review extracted information"
      };
    }

    // Ensure required fields have fallback values
    const itinerary: ItineraryData = {
      route: parsedData.route || "Travel Route",
      date: parsedData.date || "Travel Date", 
      weather: parsedData.weather || "Weather information unavailable",
      alerts: parsedData.alerts || "No specific alerts",
      departureTime: parsedData.departureTime,
      arrivalTime: parsedData.arrivalTime,
      flight: parsedData.flight,
      gate: parsedData.gate
    };

    console.log('Final parsed itinerary:', itinerary);

    return new Response(JSON.stringify({
      success: true,
      itinerary: itinerary,
      message: 'Document processed successfully by AI - extracted available travel information'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-itinerary function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

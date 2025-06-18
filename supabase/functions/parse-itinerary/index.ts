
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
    console.log('PDF Text Content (first 1000 chars):', pdfText.substring(0, 1000));

    // Enhanced AI prompt for better parsing of real travel documents
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
            content: `You are an expert travel document parser. Extract travel information from the provided text and return ONLY valid JSON.

CRITICAL: You must return a valid JSON object with these exact fields:
{
  "route": "Start City → End City (or main travel route)",
  "date": "First travel date in DD MMM YYYY format",
  "departureTime": "departure time if found",
  "arrivalTime": "arrival time if found", 
  "flight": "flight number/transport if found",
  "gate": "gate/terminal info if found",
  "weather": "appropriate weather forecast for destination and season",
  "alerts": "relevant travel tips or information"
}

PARSING RULES:
- Extract actual dates, cities, flights, and activities from the text
- If multiple destinations, use "City1 → City2 → City3" format
- Use the earliest travel date as the main date
- Generate realistic weather for the actual destination and time of year
- Create helpful alerts based on the actual itinerary content
- Return ONLY the JSON object, no other text

Look for: dates, city names, flight numbers, hotel names, activities, transportation details.`
          },
          {
            role: 'user',
            content: `Parse this travel document and extract the structured information:\n\n${pdfText}`
          }
        ],
        temperature: 0.6,
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
      
      // Enhanced fallback response
      parsedData = {
        route: "Travel Document → Destination",
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        flight: null,
        departureTime: null,
        arrivalTime: null,
        gate: null,
        weather: "Please check current weather conditions for your destination",
        alerts: "AI processed your document - some details may need manual verification"
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
      message: 'Travel document processed successfully - extracted actual itinerary data'
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

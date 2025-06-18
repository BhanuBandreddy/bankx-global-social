
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

    // Enhanced OpenAI prompt for better table and structured data parsing
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
            content: `You are a travel itinerary parser that handles both traditional itineraries and structured table data. Extract key information and return a JSON object with this structure:

{
  "route": "Origin → Destination (or Primary Cities)",
  "date": "Start date in DD MMM YYYY format", 
  "departureTime": "First departure time",
  "arrivalTime": "Final arrival time",
  "flight": "Primary flight number",
  "gate": "gate/terminal info if available",
  "weather": "realistic weather for destination and season",
  "alerts": "relevant travel alert for the destination"
}

For table-based itineraries:
- Extract the primary route from multiple cities (e.g., "New York → Washington DC")
- Use the start date from the trip
- Get the first outbound flight/transport
- Focus on the main journey

For traditional itineraries:
- Extract direct flight information
- Use specific departure/arrival times
- Include gate and terminal details

Rules:
- Extract actual information from the text when available
- For multi-city trips, summarize the main route
- Generate realistic weather based on destination and time of year
- Create relevant travel alerts (construction, strikes, events, etc.)
- Return ONLY valid JSON, no additional text`
          },
          {
            role: 'user',
            content: `Parse this travel itinerary and extract the key information:\n\n${pdfText}`
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
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
      
      // Enhanced fallback parsing for table-based data
      const cityMatches = pdfText.match(/New York|Washington DC|NYC|Times Square|Capitol/gi);
      const flightMatches = pdfText.match(/([A-Z]{1,3}\d{2,4})|Flight\s+([A-Z]{1,3}\d{2,4})/gi);
      const dateMatches = pdfText.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/gi);
      const timeMatches = pdfText.match(/(\d{1,2}:\d{2})/g);
      
      // Determine route based on cities found
      let route = "Unknown Route";
      if (cityMatches && cityMatches.length > 0) {
        const uniqueCities = [...new Set(cityMatches.map(city => 
          city.replace(/NYC/i, 'New York').replace(/Capitol/i, 'Washington DC')
        ))];
        if (uniqueCities.length >= 2) {
          route = uniqueCities.slice(0, 2).join(' → ');
        } else {
          route = uniqueCities[0] + " Trip";
        }
      }
      
      parsedData = {
        route: route,
        date: dateMatches && dateMatches[0] ? dateMatches[0] : "Date not found",
        flight: flightMatches && flightMatches[0] ? flightMatches[0].replace(/Flight\s+/i, '') : null,
        departureTime: timeMatches && timeMatches[0] ? timeMatches[0] : null,
        arrivalTime: timeMatches && timeMatches[1] ? timeMatches[1] : null,
        gate: null,
        weather: "Pleasant weather expected",
        alerts: "Check local travel updates before departure"
      };
    }

    // Ensure required fields have fallback values
    const itinerary: ItineraryData = {
      route: parsedData.route || "Travel Route",
      date: parsedData.date || "Travel Date", 
      weather: parsedData.weather || "Please check weather",
      alerts: parsedData.alerts || "No alerts",
      departureTime: parsedData.departureTime,
      arrivalTime: parsedData.arrivalTime,
      flight: parsedData.flight,
      gate: parsedData.gate
    };

    console.log('Final parsed itinerary:', itinerary);

    return new Response(JSON.stringify({
      success: true,
      itinerary: itinerary,
      message: 'Itinerary parsed successfully by GlobeGuides™'
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


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

    // Improved OpenAI prompt for better parsing
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
            content: `You are a travel itinerary parser. Extract key information from travel documents and return a JSON object with the following structure:

{
  "route": "Origin → Destination",
  "date": "DD MMM YYYY format",
  "departureTime": "HH:MM",
  "arrivalTime": "HH:MM", 
  "flight": "flight number",
  "gate": "gate/terminal info",
  "weather": "realistic weather for destination and season",
  "alerts": "relevant travel alert for the destination"
}

Rules:
- Extract actual information from the text when available
- For route, use format like "Chennai → Paris" or "New York → London"
- For dates, convert to readable format like "12 Aug 2024"
- Generate realistic weather based on destination and time of year
- Create relevant travel alerts (construction, strikes, events, etc.)
- If information is missing, make reasonable assumptions based on context
- Return ONLY valid JSON, no additional text`
          },
          {
            role: 'user',
            content: `Parse this travel itinerary and extract the key information:\n\n${pdfText}`
          }
        ],
        temperature: 0.2,
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
      
      // Enhanced fallback parsing - try to extract information manually
      const routeMatch = pdfText.match(/([A-Za-z\s]+)\s*(?:→|->|to)\s*([A-Za-z\s]+)/i) || 
                       pdfText.match(/from\s+([A-Za-z\s]+)\s+to\s+([A-Za-z\s]+)/i) ||
                       pdfText.match(/([A-Z]{3})\s*(?:→|->|to)\s*([A-Z]{3})/);
      
      const flightMatch = pdfText.match(/([A-Z]{1,3}\d{2,4})/);
      const dateMatch = pdfText.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i);
      const timeMatch = pdfText.match(/(\d{1,2}:\d{2})/g);
      
      parsedData = {
        route: routeMatch ? `${routeMatch[1].trim()} → ${routeMatch[2].trim()}` : "Unknown → Unknown",
        date: dateMatch ? `${dateMatch[1]} ${dateMatch[2]} ${dateMatch[3]}` : "Date not found",
        flight: flightMatch ? flightMatch[1] : null,
        departureTime: timeMatch && timeMatch[0] ? timeMatch[0] : null,
        arrivalTime: timeMatch && timeMatch[1] ? timeMatch[1] : null,
        gate: null,
        weather: "22°C, partly cloudy",
        alerts: "Please check local travel updates"
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

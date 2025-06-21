
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

    const { pdfBase64, fileName, fileType } = await req.json();
    
    console.log(`Processing PDF: ${fileName}`);
    console.log(`File type: ${fileType}`);
    console.log(`PDF base64 length: ${pdfBase64?.length || 'undefined'}`);
    
    if (!pdfBase64) {
      throw new Error('No PDF data received');
    }
    
    // Send PDF using the correct file format as per OpenAI docs
    console.log('Sending PDF to OpenAI using file format...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'You are an expert travel document parser. Analyze the provided PDF document and extract ONLY the actual travel information shown. Do not make up or assume any information. If certain details are not visible or clear, use "Not specified". Return ONLY a valid JSON object with the extracted information.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this travel document (${fileName}) and extract the actual travel information visible. Return ONLY a JSON object with these fields: route, date, weather, alerts, flight, gate, departureTime, arrivalTime, destination. Use the exact information from the document - do not generate fictional data.`
              },
              {
                type: 'file',
                file: {
                  filename: fileName,
                  file_data: `data:application/pdf;base64,${pdfBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
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
    
    console.log('OpenAI response:', content);
    
    return parseAndReturnItinerary(content, fileName);
    
  } catch (error) {
    console.error('Error in parse-itinerary function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

function parseAndReturnItinerary(content: string, fileName: string) {
  if (!content) {
    throw new Error('No content received from OpenAI');
  }
  
  // Parse JSON from response - handle both plain JSON and markdown code blocks
  let itinerary;
  try {
    let jsonContent = content.trim();
    
    // Remove markdown code block formatting if present
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to find JSON content within the response
    const jsonMatch = jsonContent.match(/[\{\[][\s\S]*[\}\]]/);
    if (jsonMatch) {
      const rawItinerary = JSON.parse(jsonMatch[0]);
      
      // Handle array of itineraries (multi-leg trips) by taking the first one
      const itineraryData = Array.isArray(rawItinerary) ? rawItinerary[0] : rawItinerary;
      
      // Ensure we have the required structure and clean up the data
      itinerary = {
        route: itineraryData.route || `Document: ${fileName}`,
        date: itineraryData.date || new Date().toLocaleDateString(),
        weather: typeof itineraryData.weather === 'object' 
          ? `${itineraryData.weather.departure || 'Not specified'} / ${itineraryData.weather.arrival || 'Not specified'}`
          : itineraryData.weather || "Weather information not available",
        alerts: Array.isArray(itineraryData.alerts) 
          ? itineraryData.alerts.join('; ')
          : itineraryData.alerts || "Document processed successfully",
        flight: typeof itineraryData.flight === 'object'
          ? `${itineraryData.flight.airline || ''} ${itineraryData.flight.number || ''}`.trim()
          : itineraryData.flight || null,
        gate: itineraryData.gate || null,
        departureTime: itineraryData.departureTime || null,
        arrivalTime: itineraryData.arrivalTime || null,
        destination: itineraryData.destination || null
      };
      
      // Remove null values to clean up the response
      Object.keys(itinerary).forEach(key => {
        if (itinerary[key] === null || itinerary[key] === undefined || itinerary[key] === '') {
          delete itinerary[key];
        }
      });
      
    } else {
      console.log('No JSON found in response, creating fallback structure');
      // Create a fallback structure if JSON parsing fails
      itinerary = {
        route: `${fileName} → Processing Complete`,
        date: new Date().toLocaleDateString(),
        weather: "Please check local weather conditions",
        alerts: "Document uploaded and processed - manual review may be needed for detailed information",
        rawContent: content
      };
    }
  } catch (parseError) {
    console.error('Failed to parse JSON:', parseError);
    console.log('Raw content that failed to parse:', content);
    
    // Create a fallback structure if JSON parsing fails
    itinerary = {
      route: `${fileName} → Processing Error`,
      date: new Date().toLocaleDateString(),
      weather: "Weather information not available",
      alerts: "Document uploaded but parsing encountered issues - please verify information manually",
      rawContent: content
    };
  }
  
  console.log('Final itinerary:', itinerary);
  
  return new Response(
    JSON.stringify({ 
      success: true, 
      itinerary,
      rawResponse: content // Include raw response for debugging
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  );
}

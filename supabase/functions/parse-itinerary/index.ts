
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
    
    // Use OpenAI's vision model to actually analyze the PDF content
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
            content: 'You are an expert travel document parser. Analyze the provided PDF image and extract ONLY the actual travel information shown in the document. Do not make up or assume any information. If certain details are not visible or clear, use "Not specified" or leave empty. Return ONLY a valid JSON object with the extracted information.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this travel PDF document (${fileName}) and extract the actual travel information visible in the document. Return ONLY a JSON object with these fields: route, date, weather, alerts, flight, gate, departureTime, arrivalTime, destination. Use the exact information from the document - do not generate fictional data.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:application/pdf;base64,${pdfBase64}`,
                  detail: 'high'
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
      
      // Fallback to text-based parsing if vision fails
      console.log('Vision API failed, attempting text-based parsing...');
      
      const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: 'You are an expert at parsing travel documents. The user will provide a base64 encoded PDF. Extract real travel information and return ONLY valid JSON. Do not generate fictional data.'
            },
            {
              role: 'user',
              content: `Parse this travel PDF and extract actual information. Base64 data: ${pdfBase64.substring(0, 2000)}... Return JSON with: route, date, weather, alerts, flight, gate, departureTime, arrivalTime, destination. Use "Not specified" for missing info.`
            }
          ],
          max_tokens: 1500,
          temperature: 0.1
        })
      });
      
      if (!textResponse.ok) {
        throw new Error(`Both vision and text parsing failed: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const textData = await textResponse.json();
      const content = textData.choices[0]?.message?.content;
      console.log('Text-based parsing response:', content);
      
      return parseAndReturnItinerary(content, fileName);
    }
    
    const openAIResponse = await response.json();
    const content = openAIResponse.choices[0]?.message?.content;
    
    console.log('Vision-based parsing response:', content);
    
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
  
  // Parse JSON from response
  let itinerary;
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const rawItinerary = JSON.parse(jsonMatch[0]);
      
      // Ensure we have the required structure and clean up the data
      itinerary = {
        route: rawItinerary.route || `Document: ${fileName}`,
        date: rawItinerary.date || new Date().toLocaleDateString(),
        weather: typeof rawItinerary.weather === 'object' 
          ? `${rawItinerary.weather.departure || 'Not specified'} / ${rawItinerary.weather.arrival || 'Not specified'}`
          : rawItinerary.weather || "Weather information not available",
        alerts: Array.isArray(rawItinerary.alerts) 
          ? rawItinerary.alerts.join('; ')
          : rawItinerary.alerts || "Document processed successfully",
        flight: typeof rawItinerary.flight === 'object'
          ? `${rawItinerary.flight.airline || ''} ${rawItinerary.flight.number || ''}`.trim()
          : rawItinerary.flight || null,
        gate: rawItinerary.gate || null,
        departureTime: rawItinerary.departureTime || null,
        arrivalTime: rawItinerary.arrivalTime || null,
        destination: rawItinerary.destination || null
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

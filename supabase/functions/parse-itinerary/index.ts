
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    const { imageBase64, fileName, fileType, userId } = await req.json();
    
    console.log(`Processing image: ${fileName}`);
    console.log(`File type: ${fileType}`);
    console.log(`User ID: ${userId}`);
    console.log(`Image base64 length: ${imageBase64?.length || 'undefined'}`);
    
    if (!imageBase64) {
      throw new Error('No image data received');
    }
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Use OpenAI's vision model to analyze the image
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
            content: 'You are an expert travel document parser. Analyze the provided travel document image and extract ONLY the actual travel information shown. Do not make up or assume any information. If certain details are not visible or clear, use "Not specified". Return ONLY a valid JSON object with the extracted information.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this travel document image (${fileName}) and extract the actual travel information visible. Return ONLY a JSON object with these fields: route, date, weather, alerts, flight, gate, departureTime, arrivalTime, destination. Use the exact information from the document - do not generate fictional data.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${fileType};base64,${imageBase64}`,
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
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const openAIResponse = await response.json();
    const content = openAIResponse.choices[0]?.message?.content;
    
    console.log('OpenAI Vision response:', content);
    
    return await parseAndStoreItinerary(content, fileName, fileType, userId);
    
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

async function parseAndStoreItinerary(content: string, fileName: string, fileType: string, userId: string) {
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
      date: new Date().toLocaleDateValue(),
      weather: "Weather information not available",
      alerts: "Document uploaded but parsing encountered issues - please verify information manually",
      rawContent: content
    };
  }
  
  console.log('Final itinerary:', itinerary);
  
  // Store the parsed itinerary in the database
  try {
    const { data: savedItinerary, error: dbError } = await supabase
      .from('parsed_itineraries')
      .insert({
        user_id: userId,
        file_name: fileName,
        file_type: fileType,
        parsed_data: itinerary,
        raw_response: content
      })
      .select()
      .single();
    
    if (dbError) {
      console.error('Database error:', dbError);
      // Still return success for the parsing, but log the database error
    } else {
      console.log('Saved itinerary to database:', savedItinerary.id);
    }
  } catch (dbError) {
    console.error('Failed to save to database:', dbError);
    // Continue with response even if database save fails
  }
  
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

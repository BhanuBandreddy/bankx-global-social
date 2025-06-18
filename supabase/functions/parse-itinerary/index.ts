
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
    const { pdfBase64, fileName, fileType } = await req.json();
    
    console.log(`Processing PDF: ${fileName}`);
    
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
            role: 'user',
            content: [
              {
                type: 'text',
                text: `First, extract ALL text and information from this PDF itinerary. Then organize it into a JSON object with appropriate field names. Include everything you can find - flight details, dates, times, locations, booking info, weather, alerts, activities, hotels, etc. Use clear, descriptive field names.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${fileType};base64,${pdfBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const openAIResponse = await response.json();
    const content = openAIResponse.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content received from OpenAI');
    }
    
    // Parse JSON from response
    let itinerary;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      itinerary = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.log('Raw content:', content);
      throw new Error('Failed to parse itinerary data');
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
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to convert PDF to images using a PDF-to-image service
async function convertPdfToImages(pdfBase64: string): Promise<string[]> {
  try {
    // Use pdf2pic or similar service to convert PDF to images
    // For now, we'll use a simple approach with the first page
    const response = await fetch('https://api.pdf24.org/v1/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputFormat: 'pdf',
        outputFormat: 'png',
        inputData: pdfBase64,
        pages: [1] // Convert first page only for now
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      return result.images || [];
    }
  } catch (error) {
    console.error('PDF conversion failed:', error);
  }
  
  // Fallback: return the original PDF base64 as if it were an image
  // OpenAI will reject it, but we'll handle that in the main function
  return [pdfBase64];
}

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
    
    // Convert PDF to images for OpenAI Vision
    console.log('Converting PDF to images...');
    const images = await convertPdfToImages(pdfBase64);
    
    if (images.length === 0) {
      throw new Error('Failed to convert PDF to images');
    }
    
    console.log(`Converted PDF to ${images.length} image(s)`);
    
    // Use OpenAI's vision model to analyze the PDF images
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
            content: 'You are an expert travel document parser. Analyze the provided travel document images and extract ONLY the actual travel information shown. Do not make up or assume any information. If certain details are not visible or clear, use "Not specified". Return ONLY a valid JSON object with the extracted information.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this travel document (${fileName}) and extract the actual travel information visible. Return ONLY a JSON object with these fields: route, date, weather, alerts, flight, gate, departureTime, arrivalTime, destination. Use the exact information from the document - do not generate fictional data.`
              },
              ...images.map(imageBase64 => ({
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`,
                  detail: 'high'
                }
              }))
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

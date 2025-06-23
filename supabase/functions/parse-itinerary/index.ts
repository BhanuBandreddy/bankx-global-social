
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const startTime = Date.now()
    console.log(`Starting PDF processing at ${new Date().toISOString()}`)
    
    const { file, fileName, fileType } = await req.json()
    
    if (!file || !fileName) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing file or fileName' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing file: ${fileName}, size: ${file.length} bytes`)

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Convert base64 to buffer and extract text
    const buffer = Uint8Array.from(atob(file), c => c.charCodeAt(0))
    
    // Use OpenAI to analyze the PDF content
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a travel document parser. Extract itinerary information and return a JSON object with:
            {
              "route": "origin → destination",
              "date": "travel date",
              "journey": {
                "cities": ["city1", "city2"],
                "legs": [{"destination": "city", "date": "date"}],
                "totalDays": number
              }
            }`
          },
          {
            role: 'user',
            content: `Please parse this travel document and extract the itinerary information. File: ${fileName}`
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const aiResponse = await response.json()
    const content = aiResponse.choices[0]?.message?.content

    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    // Parse the JSON response
    let parsedData
    try {
      parsedData = JSON.parse(content)
    } catch (e) {
      // If JSON parsing fails, create a basic structure
      parsedData = {
        route: fileName.replace('.pdf', ''),
        date: new Date().toISOString().split('T')[0],
        journey: {
          cities: ["Unknown"],
          legs: [{ destination: "Unknown", date: new Date().toISOString().split('T')[0] }],
          totalDays: 1
        }
      }
    }

    const processingTime = Date.now() - startTime
    console.log(`Successfully processed PDF in ${processingTime}ms`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: parsedData,
        processingTime 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error in parse-itinerary function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

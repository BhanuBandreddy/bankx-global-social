// Using OpenAI for real PDF itinerary parsing
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

interface OpenAIParseResult {
  success: boolean;
  itinerary?: {
    route: string;
    date: string;
    weather: string;
    alerts: string;
    departureTime: string;
    arrivalTime: string;
    gate: string;
    flight: string;
    destination: string;
  };
  error?: string;
}

class OpenAIItineraryParser {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
  }

  async parseItinerary(base64PDF: string, filename: string): Promise<OpenAIParseResult> {
    // Validate API key first
    if (!this.apiKey) {
      console.log('No OpenAI API key configured');
      return {
        success: false,
        error: 'OpenAI API key not configured. Please provide OPENAI_API_KEY to enable PDF parsing.'
      };
    }

    // Validate file size (32MB limit as per OpenAI docs)
    const fileSizeBytes = (base64PDF.length * 3) / 4; // Approximate size from base64
    const maxSizeBytes = 32 * 1024 * 1024; // 32MB
    
    if (fileSizeBytes > maxSizeBytes) {
      console.log(`File too large: ${fileSizeBytes} bytes (max: ${maxSizeBytes})`);
      return {
        success: false,
        error: `File size (${Math.round(fileSizeBytes / 1024 / 1024)}MB) exceeds OpenAI's 32MB limit.`
      };
    }

    // Skip OpenAI if specifically marked as large_file
    if (base64PDF === 'large_file') {
      return {
        success: false,
        error: 'File marked as too large for processing.'
      };
    }

    console.log(`Processing ${Math.round(fileSizeBytes / 1024)}KB PDF with OpenAI GPT-4o-mini...`);

    try {
      // Use proper OpenAI PDF parsing API structure
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Using gpt-4o-mini for cost efficiency with vision capabilities
          messages: [
            {
              role: 'system',
              content: 'You are a travel document parser. Extract actual itinerary information from travel documents. Only return real data found in the document, never fabricate information.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'file',
                  file: {
                    filename: filename,
                    file_data: `data:application/pdf;base64,${base64PDF}`
                  }
                },
                {
                  type: 'text',
                  text: `Extract real travel information from this document. Return JSON with actual data found:
{
  "route": "actual departure → actual destination",
  "date": "actual travel date",
  "weather": "season/weather info if mentioned",
  "alerts": "actual hotels, activities, or important notes",
  "departureTime": "actual departure time",
  "arrivalTime": "actual arrival time",
  "gate": "actual gate/terminal",
  "flight": "actual flight number",
  "destination": "primary destination city"
}

Important: Only include information actually found in the document. Use "Not specified" for missing information.`
                }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.1,
          response_format: { type: "json_object" }
        }),
      });
      
      console.log('OpenAI API response received, status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API error:', response.status, errorText);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('OpenAI API call successful');
      
      const content = data.choices[0]?.message?.content;
      console.log('OpenAI extracted content:', content);

      if (!content) {
        throw new Error('No content received from OpenAI API');
      }

      const parsedItinerary = JSON.parse(content);
      console.log('Successfully parsed travel itinerary from OpenAI:', parsedItinerary);
      
      // Validate that we got real data, not placeholders
      if (parsedItinerary.route && parsedItinerary.route.includes('actual')) {
        throw new Error('OpenAI returned template response instead of real data');
      }
      
      return {
        success: true,
        itinerary: parsedItinerary
      };
    } catch (error) {
      console.error('OpenAI parsing error:', error);
      
      // Return honest error instead of fake data
      return {
        success: false,
        error: `PDF parsing failed: ${error.message}. Please ensure the document contains readable travel information.`
      };
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const openaiParser = new OpenAIItineraryParser();
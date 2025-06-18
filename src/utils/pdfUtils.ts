
// Enhanced PDF text extraction utility
export const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // For demo purposes, we'll simulate PDF text extraction
        // In a real implementation, you'd use a library like pdf-parse or pdf2pic
        
        // More comprehensive mock extracted text based on file name patterns
        let mockItineraryText = '';
        
        if (file.name.toLowerCase().includes('travel') || file.name.toLowerCase().includes('itinerary')) {
          mockItineraryText = `
TRAVEL ITINERARY - ${file.name}
Passenger: John Doe
Booking Reference: ABC123

OUTBOUND FLIGHT
Date: 12 August 2024
Flight: AF271 (Air France)
Route: Chennai (MAA) → Paris (CDG)
Departure: 02:30 (Local Time)
Arrival: 08:45 (Local Time)
Terminal: Terminal 2E
Gate: F22

ACCOMMODATION
Hotel: Paris Central Hotel
Address: 123 Rue de Rivoli, Paris
Check-in: 12 August 2024
Check-out: 18 August 2024

RETURN FLIGHT
Date: 18 August 2024
Flight: AF272 (Air France)
Route: Paris (CDG) → Chennai (MAA)
Departure: 14:30 (Local Time)
Arrival: 01:45+1 (Local Time)

Additional Information:
- Travel insurance included
- Baggage allowance: 23kg checked, 8kg carry-on
- Seat selection: 12A (outbound), 15F (return)
- Special meal: Vegetarian
`;
        } else {
          // Generic travel document
          mockItineraryText = `
BOOKING CONFIRMATION
Reference: ${Math.random().toString(36).substr(2, 9).toUpperCase()}

Flight Details:
From: New York JFK
To: London Heathrow
Date: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { 
  day: 'numeric', 
  month: 'long', 
  year: 'numeric' 
})}
Flight: BA178
Departure: 21:20
Arrival: 08:05+1
Terminal: Terminal 5

Passenger: Travel Guest
Seat: 14C
Class: Economy
`;
        }
        
        console.log('Extracted PDF text:', mockItineraryText);
        resolve(mockItineraryText);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsArrayBuffer(file);
  });
};

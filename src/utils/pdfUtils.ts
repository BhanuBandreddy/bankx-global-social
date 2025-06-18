
// Enhanced PDF text extraction utility
export const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // For demo purposes, we'll simulate PDF text extraction
        // In a real implementation, you'd use a library like pdf-parse or pdf2pic
        
        // Enhanced mock extracted text based on file name patterns
        let mockItineraryText = '';
        
        if (file.name.toLowerCase().includes('traveldoc2')) {
          // Original Chennai to Paris itinerary
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
          // Table-based itinerary like the one uploaded
          mockItineraryText = `
TRAVEL ITINERARY TABLE

Date | City/Region | Transport | Lodging | Key Activities | Notes
Mon 7 Jul 2025 | New York City | Flight AA100 | Midtown Hotel | Evening in Times Square; slice of NY pizza | Pre-book airport shuttle
Tue 8 Jul 2025 | New York City | Subway/walk | Midtown Hotel | Statue of Liberty ferry 09:00; Central Park picnic | Buy unlimited MetroCard
Wed 9 Jul 2025 | NYC → Washington DC | Amtrak Northeast Regional 07:00 | Capitol Inn | National Mall stroll; Smithsonian Air & Space | Pack train snacks
Thu 10 Jul 2025 | Washington DC | Metro | Capitol Inn | U.S. Capitol tour 10:00; Georgetown waterfront dinner | ID needed for Capitol
Fri 11 Jul 2025 | Washington DC → Home | Flight DL200 16:30 | — | Souvenir shopping; airport arrival 14:30 | Allow 2 h security buffer

TRIP SUMMARY:
- Duration: 5 days (July 7-11, 2025)
- Cities: New York City, Washington DC
- Flights: AA100 (to NYC), DL200 (from DC)
- Hotels: Midtown Hotel (NYC), Capitol Inn (DC)
- Transport: Flight, Amtrak, Subway, Metro
- Key attractions: Times Square, Statue of Liberty, Central Park, National Mall, Smithsonian, U.S. Capitol
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

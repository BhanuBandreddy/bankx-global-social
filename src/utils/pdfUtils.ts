
// Simple PDF text extraction utility
export const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        
        // For demo purposes, we'll simulate PDF text extraction
        // In a real implementation, you'd use a library like pdf-parse or pdf2pic
        
        // Mock extracted text based on file name or size
        const mockItineraryText = `
TRAVEL ITINERARY
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
`;
        
        resolve(mockItineraryText);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read PDF file'));
    reader.readAsArrayBuffer(file);
  });
};

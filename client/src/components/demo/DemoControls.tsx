
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DemoControlsProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  onReset: () => void;
  itinerary: any;
  selectedProduct: any;
  escrowTransactionId: string;
}

export const DemoControls = ({
  currentStep,
  onStepChange,
  onReset,
  itinerary,
  selectedProduct,
  escrowTransactionId
}: DemoControlsProps) => {
  return (
    <Card className="border-4 border-black">
      <CardHeader className="bg-gray-100 border-b-4 border-black">
        <CardTitle>Demo Controls</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex space-x-4">
          <Button 
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            variant="outline"
            className="border-4 border-black"
          >
            Previous Step
          </Button>
          <Button 
            onClick={() => onStepChange(Math.min(3, currentStep + 1))}
            disabled={currentStep === 3}
            className="bg-black text-white border-4 border-black hover:bg-gray-800"
          >
            Next Step
          </Button>
          <Button 
            onClick={onReset}
            variant="outline"
            className="border-4 border-red-500 text-red-500 hover:bg-red-50"
          >
            Reset Demo
          </Button>
        </div>
        
        {/* Debug Info */}
        <div className="mt-4 p-3 bg-gray-50 border rounded text-xs">
          <div><strong>Current Step:</strong> {currentStep}</div>
          <div><strong>Has Itinerary:</strong> {itinerary ? 'Yes' : 'No'}</div>
          <div><strong>Selected Product:</strong> {selectedProduct ? 'Yes' : 'No'}</div>
          <div><strong>Escrow ID:</strong> {escrowTransactionId || 'None'}</div>
        </div>
      </CardContent>
    </Card>
  );
};

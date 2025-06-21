
import { Upload, MapPin, CreditCard, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Step {
  id: string;
  name: string;
  agent: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DemoProgressHeaderProps {
  currentStep: number;
}

const steps: Step[] = [
  { id: 'upload', name: 'Upload Itinerary', agent: 'GlobeGuides™ Concierge', icon: Upload },
  { id: 'discover', name: 'Local Discovery', agent: 'LocaleLens AI', icon: MapPin },
  { id: 'payment', name: 'Secure Payment', agent: 'TrustPay Orchestrator', icon: CreditCard },
  { id: 'logistics', name: 'Peer Logistics', agent: 'PathSync Social Logistics', icon: Users },
];

export const DemoProgressHeader = ({ currentStep }: DemoProgressHeaderProps) => {
  return (
    <Card className="border-4 border-black">
      <CardHeader className="bg-lime-400 border-b-4 border-black">
        <CardTitle className="text-2xl font-bold text-black uppercase">
          Global Socials Demo Flow
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center space-y-2 ${
                  index <= currentStep ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className={`w-12 h-12 border-4 border-black flex items-center justify-center ${
                  index === currentStep ? 'bg-lime-400' : 
                  index < currentStep ? 'bg-green-300' : 'bg-gray-100'
                }`}>
                  <IconComponent className="w-6 h-6 text-black" />
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">{step.name}</div>
                  <div className="text-xs text-gray-600">{step.agent}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

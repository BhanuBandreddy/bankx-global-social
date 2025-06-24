
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, MessageSquare, Clock, Star, Truck, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LogisticsOption {
  id: string;
  type: 'traveler' | 'merchant' | 'local_pickup';
  name: string;
  trustScore: number;
  route?: string;
  arrivalDate?: string;
  pickupWindow?: string;
  distance?: string;
  deliveryTime: string;
  fee: string;
  avatar: string;
  badges: string[];
  lastSeen: string;
}

interface PathSyncLogisticsProps {
  escrowTransactionId: string;
  userItinerary?: {
    route: string;
    date: string;
    isActive: boolean;
  };
  productLocation: string;
}

export const PathSyncLogistics = ({ escrowTransactionId, userItinerary, productLocation }: PathSyncLogisticsProps) => {
  const [logisticsOptions, setLogisticsOptions] = useState<LogisticsOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<LogisticsOption | null>(null);
  const [chatOpen, setChatOpen] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate finding logistics options based on user travel status
    setTimeout(() => {
      const mockOptions: LogisticsOption[] = userItinerary?.isActive ? [
        // Traveling user options - merchant collaboration
        {
          id: 'merchant_1',
          type: 'merchant',
          name: 'Local Artisan Co-op',
          trustScore: 98,
          pickupWindow: 'Tomorrow 10-6 PM',
          distance: '2.3 km from your route',
          deliveryTime: 'Same day pickup',
          fee: 'Free (direct pickup)',
          avatar: '🏪',
          badges: ['Verified Merchant', 'Same-Day Ready'],
          lastSeen: 'Active now'
        },
        {
          id: 'traveler_1',
          type: 'traveler',
          name: 'Sarah Chen',
          trustScore: 94,
          route: `${productLocation} → Paris`,
          arrivalDate: 'Dec 20, 2024',
          deliveryTime: '3-4 days',
          fee: '€8',
          avatar: '👩‍💼',
          badges: ['Frequent Traveler', 'Electronics Specialist'],
          lastSeen: '2 hrs ago'
        }
      ] : [
        // Stationary user options - find incoming travelers
        {
          id: 'traveler_2',
          type: 'traveler',
          name: 'Marco Rodriguez',
          trustScore: 96,
          route: `${productLocation} → Your City`,
          arrivalDate: 'Dec 18, 2024',
          deliveryTime: '2-3 days',
          fee: '€12',
          avatar: '👨‍🎓',
          badges: ['Trust Champion', 'Express Delivery'],
          lastSeen: '1 hr ago'
        },
        {
          id: 'local_1',
          type: 'local_pickup',
          name: 'Community Hub Pickup',
          trustScore: 92,
          distance: '5.2 km from you',
          deliveryTime: '5-7 days',
          fee: '€15',
          avatar: '📦',
          badges: ['Secure Storage', 'Weekend Hours'],
          lastSeen: 'Always available'
        }
      ];

      setLogisticsOptions(mockOptions);
      setIsLoading(false);
    }, 2000);
  }, [userItinerary, productLocation]);

  const handleSelectOption = (option: LogisticsOption) => {
    setSelectedOption(option);
    toast({
      title: "🤝 Logistics Partner Selected",
      description: `Connected with ${option.name}. Escrow remains secure until delivery confirmation.`,
    });
  };

  const handleStartChat = (optionId: string) => {
    setChatOpen(optionId);
    toast({
      title: "💬 Chat Started",
      description: "Real-time coordination enabled with your logistics partner.",
    });
  };

  const getTrustBadgeColor = (score: number) => {
    if (score >= 95) return "bg-green-500";
    if (score >= 90) return "bg-blue-500";
    return "bg-yellow-500";
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'traveler': return <Users className="w-4 h-4" />;
      case 'merchant': return <MapPin className="w-4 h-4" />;
      case 'local_pickup': return <Truck className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-4 border-black">
      <CardHeader className="bg-orange-100 border-b-4 border-black">
        <CardTitle className="flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <span>Step 4: PathSync Social Logistics</span>
        </CardTitle>
        <div className="text-sm text-gray-600">
          {userItinerary?.isActive 
            ? `🛫 Traveling: ${userItinerary.route} on ${userItinerary.date}`
            : "🏠 Finding travelers coming to your location"
          }
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Escrow Status */}
        <div className="bg-green-50 border-4 border-green-300 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-bold text-green-800">Escrow Protection Active</h4>
          </div>
          <p className="text-sm text-green-700">
            Transaction ID: {escrowTransactionId}<br/>
            Funds secured until delivery confirmation • Auto-release in 7 days
          </p>
        </div>

        {/* Travel Status Detection */}
        <div className="bg-blue-50 border-4 border-blue-200 p-4">
          <h4 className="font-bold text-blue-800 mb-2">
            {userItinerary?.isActive ? "🌍 Active Traveler Mode" : "🏠 Local Recipient Mode"}
          </h4>
          <p className="text-sm text-blue-700">
            {userItinerary?.isActive 
              ? "We've found merchants and fellow travelers along your route for optimal pickup options."
              : "Connecting you with trusted travelers coming from your desired destination."
            }
          </p>
        </div>

        {/* Logistics Options */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            <span className="ml-3">Finding optimal logistics partners...</span>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-bold text-black">🤝 Available Logistics Partners</h4>
            {logisticsOptions.map((option) => (
              <div key={option.id} className={`border-4 p-4 transition-all ${
                selectedOption?.id === option.id 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 bg-white hover:border-black'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{option.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getTypeIcon(option.type)}
                        <h5 className="font-bold">{option.name}</h5>
                        <Badge className={`${getTrustBadgeColor(option.trustScore)} text-white`}>
                          <Star className="w-3 h-3 mr-1" />
                          {option.trustScore}
                        </Badge>
                      </div>
                      
                      {option.route && (
                        <div className="text-sm text-gray-600 mb-1">
                          📍 {option.route}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {option.badges.map((badge, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {badge}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Delivery:</strong> {option.deliveryTime}</div>
                        <div><strong>Fee:</strong> {option.fee}</div>
                        {option.distance && <div><strong>Distance:</strong> {option.distance}</div>}
                        {option.arrivalDate && <div><strong>Arrival:</strong> {option.arrivalDate}</div>}
                        {option.pickupWindow && <div><strong>Pickup:</strong> {option.pickupWindow}</div>}
                        <div className="text-gray-500">Last seen: {option.lastSeen}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    {selectedOption?.id !== option.id ? (
                      <Button
                        onClick={() => handleSelectOption(option)}
                        className="bg-orange-500 text-white border-2 border-orange-700 hover:bg-orange-600"
                        size="sm"
                      >
                        Select
                      </Button>
                    ) : (
                      <Badge className="bg-green-500 text-white">Selected</Badge>
                    )}
                    
                    <Button
                      onClick={() => handleStartChat(option.id)}
                      variant="outline"
                      className="border-2 border-black"
                      size="sm"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                  </div>
                </div>

                {/* Chat Interface */}
                {chatOpen === option.id && (
                  <div className="mt-4 border-t-2 border-gray-200 pt-4">
                    <div className="bg-gray-50 border-2 border-gray-300 p-3 h-32 overflow-y-auto mb-2">
                      <div className="text-sm space-y-2">
                        <div className="bg-blue-100 p-2 rounded max-w-xs">
                          <strong>{option.name}:</strong> Hi! I can help with your delivery. When works best for pickup?
                        </div>
                        <div className="bg-gray-100 p-2 rounded max-w-xs ml-auto">
                          <strong>You:</strong> Perfect! What's your availability tomorrow?
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        placeholder="Type your message..."
                        className="flex-1 border-2 border-gray-300 p-2 text-sm"
                      />
                      <Button size="sm" className="bg-blue-500 text-white">Send</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {selectedOption && (
          <div className="bg-yellow-50 border-4 border-yellow-200 p-4">
            <h4 className="font-bold text-yellow-800 mb-2">🚀 Next Steps</h4>
            <div className="space-y-2 text-sm text-yellow-700 mb-4">
              <div>✅ Logistics partner selected: {selectedOption.name}</div>
              <div>✅ Escrow protection active until delivery</div>
              <div>🔄 Coordinate pickup/delivery details via chat</div>
              <div>📱 GPS tracking will be enabled once shipment starts</div>
            </div>
            
            <div className="flex space-x-3">
              <Button 
                className="bg-green-500 text-white border-4 border-green-700"
                onClick={() => {
                  toast({
                    title: "🎉 Logistics Activated!",
                    description: `${selectedOption.name} will coordinate your delivery. Escrow remains secure until confirmed.`
                  });
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Logistics Plan
              </Button>
              
              <Button 
                variant="outline" 
                className="border-4 border-black"
                onClick={() => setSelectedOption(null)}
              >
                Change Selection
              </Button>
            </div>
          </div>
        )}

        {/* Social Trust Network */}
        <div className="bg-purple-50 border-4 border-purple-200 p-4">
          <h4 className="font-bold text-purple-800 mb-3">🌐 Global Socials Trust Network</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div><strong>Trust Score Impact:</strong></div>
              <div>• Successful delivery: +25 points</div>
              <div>• Peer collaboration: +15 points</div>
              <div>• Merchant partnership: +10 points</div>
            </div>
            <div className="space-y-1">
              <div><strong>Network Effects:</strong></div>
              <div>• {logisticsOptions.length} partners available</div>
              <div>• Average trust score: {Math.round(logisticsOptions.reduce((acc, opt) => acc + opt.trustScore, 0) / logisticsOptions.length)}</div>
              <div>• Community success rate: 96.8%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

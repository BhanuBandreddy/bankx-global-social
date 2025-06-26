import { useState } from "react";
import { X, CreditCard, Truck, Users, Shield, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as Dialog from "@radix-ui/react-dialog";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: string;
  currency: string;
  trustGuarantee: boolean;
}

interface User {
  id: string;
  name: string;
  trustScore: number;
  level: string;
  location: string;
}

interface FeedPost {
  id: string;
  userId: string;
  content: string;
  imageUrl: string;
  location: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  trustBoosts: number;
  aiInsight: string;
  trustInsight: string;
  createdAt: string;
  user: User;
  product: Product;
}

interface DeliveryOption {
  type: 'instore' | 'merchant-ship' | 'peer-delivery';
  label: string;
  description: string;
  available: boolean;
  travelers?: TravelerOption[];
}

interface TravelerOption {
  id: string;
  name: string;
  trustScore: number;
  route: string;
  arrivalDate: string;
  fee: string;
  avatar: string;
  badges: string[];
}

interface InlinePurchaseFlowProps {
  post: FeedPost;
  isOpen: boolean;
  onClose: () => void;
}

export const InlinePurchaseFlow = ({ post, isOpen, onClose }: InlinePurchaseFlowProps) => {
  const [currentStep, setCurrentStep] = useState<'delivery' | 'payment' | 'confirmation'>('delivery');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryOption | null>(null);
  const [selectedTraveler, setSelectedTraveler] = useState<TravelerOption | null>(null);
  const [escrowTransactionId, setEscrowTransactionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const deliveryOptions: DeliveryOption[] = [
    {
      type: 'instore',
      label: 'In-Store Pickup',
      description: 'Collect directly from merchant',
      available: true,
    },
    {
      type: 'merchant-ship',
      label: 'Merchant Shipping',
      description: 'Direct shipping from seller',
      available: true,
    },
    {
      type: 'peer-delivery',
      label: 'Peer Delivery',
      description: 'Delivered by verified travelers',
      available: true,
      travelers: [
        {
          id: '1',
          name: 'Maria Santos',
          trustScore: 4.9,
          route: `${post.location} → Your Location`,
          arrivalDate: 'Dec 28',
          fee: '$8',
          avatar: 'MS',
          badges: ['Verified Traveler', 'Level 7'],
        },
        {
          id: '2',
          name: 'Kenji Tanaka',
          trustScore: 4.8,
          route: `${post.location} → Your Location`,
          arrivalDate: 'Dec 30',
          fee: '$12',
          avatar: 'KT',
          badges: ['Gold Member', 'Level 5'],
        },
      ],
    },
  ];

  const handleDeliverySelect = (option: DeliveryOption) => {
    setSelectedDelivery(option);
    if (option.type !== 'peer-delivery') {
      setCurrentStep('payment');
    }
  };

  const handleTravelerSelect = (traveler: TravelerOption) => {
    setSelectedTraveler(traveler);
    setCurrentStep('payment');
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await apiClient.initiateEscrow({
        productId: post.product.id,
        amount: parseFloat(post.product.price),
        currency: post.product.currency,
        sellerId: post.userId,
        deliveryOption: selectedDelivery?.type || 'instore',
      });

      setEscrowTransactionId(response.transaction.id);
      setCurrentStep('confirmation');
      
      toast({
        title: "Payment Secured",
        description: "Your payment is held safely in escrow until delivery",
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderDeliveryStep = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-black mb-2">Choose Delivery Method</h3>
        <p className="text-gray-600">How would you like to receive your {post.product.name}?</p>
      </div>

      <div className="space-y-3">
        {deliveryOptions.map((option) => (
          <div key={option.type} className="space-y-2">
            <button
              onClick={() => handleDeliverySelect(option)}
              className="w-full p-4 border-2 border-black bg-white hover:bg-gray-50 text-left rounded-none font-medium shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-black">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
                <div className="flex items-center space-x-2">
                  {option.type === 'peer-delivery' && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-300">
                      {option.travelers?.length} Available
                    </Badge>
                  )}
                  {option.available ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 border-gray-300">
                      Unavailable
                    </Badge>
                  )}
                </div>
              </div>
            </button>

            {/* Show travelers for peer delivery */}
            {selectedDelivery?.type === 'peer-delivery' && option.type === 'peer-delivery' && (
              <div className="ml-4 space-y-2 border-l-4 border-orange-400 pl-4">
                <h4 className="font-bold text-black">Available Travelers</h4>
                {option.travelers?.map((traveler) => (
                  <button
                    key={traveler.id}
                    onClick={() => handleTravelerSelect(traveler)}
                    className="w-full p-3 border border-gray-300 bg-orange-50 hover:bg-orange-100 text-left rounded-none shadow-[1px_1px_0px_0px_#000] hover:shadow-[2px_2px_0px_0px_#000] transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-orange-400 border-2 border-black flex items-center justify-center font-bold text-black text-sm">
                          {traveler.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-black">{traveler.name}</div>
                          <div className="text-sm text-gray-600">{traveler.route}</div>
                          <div className="flex space-x-1 mt-1">
                            {traveler.badges.map((badge) => (
                              <Badge key={badge} variant="outline" className="text-xs">
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-black">{traveler.fee}</div>
                        <div className="text-sm text-gray-600">Arrives {traveler.arrivalDate}</div>
                        <div className="text-sm text-orange-600">★ {traveler.trustScore}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-black mb-2">Secure Payment</h3>
        <p className="text-gray-600">Your payment is protected by Trust Oracle escrow</p>
      </div>

      {/* Order Summary */}
      <div className="border-2 border-black bg-gray-50 p-4">
        <h4 className="font-bold text-black mb-3">Order Summary</h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>{post.product.name}</span>
            <span className="font-bold">${post.product.price}</span>
          </div>
          {selectedTraveler && (
            <div className="flex justify-between">
              <span>Delivery by {selectedTraveler.name}</span>
              <span className="font-bold">{selectedTraveler.fee}</span>
            </div>
          )}
          <div className="border-t border-black pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>${(parseFloat(post.product.price) + (selectedTraveler ? parseFloat(selectedTraveler.fee.replace('$', '')) : 0)).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Trust Guarantee */}
      <div className="border-2 border-green-500 bg-green-50 p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-5 h-5 text-green-600" />
          <span className="font-bold text-green-800">Trust Oracle Protection</span>
        </div>
        <p className="text-sm text-green-700">
          Your payment is held securely until you confirm delivery. 100% refund guaranteed if item doesn't match description.
        </p>
      </div>

      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-black text-white border-2 border-black hover:bg-gray-800 font-bold py-3 shadow-[2px_2px_0px_0px_#000] hover:shadow-[4px_4px_0px_0px_#000] transition-all"
      >
        {loading ? "Processing..." : "Secure Payment with Trust Oracle"}
      </Button>
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-green-500 border-2 border-black mx-auto flex items-center justify-center">
        <Shield className="w-8 h-8 text-white" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold text-black mb-2">Payment Secured!</h3>
        <p className="text-gray-600">Your order is confirmed and payment is protected</p>
      </div>

      <div className="border-2 border-black bg-gray-50 p-4 text-left">
        <h4 className="font-bold text-black mb-2">Next Steps</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Merchant has been notified</span>
          </div>
          {selectedTraveler && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>{selectedTraveler.name} will collect your item</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>You'll receive tracking updates</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-gray-600">Transaction ID: {escrowTransactionId}</p>
        <Button
          onClick={onClose}
          className="w-full bg-white text-black border-2 border-black hover:bg-gray-50 font-bold"
        >
          Continue Browsing
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 bg-white border-4 border-black rounded-t-lg max-h-[90vh] overflow-hidden z-50">
          <div className="border-b-2 border-black p-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-xl font-bold text-black">
                {currentStep === 'delivery' && 'Choose Delivery'}
                {currentStep === 'payment' && 'Secure Payment'}
                {currentStep === 'confirmation' && 'Order Confirmed'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-2 hover:bg-gray-100 rounded-none border-2 border-black">
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center space-x-2 mt-4">
              <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-sm font-bold ${
                currentStep === 'delivery' ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                1
              </div>
              <div className={`flex-1 h-1 ${
                currentStep !== 'delivery' ? 'bg-black' : 'bg-gray-300'
              }`}></div>
              <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-sm font-bold ${
                currentStep === 'payment' ? 'bg-black text-white' : currentStep === 'confirmation' ? 'bg-green-500 text-white' : 'bg-white text-black'
              }`}>
                2
              </div>
              <div className={`flex-1 h-1 ${
                currentStep === 'confirmation' ? 'bg-black' : 'bg-gray-300'
              }`}></div>
              <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center text-sm font-bold ${
                currentStep === 'confirmation' ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                3
              </div>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {currentStep === 'delivery' && renderDeliveryStep()}
            {currentStep === 'payment' && renderPaymentStep()}
            {currentStep === 'confirmation' && renderConfirmationStep()}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
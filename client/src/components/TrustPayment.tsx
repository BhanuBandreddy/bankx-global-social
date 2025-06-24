
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  price: string;
  priceInr: string;
  description: string;
}

interface TrustPaymentProps {
  product: Product;
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentCancel: () => void;
}

export const TrustPayment = ({ product, onPaymentSuccess, onPaymentCancel }: TrustPaymentProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [x402PaymentId, setX402PaymentId] = useState<string>('');
  const [escrowDetails, setEscrowDetails] = useState<any>(null);
  const { toast } = useToast();

  // Extract numeric amount from price string (e.g., "€200" -> 200)
  const extractAmount = (priceStr: string) => {
    const match = priceStr.match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const amount = extractAmount(product.price);
  const currency = product.price.includes('€') ? 'EUR' : 'USD';

  const initiatex402Payment = async () => {
    try {
      setPaymentStatus('processing');
      console.log('Initiating x402 payment for product:', product.id);

      // Simulate x402 payment processing for now
      const data = { success: true };

      // Simulate x402 payment processing
      const mockX402PaymentId = `x402_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setX402PaymentId(mockX402PaymentId);

      // Simulate payment confirmation after a short delay
      setTimeout(() => {
        handlePaymentConfirmation(mockX402PaymentId);
      }, 2000);

      toast({
        title: "💳 TrustPay Processing",
        description: "Your x402 micropayment is being processed securely...",
      });

    } catch (error) {
      console.error('Error initiating x402 payment:', error);
      setPaymentStatus('error');
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handlePaymentConfirmation = async (paymentId: string) => {
    try {
      console.log('Confirming payment and initiating escrow:', paymentId);

      // Initiate escrow after successful payment
      const data = await apiClient.initiateEscrow({
        productId: product.id,
        amount,
        currency,
        x402PaymentId: paymentId
      });

      if (data.success) {
        setEscrowDetails(data.transaction);
        setPaymentStatus('success');
        
        toast({
          title: "🔒 Escrow Activated!",
          description: `${currency} ${amount} secured in TrustPay escrow. Funds will be released upon delivery confirmation.`,
        });

        onPaymentSuccess(data.transaction.id);
      } else {
        throw new Error(data.error || 'Failed to initiate escrow');
      }

    } catch (error) {
      console.error('Error confirming payment:', error);
      setPaymentStatus('error');
      toast({
        title: "Escrow Error",
        description: "Payment succeeded but escrow setup failed. Please contact support.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'processing':
        return <Clock className="w-5 h-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing x402 micropayment...';
      case 'success':
        return 'Payment successful! Escrow activated.';
      case 'error':
        return 'Payment failed. Please try again.';
      default:
        return 'Ready to process secure payment';
    }
  };

  return (
    <Card className="border-4 border-black">
      <CardHeader className="bg-purple-100 border-b-4 border-black">
        <CardTitle className="flex items-center space-x-2">
          <Shield className="w-6 h-6" />
          <span>Step 3: TrustPay Secure Payment</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Product Summary */}
        <div className="bg-gray-50 border-4 border-gray-300 p-4">
          <h3 className="font-bold text-lg mb-2">{product.name}</h3>
          <p className="text-sm text-gray-600 mb-3">{product.description}</p>
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">{product.price}</div>
            <div className="text-sm text-gray-600">{product.priceInr}</div>
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white border-4 border-black p-4">
          <div className="flex items-center space-x-3 mb-4">
            {getStatusIcon()}
            <span className="font-medium">{getStatusMessage()}</span>
          </div>

          {x402PaymentId && (
            <div className="text-xs text-gray-500 mb-2">
              Payment ID: {x402PaymentId}
            </div>
          )}
        </div>

        {/* Escrow Information */}
        {escrowDetails && (
          <div className="bg-green-50 border-4 border-green-300 p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-green-800">Escrow Protection Active</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>Transaction ID:</strong> {escrowDetails.id}</div>
              <div><strong>Amount Secured:</strong> {currency} {amount}</div>
              <div><strong>Status:</strong> {escrowDetails.status}</div>
              <div><strong>Auto-release:</strong> 7 days after delivery confirmation</div>
            </div>
          </div>
        )}

        {/* x402 Payment Benefits */}
        <div className="bg-blue-50 border-4 border-blue-200 p-4">
          <h4 className="font-bold text-blue-800 mb-3">🔐 x402 Micropayment Benefits</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ultra-low transaction fees (&lt; $0.01)</li>
            <li>• Instant settlement with crypto backing</li>
            <li>• Built-in escrow protection</li>
            <li>• Trust score integration</li>
            <li>• Automatic dispute resolution</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          {paymentStatus === 'idle' && (
            <Button
              onClick={initiatex402Payment}
              className="flex-1 bg-lime-400 text-black border-4 border-black hover:bg-lime-500"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay with x402 + Escrow
            </Button>
          )}
          
          {paymentStatus === 'processing' && (
            <Button disabled className="flex-1 bg-gray-400 border-4 border-gray-600">
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </Button>
          )}

          {paymentStatus === 'success' && (
            <Button
              onClick={() => onPaymentSuccess(escrowDetails.id)}
              className="flex-1 bg-green-500 text-white border-4 border-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Continue to Logistics
            </Button>
          )}

          {paymentStatus === 'error' && (
            <Button
              onClick={initiatex402Payment}
              className="flex-1 bg-red-500 text-white border-4 border-red-700"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Retry Payment
            </Button>
          )}

          <Button
            onClick={onPaymentCancel}
            variant="outline"
            className="border-4 border-black"
            disabled={paymentStatus === 'processing'}
          >
            Cancel
          </Button>
        </div>

        {/* Trust Score Integration */}
        <div className="bg-yellow-50 border-4 border-yellow-200 p-4">
          <h4 className="font-bold text-yellow-800 mb-2">🏆 Trust Score Benefits</h4>
          <p className="text-sm text-yellow-700">
            Complete this transaction to earn +35 trust points and improve your Global Socials reputation.
            Higher trust scores unlock lower escrow fees and faster release times.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

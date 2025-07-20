
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

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

// Enhanced Payment Form Component with Stripe Elements
const PaymentForm = ({ amount, currency, onPaymentSuccess, onPaymentError }: {
  amount: number;
  currency: string;
  onPaymentSuccess: (paymentIntent: any) => void;
  onPaymentError: (error: string) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        onPaymentError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent);
      }
    } catch (err: any) {
      onPaymentError(err.message || 'Payment processing error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
        <PaymentElement 
          options={{
            layout: 'tabs'
          }}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full neo-button neo-button-blue"
      >
        {isProcessing ? 'Processing...' : `Pay $${amount} with X402`}
      </Button>
    </form>
  );
};

export const TrustPayment = ({ product, onPaymentSuccess, onPaymentCancel }: TrustPaymentProps) => {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'creating-escrow' | 'payment-ready' | 'processing' | 'success' | 'error'>('idle');
  const [x402PaymentId, setX402PaymentId] = useState<string>('');
  const [escrowDetails, setEscrowDetails] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
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
      setPaymentStatus('creating-escrow');
      console.log('Creating X402 escrow for product:', product.id);

      toast({
        title: "🔒 Creating Secure Escrow",
        description: "Setting up X402 micropayment escrow...",
      });

      // Step 1: Create escrow wallet
      const escrowResponse = await fetch('/api/x402/create-escrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          buyer: 'current_user',
          seller: 'merchant',
          amount,
          productId: product.id
        })
      });

      const escrowData = await escrowResponse.json();
      if (!escrowData.success) {
        throw new Error(escrowData.error || 'Failed to create escrow');
      }

      setEscrowDetails(escrowData);

      // Step 2: Lock funds with PaymentIntent
      const lockResponse = await fetch('/api/x402/lock-funds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          amount,
          currency: currency.toLowerCase(),
          escrowId: escrowData.escrowId
        })
      });

      const lockData = await lockResponse.json();
      if (!lockData.success) {
        throw new Error(lockData.error || 'Failed to lock funds');
      }

      setClientSecret(lockData.clientSecret);
      setX402PaymentId(lockData.paymentIntentId);
      setPaymentStatus('payment-ready');

      toast({
        title: "💳 Payment Ready",
        description: "Enter your payment details to complete X402 transaction",
      });

    } catch (error: any) {
      console.error('Error initiating x402 payment:', error);
      setPaymentStatus('error');
      toast({
        title: "Payment Error",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStripePaymentSuccess = async (paymentIntent: any) => {
    try {
      console.log('X402 payment succeeded:', paymentIntent.id);
      setPaymentStatus('processing');

      toast({
        title: "✅ Payment Confirmed",
        description: "Creating escrow transaction...",
      });

      // Create escrow transaction in our database
      const escrowResponse = await fetch('/api/escrow/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          productId: product.id,
          amount,
          currency,
          x402PaymentId: paymentIntent.id
        })
      });

      const escrowResult = await escrowResponse.json();
      
      if (escrowResult.success) {
        setPaymentStatus('success');
        toast({
          title: "🎉 X402 Payment Complete",
          description: `${product.name} secured in escrow`,
        });
        onPaymentSuccess(paymentIntent.id);
      } else {
        throw new Error('Failed to create escrow transaction');
      }

    } catch (error: any) {
      console.error('X402 payment confirmation error:', error);
      setPaymentStatus('error');
      toast({
        title: "Payment Error",
        description: error.message || "Failed to confirm payment",
        variant: "destructive"
      });
    }
  };

  const handleStripePaymentError = (error: string) => {
    setPaymentStatus('error');
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive"
    });
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'processing':
      case 'creating-escrow':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'creating-escrow':
        return "Creating secure escrow wallet...";
      case 'payment-ready':
        return "Ready for payment - enter your details below";
      case 'processing':
        return "Confirming payment and securing funds...";
      case 'success':
        return `Payment confirmed! ${product.name} is secured in X402 escrow`;
      case 'error':
        return "Payment failed. Please try again.";
      default:
        return "Ultra-low fees, instant settlement, built-in escrow protection";
    }
  };

  if (!stripePromise) {
    return (
      <Card className="neo-card">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Stripe configuration error. Please check environment variables.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neo-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span>X402 TrustPay - ${amount} {currency}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-gray-600">
          {getStatusMessage()}
        </div>

        {/* X402 Benefits */}
        <div className="bg-blue-50 p-4 rounded-lg border">
          <h4 className="font-medium text-blue-900 mb-2">X402 Micropayment Benefits:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ultra-low transaction fees (&lt; $0.01)</li>
            <li>• Instant settlement with crypto backing</li>
            <li>• Built-in escrow protection</li>
            <li>• Trust score integration</li>
            <li>• Automatic dispute resolution</li>
          </ul>
        </div>

        {/* Payment States */}
        {paymentStatus === 'idle' && (
          <div className="flex space-x-4">
            <Button
              onClick={initiatex402Payment}
              className="flex-1 neo-button neo-button-blue"
            >
              <Shield className="w-4 h-4 mr-2" />
              Pay with X402 TrustPay
            </Button>
            <Button 
              variant="outline" 
              onClick={onPaymentCancel}
              className="neo-button neo-button-white"
            >
              Cancel
            </Button>
          </div>
        )}

        {paymentStatus === 'creating-escrow' && (
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
            <div className="text-sm text-gray-600">Creating secure escrow...</div>
          </div>
        )}

        {paymentStatus === 'payment-ready' && clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm
              amount={amount}
              currency={currency}
              onPaymentSuccess={handleStripePaymentSuccess}
              onPaymentError={handleStripePaymentError}
            />
          </Elements>
        )}

        {paymentStatus === 'processing' && (
          <div className="text-center">
            <div className="animate-spin w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-2" />
            <div className="text-sm text-gray-600">Securing payment in escrow...</div>
          </div>
        )}

        {paymentStatus === 'success' && escrowDetails && (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-green-800 font-medium">X402 Payment Complete!</div>
            <div className="text-sm text-green-600 mt-1">
              Escrow ID: {escrowDetails.escrowId.slice(-8)}
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="flex space-x-4">
            <Button
              onClick={initiatex402Payment}
              className="flex-1 neo-button neo-button-blue"
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={onPaymentCancel}
              className="neo-button neo-button-white"
            >
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
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

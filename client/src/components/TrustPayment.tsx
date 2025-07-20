import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
        {isProcessing ? 'Processing Payment...' : `Pay $${amount} with X402`}
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
      console.log('🚀 Creating X402 Stripe escrow for product:', product.id);

      toast({
        title: "🔒 Creating X402 Escrow",
        description: "Setting up Stripe-backed micropayment escrow...",
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
      console.log('✅ X402 Escrow created:', escrowData);
      
      if (!escrowData.success) {
        throw new Error(escrowData.error || 'Failed to create X402 escrow');
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
      console.log('🔐 X402 Funds locked:', lockData);
      
      if (!lockData.success) {
        throw new Error(lockData.error || 'Failed to lock X402 funds');
      }

      setClientSecret(lockData.clientSecret);
      setX402PaymentId(lockData.paymentIntentId);
      setPaymentStatus('payment-ready');

      toast({
        title: "💳 X402 Payment Ready",
        description: "Enter your payment details to complete transaction",
      });

    } catch (error: any) {
      console.error('❌ X402 payment initiation error:', error);
      setPaymentStatus('error');
      toast({
        title: "X402 Payment Error",
        description: error.message || "Failed to initiate X402 payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleStripePaymentSuccess = async (paymentIntent: any) => {
    try {
      console.log('✅ X402 Stripe payment succeeded:', paymentIntent.id);
      setPaymentStatus('processing');

      toast({
        title: "✅ X402 Payment Confirmed",
        description: "Creating escrow transaction in database...",
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
      console.log('💰 X402 Escrow transaction created:', escrowResult);
      
      if (escrowResult.success) {
        setPaymentStatus('success');
        toast({
          title: "🎉 X402 Payment Complete!",
          description: `${product.name} secured in Stripe escrow`,
        });
        onPaymentSuccess(paymentIntent.id);
      } else {
        throw new Error('Failed to create X402 escrow transaction');
      }

    } catch (error: any) {
      console.error('❌ X402 payment confirmation error:', error);
      setPaymentStatus('error');
      toast({
        title: "X402 Payment Error",
        description: error.message || "Failed to confirm X402 payment",
        variant: "destructive"
      });
    }
  };

  const handleStripePaymentError = (error: string) => {
    console.error('❌ X402 Stripe payment error:', error);
    setPaymentStatus('error');
    toast({
      title: "X402 Payment Failed",
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
        return "Creating Stripe escrow wallet...";
      case 'payment-ready':
        return "Ready for payment - enter your details below";
      case 'processing':
        return "Confirming payment and securing funds in escrow...";
      case 'success':
        return `Payment confirmed! ${product.name} is secured in X402 escrow`;
      case 'error':
        return "X402 payment failed. Please try again.";
      default:
        return "Ultra-low fees, Stripe-backed security, instant settlement";
    }
  };

  if (!stripePromise) {
    return (
      <Card className="neo-card">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Stripe configuration error. Please check VITE_STRIPE_PUBLIC_KEY environment variable.
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
            <li>• Stripe-backed security and compliance</li>
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
            <div className="text-sm text-gray-600">Creating Stripe escrow wallet...</div>
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
            <div className="text-sm text-gray-600">Securing payment in X402 escrow...</div>
          </div>
        )}

        {paymentStatus === 'success' && escrowDetails && (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-green-800 font-medium">X402 Payment Complete!</div>
            <div className="text-sm text-green-600 mt-1">
              Stripe Escrow: {escrowDetails.escrowId.slice(-8)}
            </div>
            <div className="text-xs text-green-500 mt-1">
              Payment ID: {x402PaymentId.slice(-8)}
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="flex space-x-4">
            <Button
              onClick={initiatex402Payment}
              className="flex-1 neo-button neo-button-blue"
            >
              Try X402 Again
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
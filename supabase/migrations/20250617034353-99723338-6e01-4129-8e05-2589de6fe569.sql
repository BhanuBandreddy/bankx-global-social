
-- Create escrow_transactions table to track payment states
CREATE TABLE public.escrow_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'escrowed', 'released', 'refunded', 'disputed')),
  payment_method TEXT NOT NULL DEFAULT 'x402',
  x402_payment_id TEXT,
  escrow_address TEXT,
  release_conditions JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_events table for audit trail
CREATE TABLE public.payment_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.escrow_transactions(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- Create policies for escrow_transactions
CREATE POLICY "Users can view their own transactions" ON public.escrow_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.escrow_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON public.escrow_transactions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for payment_events
CREATE POLICY "Users can view events for their transactions" ON public.payment_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.escrow_transactions 
      WHERE id = payment_events.transaction_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert payment events" ON public.payment_events
  FOR INSERT WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_escrow_transactions_updated_at 
  BEFORE UPDATE ON public.escrow_transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_escrow_transactions_user_id ON public.escrow_transactions(user_id);
CREATE INDEX idx_escrow_transactions_status ON public.escrow_transactions(status);
CREATE INDEX idx_escrow_transactions_x402_payment_id ON public.escrow_transactions(x402_payment_id);
CREATE INDEX idx_payment_events_transaction_id ON public.payment_events(transaction_id);

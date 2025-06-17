
-- Add missing columns and indexes for reliability
ALTER TABLE escrow_transactions ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES auth.users(id);
ALTER TABLE escrow_transactions ADD COLUMN IF NOT EXISTS seller_id UUID REFERENCES auth.users(id);

-- Add trust_score column to profiles table (since we have profiles table, not users table)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_score_v2 INTEGER DEFAULT 0 CHECK (trust_score_v2 <= 100);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS esc_buyer_status_idx ON escrow_transactions(buyer_id, status);
CREATE INDEX IF NOT EXISTS esc_seller_status_idx ON escrow_transactions(seller_id, status);
CREATE INDEX IF NOT EXISTS esc_payment_id_idx ON escrow_transactions(x402_payment_id);

-- Add unique constraint for payment_id in payment_events for idempotency
ALTER TABLE payment_events ADD COLUMN IF NOT EXISTS payment_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS payment_events_payment_id_unique ON payment_events(payment_id) WHERE payment_id IS NOT NULL;

-- Enable RLS on escrow_transactions if not already enabled
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for escrow parties (buyers and sellers can see their transactions)
DROP POLICY IF EXISTS "p_escrow_parties" ON escrow_transactions;
CREATE POLICY "p_escrow_parties" ON escrow_transactions
  FOR SELECT 
  USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id OR 
    auth.uid() = user_id
  );

-- Create RLS policy for inserting escrows (authenticated users can create)
DROP POLICY IF EXISTS "Users can create escrow transactions" ON escrow_transactions;
CREATE POLICY "Users can create escrow transactions" ON escrow_transactions
  FOR INSERT 
  WITH CHECK (
    auth.uid() = buyer_id OR 
    auth.uid() = user_id
  );

-- Create RLS policy for updating escrows (only parties involved can update)
DROP POLICY IF EXISTS "Users can update their escrow transactions" ON escrow_transactions;
CREATE POLICY "Users can update their escrow transactions" ON escrow_transactions
  FOR UPDATE 
  USING (
    auth.uid() = buyer_id OR 
    auth.uid() = seller_id OR 
    auth.uid() = user_id
  );

-- Enable RLS on payment_events if not already enabled
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for payment_events (users can see events for their transactions)
DROP POLICY IF EXISTS "Users can view payment events for their transactions" ON payment_events;
CREATE POLICY "Users can view payment events for their transactions" ON payment_events
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM escrow_transactions 
      WHERE escrow_transactions.id = payment_events.transaction_id 
      AND (
        escrow_transactions.buyer_id = auth.uid() OR 
        escrow_transactions.seller_id = auth.uid() OR 
        escrow_transactions.user_id = auth.uid()
      )
    )
  );

-- Allow system to insert payment events
DROP POLICY IF EXISTS "System can insert payment events" ON payment_events;
CREATE POLICY "System can insert payment events" ON payment_events
  FOR INSERT 
  WITH CHECK (true);

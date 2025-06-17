
-- First, update existing workflow data to match new enum values
UPDATE blink_workflows 
SET workflow_type = 'product_inquiry' 
WHERE workflow_type = 'inquire';

UPDATE blink_workflows 
SET workflow_type = 'product_purchase' 
WHERE workflow_type = 'purchase';

-- Now create the enum with the correct values
CREATE TYPE workflow_type AS ENUM (
  'product_inquiry',
  'product_purchase', 
  'itinerary_upload',
  'logistics_request',
  'local_intel'
);

-- Add trust points tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_points_history jsonb DEFAULT '[]'::jsonb;

-- Add workflow status notifications table
CREATE TABLE IF NOT EXISTS workflow_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workflow_id uuid REFERENCES blink_workflows(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on workflow_notifications
ALTER TABLE workflow_notifications ENABLE ROW LEVEL SECURITY;

-- Policy for users to see only their notifications
CREATE POLICY "Users can view their own workflow notifications" 
  ON workflow_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add itinerary sharing preference to workflows
ALTER TABLE blink_workflows ADD COLUMN IF NOT EXISTS share_as_post boolean DEFAULT false;
ALTER TABLE blink_workflows ADD COLUMN IF NOT EXISTS parsed_data jsonb DEFAULT '{}'::jsonb;

-- Update workflow_type column to use the enum
ALTER TABLE blink_workflows ALTER COLUMN workflow_type TYPE workflow_type USING workflow_type::workflow_type;

-- Create function to award trust points
CREATE OR REPLACE FUNCTION award_trust_points(
  user_uuid uuid, 
  points integer, 
  reason text
) RETURNS void AS $$
BEGIN
  -- Update total trust points
  UPDATE profiles 
  SET trust_points = COALESCE(trust_points, 0) + points,
      trust_points_history = COALESCE(trust_points_history, '[]'::jsonb) || 
        jsonb_build_object(
          'points', points,
          'reason', reason,
          'awarded_at', now()
        )
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification function for workflow updates
CREATE OR REPLACE FUNCTION notify_workflow_update() RETURNS trigger AS $$
BEGIN
  -- Send notification when workflow status changes
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM pg_notify(
      'workflow_status_change',
      json_build_object(
        'user_id', NEW.user_id,
        'workflow_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'workflow_type', NEW.workflow_type
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for workflow status changes
DROP TRIGGER IF EXISTS workflow_status_notification ON blink_workflows;
CREATE TRIGGER workflow_status_notification
  AFTER UPDATE ON blink_workflows
  FOR EACH ROW
  EXECUTE FUNCTION notify_workflow_update();

-- Enable realtime for workflow notifications
ALTER PUBLICATION supabase_realtime ADD TABLE workflow_notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE blink_workflows;

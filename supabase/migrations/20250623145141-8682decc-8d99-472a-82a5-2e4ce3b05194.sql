
-- Clean up duplicate notification systems - consolidate to blink_notifications
-- Drop the duplicate workflow_notifications table
DROP TABLE IF EXISTS workflow_notifications;

-- Clean up unused columns in existing tables
-- Remove unused columns from blink_workflows
ALTER TABLE blink_workflows DROP COLUMN IF EXISTS share_as_post;
ALTER TABLE blink_workflows DROP COLUMN IF EXISTS feed_post_id;

-- Remove unused columns from profiles that aren't being used
ALTER TABLE profiles DROP COLUMN IF EXISTS trust_score;
ALTER TABLE profiles DROP COLUMN IF EXISTS level;

-- Clean up payment_events table if not actively used
DROP TABLE IF EXISTS payment_events;

-- Optimize blink_notifications table structure
ALTER TABLE blink_notifications DROP COLUMN IF EXISTS workflow_id;

-- Remove unused parsed_itineraries table if not needed
DROP TABLE IF EXISTS parsed_itineraries;

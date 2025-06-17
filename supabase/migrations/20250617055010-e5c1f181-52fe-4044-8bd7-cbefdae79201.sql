
-- Create conversation history table for Blink
CREATE TABLE public.blink_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  session_id TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'agent')),
  speaker TEXT NOT NULL,
  content TEXT NOT NULL,
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow tracking table
CREATE TABLE public.blink_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  workflow_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  context_data JSONB NOT NULL DEFAULT '{}',
  feed_post_id TEXT,
  agent_responses JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table for Blink actions
CREATE TABLE public.blink_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  workflow_id UUID REFERENCES public.blink_workflows,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for blink_conversations
ALTER TABLE public.blink_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blink conversations" 
  ON public.blink_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blink conversations" 
  ON public.blink_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for blink_workflows
ALTER TABLE public.blink_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blink workflows" 
  ON public.blink_workflows 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own blink workflows" 
  ON public.blink_workflows 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own blink workflows" 
  ON public.blink_workflows 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add RLS policies for blink_notifications
ALTER TABLE public.blink_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blink notifications" 
  ON public.blink_notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own blink notifications" 
  ON public.blink_notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add trigger for updating blink_workflows updated_at
CREATE TRIGGER update_blink_workflows_updated_at
  BEFORE UPDATE ON public.blink_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

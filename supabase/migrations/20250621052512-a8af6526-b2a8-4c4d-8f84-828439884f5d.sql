
-- Create table to store parsed itineraries
CREATE TABLE public.parsed_itineraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  parsed_data JSONB NOT NULL,
  raw_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.parsed_itineraries ENABLE ROW LEVEL SECURITY;

-- Create policies for parsed_itineraries
CREATE POLICY "Users can view their own parsed itineraries" 
  ON public.parsed_itineraries 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own parsed itineraries" 
  ON public.parsed_itineraries 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own parsed itineraries" 
  ON public.parsed_itineraries 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER update_parsed_itineraries_updated_at
  BEFORE UPDATE ON public.parsed_itineraries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

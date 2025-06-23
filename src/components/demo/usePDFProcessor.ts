
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ItineraryData } from '@/types/journey';

export const usePDFProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processFile = async (file: File): Promise<ItineraryData | null> => {
    if (!file) return null;

    setIsProcessing(true);
    
    try {
      console.log('Starting PDF processing for file:', file.name);
      
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Call simplified edge function
      const { data, error } = await supabase.functions.invoke('parse-itinerary', {
        body: {
          file: base64,
          fileName: file.name,
          fileType: file.type
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to process PDF');
      }

      console.log('Successfully processed PDF:', data.data);
      
      toast({
        title: "📄 Document Processed",
        description: `Successfully extracted itinerary from ${file.name}`,
      });

      return data.data;
      
    } catch (error) {
      console.error('PDF processing error:', error);
      
      toast({
        title: "❌ Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process PDF file",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processFile,
    isProcessing
  };
};

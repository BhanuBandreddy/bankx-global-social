
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const usePDFProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File) => {
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFile = async (file: File) => {
    if (!validateFile(file)) return null;
    setIsProcessing(true);
    
    try {
      console.log('Processing file:', file.name);
      
      const base64PDF = await convertFileToBase64(file);
      console.log('Converted PDF to base64, length:', base64PDF.length);
      
      const { data, error } = await supabase.functions.invoke('parse-itinerary', {
        body: {
          pdfBase64: base64PDF,
          fileName: file.name,
          fileType: file.type
        }
      });
      
      console.log('Supabase function response:', { data, error });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Failed to process PDF');
      }
      
      if (!data) {
        throw new Error('No response data received');
      }
      
      if (data.success && data.itinerary) {
        console.log('Successfully processed itinerary:', data.itinerary);
        return data.itinerary;
      } else {
        throw new Error(data.error || 'Failed to parse itinerary');
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : "Failed to parse itinerary. Please try again.",
        variant: "destructive"
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


import { useState } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FileUploadStepProps {
  onFileProcess: (file: File) => Promise<void>;
  isProcessing: boolean;
}

export const FileUploadStep = ({ onFileProcess, isProcessing }: FileUploadStepProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // Check file type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file. Other file types are not supported.",
        variant: "destructive"
      });
      return false;
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Please upload a PDF file smaller than 10MB.",
        variant: "destructive"
      });
      return false;
    }

    // Check if file is empty
    if (file.size === 0) {
      toast({
        title: "Empty file",
        description: "The selected file appears to be empty. Please choose a valid PDF.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      await onFileProcess(file);
    }
    // Reset input to allow re-uploading the same file
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && validateFile(file)) {
      await onFileProcess(file);
    }
  };

  return (
    <Card className="border-4 border-black">
      <CardHeader className="bg-purple-100 border-b-4 border-black">
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-6 h-6" />
          <span>Step 1: Upload Travel Itinerary</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div 
          className={`border-4 border-dashed p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-300 bg-white'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              <p className="text-lg font-medium">GlobeGuides™ is parsing your itinerary...</p>
              <p className="text-sm text-gray-600">Extracting travel details, weather, and local insights</p>
            </div>
          ) : (
            <>
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-purple-600' : 'text-gray-400'}`} />
              <p className="text-lg font-medium mb-4">
                {isDragOver ? 'Drop your PDF here!' : 'Drag & drop your PDF itinerary here'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                GlobeGuides™ will parse your travel details and provide smart insights
              </p>
              <div className="flex items-center justify-center space-x-2 mb-4 text-xs text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span>Supported: PDF files up to 10MB</span>
              </div>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={isProcessing}
              />
              <label htmlFor="file-upload">
                <Button 
                  className="bg-black text-white border-4 border-black hover:bg-gray-800"
                  disabled={isProcessing}
                  asChild
                >
                  <span className="cursor-pointer">
                    Choose PDF File
                  </span>
                </Button>
              </label>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

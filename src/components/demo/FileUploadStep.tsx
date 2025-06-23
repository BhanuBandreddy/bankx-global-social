
import { useState } from "react";
import { Upload, Loader2, AlertCircle, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface FileUploadStepProps {
  onFileProcess: (file: File) => Promise<void>;
  isProcessing: boolean;
}

export const FileUploadStep = ({ onFileProcess, isProcessing }: FileUploadStepProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
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
      setUploadedFile(file);
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
      setUploadedFile(file);
      await onFileProcess(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="border-4 border-black">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100 border-b-4 border-black">
        <CardTitle className="flex items-center space-x-2">
          <Upload className="w-6 h-6" />
          <span>Step 1: Upload Travel Itinerary</span>
          <Badge variant="outline" className="border-2 border-black">
            Multi-Format Support
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div 
          className={`border-4 border-dashed p-8 text-center transition-all duration-300 rounded-lg ${
            isDragOver 
              ? 'border-purple-500 bg-purple-50 transform scale-105' 
              : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-25'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              <p className="text-lg font-medium">GlobeGuides™ is intelligently parsing your itinerary...</p>
              <p className="text-sm text-gray-600">
                Extracting destinations, dates, transportation, an local insights
              </p>
              {uploadedFile && (
                <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-sm">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{uploadedFile.name}</span>
                    <span className="text-gray-500">({formatFileSize(uploadedFile.size)})</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${
                isDragOver ? 'text-purple-600' : 'text-gray-400'
              }`} />
              <p className="text-lg font-medium mb-4">
                {isDragOver ? 'Drop your travel document here!' : 'Drag & drop your travel document here'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                GlobeGuides™ intelligently parses any travel document format
              </p>
              
              {/* Supported formats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
                {[
                  'Airline Tickets',
                  'Hotel Bookings', 
                  'Tour Packages',
                  'Travel Vouchers',
                  'Multi-City Plans',
                  'Transport Tickets',
                  'Vacation Rentals',
                  'Custom Itineraries'
                ].map((format) => (
                  <Badge key={format} variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {format}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-center space-x-2 mb-4 text-xs text-gray-500">
                <AlertCircle className="w-4 h-4" />
                <span>Supported: PDF files up to 10MB • Multi-format parsing</span>
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
                  className="bg-black text-white border-4 border-black hover:bg-gray-800 hover:transform hover:scale-105 transition-all"
                  disabled={isProcessing}
                  asChild
                >
                  <span className="cursor-pointer flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Choose Travel Document</span>
                  </span>
                </Button>
              </label>
            </>
          )}
        </div>
        
        {/* Enhanced info section */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-4 border-green-200 rounded-lg">
          <h4 className="font-bold text-green-800 mb-2">🚀 Enhanced AI Processing</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>• <strong>Multi-format support:</strong> Airlines, hotels, tours, rentals, and custom plans</p>
            <p>• <strong>Intelligent extraction:</strong> Destinations, dates, transport, and alerts</p>
            <p>• <strong>Journey detection:</strong> Single trips and multi-city itineraries</p>
            <p>• <strong>Context preparation:</strong> Optimized for LocaleLens product discovery</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

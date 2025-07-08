import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocumentStore } from "@/lib/stores/useDocumentStore";
import { DocumentProcessor, type ExtractionProgress } from "@/lib/utils/documentProcessor";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  File
} from "lucide-react";

interface DocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
  className?: string;
}

export default function DocumentUpload({ onUploadComplete, className = "" }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { 
    addDocument, 
    updateDocumentText, 
    setProcessingStatus,
    currentDocument 
  } = useDocumentStore();
  
  const { toast } = useToast();

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'text/plain'];
    const validExtensions = ['.pdf', '.txt'];
    
    const isValidType = validTypes.includes(file.type) || 
      validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isValidType) {
      setError('Please upload a PDF or text file only.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.');
      return;
    }

    setError(null);
    setIsProcessing(true);
    setProcessingStatus('extracting');

    try {
      // Create document record
      const documentFile = DocumentProcessor.createDocumentFile(file);
      addDocument(documentFile);

      // Extract text with progress tracking
      const { text, metadata } = await DocumentProcessor.extractTextFromFile(
        file,
        (progress) => {
          setExtractionProgress(progress);
        }
      );

      // Update document with extracted text
      updateDocumentText(documentFile.id, text, metadata);
      setProcessingStatus('complete');

      toast({
        title: "Document processed successfully",
        description: `Extracted ${metadata.wordCount} words from ${metadata.pages} pages.`,
      });

      onUploadComplete?.(documentFile.id);

    } catch (err) {
      console.error('Document processing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to process document');
      setProcessingStatus('error');
      
      toast({
        title: "Processing failed",
        description: "Could not extract text from the document.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setExtractionProgress(null);
    }
  }, [addDocument, updateDocumentText, setProcessingStatus, toast, onUploadComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files);
    }
  }, [handleFileSelect]);

  if (currentDocument && !isProcessing) {
    return (
      <Card className={`${className}`}>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">{currentDocument.name}</p>
                <p className="text-sm text-muted-foreground">
                  {DocumentProcessor.formatFileSize(currentDocument.size)} • 
                  {currentDocument.metadata?.wordCount || 0} words
                </p>
              </div>
            </div>
            <Badge variant="secondary">
              {currentDocument.extractedText ? 'Ready' : 'Processing'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card 
        className={`transition-all border-2 border-dashed cursor-pointer hover:border-primary/50 ${
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
        } ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (!isProcessing) {
            document.getElementById('document-upload-input')?.click();
          }
        }}
      >
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            {isProcessing ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto">
                  <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Processing Document</p>
                  {extractionProgress && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {extractionProgress.status}
                      </p>
                      <div className="max-w-xs mx-auto">
                        <Progress value={extractionProgress.progress} className="h-2" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Page {extractionProgress.currentPage} of {extractionProgress.totalPages}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-muted rounded-full w-fit mx-auto">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Upload Document</p>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to select a PDF or text file
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <File className="h-3 w-3" />
                    <span>PDF</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-3 w-3" />
                    <span>TXT</span>
                  </div>
                  <span>•</span>
                  <span>Max 10MB</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        id="document-upload-input"
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isProcessing}
      />

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-auto p-0"
              onClick={() => setError(null)}
            >
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
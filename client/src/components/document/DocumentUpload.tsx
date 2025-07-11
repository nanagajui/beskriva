import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocumentStore } from "@/lib/stores/useDocumentStore";
import { DocumentProcessor, type ExtractionProgress } from "@/lib/utils/documentProcessor";
import { useToast } from "@/hooks/use-toast";
import { useDocumentUpload } from "./hooks/useDocumentUpload";
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
  
  const { 
    removeDocument,
    clearAllDocuments,
    uploadedFiles,
    currentDocument 
  } = useDocumentStore();
  
  const { toast } = useToast();
  
  const { 
    isProcessing, 
    extractionProgress, 
    error, 
    uploadFile, 
    resetError 
  } = useDocumentUpload({ onUploadComplete });

  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const file = files[0];
    if (!file) return;
    
    resetError();
    await uploadFile(file);
  }, [uploadFile, resetError]);

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
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">
                {currentDocument.extractedText ? 'Ready' : 'Processing'}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  removeDocument(currentDocument.id);
                  toast({
                    title: "Document Removed",
                    description: "Document has been removed from your workspace."
                  });
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Show extracted text preview */}
          {currentDocument.extractedText && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Extracted Text Preview:</p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {currentDocument.extractedText.substring(0, 300)}
                  {currentDocument.extractedText.length > 300 && "..."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Show existing documents if any */}
      {uploadedFiles.length > 0 && !currentDocument && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Previously Uploaded Documents</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearAllDocuments();
                  toast({
                    title: "All Documents Removed",
                    description: "Cleared all documents from workspace."
                  });
                }}
                className="text-red-600 hover:text-red-700"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-2">
              {uploadedFiles.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {DocumentProcessor.formatFileSize(doc.size)} • 
                        {doc.metadata?.wordCount || 0} words
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Set as current document
                        useDocumentStore.setState({ currentDocument: doc });
                        toast({
                          title: "Document Selected",
                          description: `Now using "${doc.name}" for workflows.`
                        });
                      }}
                    >
                      Use This File
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        removeDocument(doc.id);
                        toast({
                          title: "Document Removed",
                          description: `"${doc.name}" has been removed.`
                        });
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
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
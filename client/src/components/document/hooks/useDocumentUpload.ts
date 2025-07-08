import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { DocumentProcessor, type ExtractionProgress } from '@/lib/utils/documentProcessor';
import { useDocumentStore } from '@/lib/stores/useDocumentStore';
import type { DocumentFile } from '@shared/types';

interface UseDocumentUploadProps {
  onUploadComplete?: (documentId: string) => void;
}

export function useDocumentUpload({ onUploadComplete }: UseDocumentUploadProps = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { 
    addDocument, 
    updateDocumentText, 
    setProcessingStatus 
  } = useDocumentStore();
  
  const { toast } = useToast();

  const uploadFile = useCallback(async (file: File) => {
    // Reset states
    setError(null);
    setExtractionProgress(null);
    setIsProcessing(true);
    setProcessingStatus('extracting');

    try {
      // Validate file type
      const validTypes = ['application/pdf', 'text/plain'];
      const validExtensions = ['.pdf', '.txt'];
      
      const isValidType = validTypes.includes(file.type) || 
        validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isValidType) {
        throw new Error('Please upload a PDF or text file only.');
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB.');
      }

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

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isProcessing,
    extractionProgress,
    error,
    uploadFile,
    resetError
  };
}
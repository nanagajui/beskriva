import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { 
  DocumentFile, 
  ProcessingStatus 
} from "@shared/types";

export type { DocumentFile };

interface DocumentState {
  // Document management
  uploadedFiles: DocumentFile[];
  currentDocument?: DocumentFile;
  processingStatus: ProcessingStatus;
  extractionProgress: number;
  
  // Actions
  addDocument: (file: DocumentFile) => void;
  setCurrentDocument: (id: string) => void;
  updateDocumentText: (id: string, text: string, metadata?: DocumentFile['metadata']) => void;
  removeDocument: (id: string) => void;
  clearAllDocuments: () => void;
  setProcessingStatus: (status: ProcessingStatus) => void;
  setExtractionProgress: (progress: number) => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      // Initial state
      uploadedFiles: [],
      currentDocument: undefined,
      processingStatus: 'idle',
      extractionProgress: 0,

      // Document actions
      addDocument: (file) => set((state) => ({
        uploadedFiles: [file, ...state.uploadedFiles],
        currentDocument: file
      })),

      setCurrentDocument: (id) => set((state) => ({
        currentDocument: state.uploadedFiles.find(f => f.id === id)
      })),

      updateDocumentText: (id, text, metadata) => set((state) => ({
        uploadedFiles: state.uploadedFiles.map(file =>
          file.id === id ? { ...file, extractedText: text, metadata } : file
        ),
        currentDocument: state.currentDocument?.id === id 
          ? { ...state.currentDocument, extractedText: text, metadata }
          : state.currentDocument
      })),

      removeDocument: (id) => set((state) => ({
        uploadedFiles: state.uploadedFiles.filter(f => f.id !== id),
        currentDocument: state.currentDocument?.id === id ? undefined : state.currentDocument
      })),
      
      clearAllDocuments: () => set({
        uploadedFiles: [],
        currentDocument: undefined,
        processingStatus: 'idle',
        extractionProgress: 0
      }),

      setProcessingStatus: (status) => set({ processingStatus: status }),

      setExtractionProgress: (progress) => set({ extractionProgress: progress })
    }),
    {
      name: "beskriva-document-store",
      version: 1,
      // Don't persist large text files to avoid storage issues
      partialize: (state) => ({
        ...state,
        uploadedFiles: state.uploadedFiles.map(file => ({
          ...file,
          // Truncate large extracted text to first 1000 chars for persistence
          extractedText: file.extractedText && file.extractedText.length > 1000 
            ? file.extractedText.substring(0, 1000) + '...(truncated for storage)'
            : file.extractedText
        }))
      })
    }
  )
);
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { 
  DocumentFile, 
  ProcessingStatus,
  WorkflowStep,
  WorkflowTemplate
} from "@shared/types";

export type { DocumentFile };

interface DocumentState {
  // Document management
  uploadedFiles: DocumentFile[];
  currentDocument?: DocumentFile;
  processingStatus: ProcessingStatus;
  extractionProgress: number;
  
  // Workflow management
  workflows: WorkflowStep[];
  currentWorkflow?: string;
  workflowTemplates: WorkflowTemplate[];
  
  // Actions
  addDocument: (file: DocumentFile) => void;
  setCurrentDocument: (id: string) => void;
  updateDocumentText: (id: string, text: string, metadata?: DocumentFile['metadata']) => void;
  removeDocument: (id: string) => void;
  clearAllDocuments: () => void;
  setProcessingStatus: (status: ProcessingStatus) => void;
  setExtractionProgress: (progress: number) => void;
  startWorkflow: (templateId: string, documentId: string) => void;
  clearWorkflow: () => void;
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      // Initial state
      uploadedFiles: [],
      currentDocument: undefined,
      processingStatus: 'idle',
      extractionProgress: 0,
      
      // Workflow state
      workflows: [],
      currentWorkflow: undefined,
      workflowTemplates: [
        {
          id: 'research-to-podcast',
          name: 'Research → Podcast',
          description: 'Transform research papers into engaging podcast scripts',
          steps: [
            { type: 'chat', title: 'Analyze Document', prompt: 'Analyze this research paper and create a comprehensive summary suitable for podcast conversion.' },
            { type: 'chat', title: 'Create Podcast Script', prompt: 'Create an engaging 2-speaker podcast script based on the document analysis.' },
            { type: 'tts', title: 'Generate Audio', prompt: 'Convert the podcast script to audio' },
            { type: 'image', title: 'Create Cover Image', prompt: 'Generate a professional podcast cover image' }
          ],
          category: 'document'
        },
        {
          id: 'document-analysis',
          name: 'Document Analysis',
          description: 'Deep analysis and insight extraction from documents',
          steps: [
            { type: 'chat', title: 'Extract Key Points', prompt: 'Extract and summarize the key points from this document.' },
            { type: 'chat', title: 'Generate Insights', prompt: 'Provide actionable insights and recommendations based on the document content.' }
          ],
          category: 'analysis'
        },
        {
          id: 'content-expansion',
          name: 'Content Expansion',
          description: 'Expand document content into multiple formats',
          steps: [
            { type: 'chat', title: 'Create Summary', prompt: 'Create a comprehensive summary of the document.' },
            { type: 'chat', title: 'Generate Q&A', prompt: 'Generate questions and answers based on the document content.' },
            { type: 'image', title: 'Create Illustrations', prompt: 'Generate visual illustrations for key concepts' }
          ],
          category: 'content'
        }
      ],

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

      setExtractionProgress: (progress) => set({ extractionProgress: progress }),
      
      // Workflow actions
      startWorkflow: (templateId, documentId) => set((state) => {
        const template = state.workflowTemplates.find(t => t.id === templateId);
        if (!template) return state;
        
        const workflowSteps: WorkflowStep[] = template.steps.map((step, index) => ({
          id: `${templateId}-${index}`,
          type: step.type,
          title: step.title,
          prompt: step.prompt,
          parameters: step.parameters,
          dependencies: step.dependencies,
          status: index === 0 ? 'pending' : 'pending',
          createdAt: new Date(),
        }));
        
        return {
          workflows: workflowSteps,
          currentWorkflow: templateId,
          processingStatus: 'processing'
        };
      }),
      
      clearWorkflow: () => set({
        workflows: [],
        currentWorkflow: undefined,
        processingStatus: 'idle'
      })
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
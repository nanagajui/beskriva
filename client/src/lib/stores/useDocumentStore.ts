import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { 
  DocumentFile, 
  WorkflowStep, 
  WorkflowTemplate,
  ProcessingStatus 
} from "@shared/types";

export type { DocumentFile, WorkflowStep, WorkflowTemplate };

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
  
  // Workflow actions
  startWorkflow: (templateId: string, documentId?: string) => void;
  addWorkflowStep: (step: Omit<WorkflowStep, 'id' | 'createdAt'>) => string;
  updateWorkflowStep: (stepId: string, updates: Partial<WorkflowStep>) => void;
  completeWorkflowStep: (stepId: string, result: any) => void;
  clearWorkflow: () => void;
  
  // Template management
  addWorkflowTemplate: (template: Omit<WorkflowTemplate, 'id'>) => void;
  getWorkflowTemplate: (id: string) => WorkflowTemplate | undefined;
}

// Default workflow templates
const defaultTemplates: WorkflowTemplate[] = [
  {
    id: 'research-to-podcast',
    name: 'Research Paper to Podcast',
    description: 'Convert a research paper into a conversational podcast with two speakers',
    category: 'content',
    steps: [
      {
        type: 'chat',
        title: 'Generate Summary',
        prompt: 'Please create a comprehensive yet accessible summary of this research paper. Focus on the key findings, methodology, and implications. Keep it under 800 words.',
        parameters: { maxTokens: 1000 }
      },
      {
        type: 'chat',
        title: 'Create Podcast Script',
        prompt: 'Based on the summary above, create a 10-15 minute podcast script for two speakers (Host and Expert). Make it conversational, engaging, and educational. Include natural dialogue, questions, and explanations. Format it clearly with Speaker A: and Speaker B: labels.',
        parameters: { maxTokens: 2000 },
        dependencies: ['0']
      },
      {
        type: 'tts',
        title: 'Generate Audio for Speaker A',
        prompt: 'Extract all Speaker A/Host dialogue from the script',
        parameters: { voice: 'en-US-1', speed: 1.0 },
        dependencies: ['1']
      },
      {
        type: 'tts',
        title: 'Generate Audio for Speaker B',
        prompt: 'Extract all Speaker B/Expert dialogue from the script',
        parameters: { voice: 'en-US-2', speed: 1.0 },
        dependencies: ['1']
      },
      {
        type: 'image',
        title: 'Create Podcast Cover',
        prompt: 'Create a professional podcast cover image based on the research topic. Include the title and make it visually appealing.',
        parameters: { size: '1024x1024' },
        dependencies: ['0']
      }
    ]
  },
  {
    id: 'document-summary',
    name: 'Document Analysis & Summary',
    description: 'Analyze and summarize any document with key insights',
    category: 'analysis',
    steps: [
      {
        type: 'chat',
        title: 'Extract Key Points',
        prompt: 'Analyze this document and extract the key points, main arguments, and important data. Present them in a structured format.',
        parameters: { maxTokens: 800 }
      },
      {
        type: 'chat',
        title: 'Generate Executive Summary',
        prompt: 'Create a concise executive summary suitable for business presentation. Include key takeaways and actionable insights.',
        parameters: { maxTokens: 500 },
        dependencies: ['0']
      },
      {
        type: 'image',
        title: 'Create Summary Infographic',
        prompt: 'Design an infographic that visualizes the key points from this document summary.',
        parameters: { size: '1024x1024' },
        dependencies: ['1']
      }
    ]
  },
  {
    id: 'content-expansion',
    name: 'Content Expansion Suite',
    description: 'Transform document into multiple content formats',
    category: 'content',
    steps: [
      {
        type: 'chat',
        title: 'Create Blog Post',
        prompt: 'Transform this document into an engaging blog post with compelling headlines, subheadings, and clear explanations.',
        parameters: { maxTokens: 1500 }
      },
      {
        type: 'chat',
        title: 'Generate Social Media Posts',
        prompt: 'Create 5 engaging social media posts highlighting different aspects of this content. Include relevant hashtags.',
        parameters: { maxTokens: 600 },
        dependencies: ['0']
      },
      {
        type: 'tts',
        title: 'Audio Version',
        prompt: 'Convert the blog post into natural-sounding audio content',
        parameters: { voice: 'en-US-1', speed: 1.1 },
        dependencies: ['0']
      }
    ]
  }
];

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      // Initial state
      uploadedFiles: [],
      currentDocument: undefined,
      processingStatus: 'idle',
      extractionProgress: 0,
      workflows: [],
      currentWorkflow: undefined,
      workflowTemplates: defaultTemplates,

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
      startWorkflow: (templateId, documentId) => {
        const template = get().workflowTemplates.find(t => t.id === templateId);
        if (!template) return;

        const workflowSteps: WorkflowStep[] = template.steps.map((step, index) => ({
          ...step,
          id: `${templateId}-${index}`,
          status: index === 0 ? 'pending' : 'pending',
          createdAt: new Date()
        }));

        set({
          workflows: workflowSteps,
          currentWorkflow: templateId,
          processingStatus: 'processing'
        });
      },

      addWorkflowStep: (step) => {
        const id = `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newStep: WorkflowStep = {
          ...step,
          id,
          createdAt: new Date()
        };

        set((state) => ({
          workflows: [...state.workflows, newStep]
        }));

        return id;
      },

      updateWorkflowStep: (stepId, updates) => set((state) => ({
        workflows: state.workflows.map(step =>
          step.id === stepId ? { ...step, ...updates } : step
        )
      })),

      completeWorkflowStep: (stepId, result) => set((state) => ({
        workflows: state.workflows.map(step =>
          step.id === stepId 
            ? { ...step, status: 'completed', result, completedAt: new Date() }
            : step
        )
      })),

      clearWorkflow: () => set({
        workflows: [],
        currentWorkflow: undefined,
        processingStatus: 'idle'
      }),

      // Template management
      addWorkflowTemplate: (template) => {
        const id = `template-${Date.now()}`;
        const newTemplate: WorkflowTemplate = { ...template, id };
        
        set((state) => ({
          workflowTemplates: [...state.workflowTemplates, newTemplate]
        }));
      },

      getWorkflowTemplate: (id) => {
        return get().workflowTemplates.find(t => t.id === id);
      }
    }),
    {
      name: "lemonfox-document-store",
      version: 1,
      // Don't persist large files, only metadata
      partialize: (state) => ({
        ...state,
        uploadedFiles: state.uploadedFiles.map(file => ({
          ...file,
          extractedText: file.extractedText ? file.extractedText.substring(0, 1000) + '...' : undefined
        }))
      })
    }
  )
);
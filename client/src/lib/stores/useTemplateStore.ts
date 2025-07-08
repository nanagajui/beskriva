import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorkflowTemplate } from "@shared/types";

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
        dependencies: ['Generate Summary']
      },
      {
        type: 'tts',
        title: 'Generate Podcast Audio',
        prompt: 'Generate multi-speaker audio from the podcast script',
        parameters: { 
          mode: 'podcast',
          voices: ['charlotte', 'marcus']
        },
        dependencies: ['Create Podcast Script']
      },
      {
        type: 'image',
        title: 'Create Cover Image',
        prompt: 'Generate a professional podcast cover image based on the research content',
        parameters: { 
          style: 'podcast-cover',
          size: '1024x1024'
        },
        dependencies: ['Generate Summary']
      }
    ]
  },
  {
    id: 'document-analysis',
    name: 'Document Analysis & Insights',
    description: 'Analyze document content and provide insights with visual summary',
    category: 'analysis',
    steps: [
      {
        type: 'chat',
        title: 'Content Analysis',
        prompt: 'Analyze this document and provide: 1) Key themes and topics, 2) Main arguments or findings, 3) Target audience, 4) Writing style and tone, 5) Actionable insights or takeaways.',
        parameters: { maxTokens: 1500 }
      },
      {
        type: 'chat',
        title: 'Executive Summary',
        prompt: 'Create a concise executive summary (200-300 words) highlighting the most important points for decision-makers.',
        parameters: { maxTokens: 500 },
        dependencies: ['Content Analysis']
      },
      {
        type: 'image',
        title: 'Visual Summary',
        prompt: 'Create an infographic-style image that visually represents the key insights',
        parameters: { 
          style: 'infographic',
          size: '1024x576'
        },
        dependencies: ['Content Analysis']
      }
    ]
  },
  {
    id: 'content-expansion',
    name: 'Content Expansion & Adaptation',
    description: 'Transform content into multiple formats (summary, detailed analysis, presentation)',
    category: 'content',
    steps: [
      {
        type: 'chat',
        title: 'Short Summary',
        prompt: 'Create a brief 150-word summary suitable for social media or quick overview.',
        parameters: { maxTokens: 300 }
      },
      {
        type: 'chat',
        title: 'Detailed Analysis',
        prompt: 'Provide an in-depth analysis expanding on the key concepts, implications, and potential applications.',
        parameters: { maxTokens: 2000 }
      },
      {
        type: 'chat',
        title: 'Presentation Outline',
        prompt: 'Create a structured presentation outline with 8-10 slides, including talking points for each slide.',
        parameters: { maxTokens: 1200 },
        dependencies: ['Detailed Analysis']
      },
      {
        type: 'image',
        title: 'Title Slide Graphics',
        prompt: 'Design professional graphics suitable for presentation title slides',
        parameters: { 
          style: 'presentation',
          size: '1024x576'
        },
        dependencies: ['Presentation Outline']
      }
    ]
  }
];

interface TemplateState {
  workflowTemplates: WorkflowTemplate[];
  
  // Template management
  addWorkflowTemplate: (template: Omit<WorkflowTemplate, 'id'>) => void;
  getWorkflowTemplate: (id: string) => WorkflowTemplate | undefined;
  updateWorkflowTemplate: (id: string, updates: Partial<WorkflowTemplate>) => void;
  removeWorkflowTemplate: (id: string) => void;
  resetToDefaults: () => void;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      workflowTemplates: defaultTemplates,

      addWorkflowTemplate: (template) => {
        const id = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newTemplate: WorkflowTemplate = { ...template, id };
        
        set((state) => ({
          workflowTemplates: [...state.workflowTemplates, newTemplate]
        }));
      },

      getWorkflowTemplate: (id) => {
        return get().workflowTemplates.find(t => t.id === id);
      },

      updateWorkflowTemplate: (id, updates) => {
        set((state) => ({
          workflowTemplates: state.workflowTemplates.map(template =>
            template.id === id ? { ...template, ...updates } : template
          )
        }));
      },

      removeWorkflowTemplate: (id) => {
        set((state) => ({
          workflowTemplates: state.workflowTemplates.filter(t => t.id !== id)
        }));
      },

      resetToDefaults: () => {
        set({ workflowTemplates: defaultTemplates });
      }
    }),
    {
      name: "beskriva-template-store",
      partialize: (state) => ({
        workflowTemplates: state.workflowTemplates
      })
    }
  )
);
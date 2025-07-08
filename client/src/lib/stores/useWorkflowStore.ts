import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WorkflowStep, WorkflowTemplate } from "@shared/types";

interface WorkflowState {
  // Workflow execution
  workflows: WorkflowStep[];
  currentWorkflow?: string;
  
  // Workflow actions
  startWorkflow: (templateId: string, documentId?: string) => void;
  addWorkflowStep: (step: Omit<WorkflowStep, 'id' | 'createdAt'>) => string;
  updateWorkflowStep: (stepId: string, updates: Partial<WorkflowStep>) => void;
  completeWorkflowStep: (stepId: string, result: any) => void;
  clearWorkflow: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflows: [],
      currentWorkflow: undefined,

      startWorkflow: (templateId, documentId) => {
        // This will be implemented with template integration
        set({
          currentWorkflow: templateId,
          workflows: []
        });
      },

      addWorkflowStep: (step) => {
        const id = `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newStep: WorkflowStep = {
          ...step,
          id,
          createdAt: new Date(),
          status: 'pending'
        };
        
        set((state) => ({
          workflows: [...state.workflows, newStep]
        }));
        
        return id;
      },

      updateWorkflowStep: (stepId, updates) => {
        set((state) => ({
          workflows: state.workflows.map(step =>
            step.id === stepId ? { ...step, ...updates } : step
          )
        }));
      },

      completeWorkflowStep: (stepId, result) => {
        set((state) => ({
          workflows: state.workflows.map(step =>
            step.id === stepId ? {
              ...step,
              status: 'completed' as const,
              result,
              completedAt: new Date()
            } : step
          )
        }));
      },

      clearWorkflow: () => {
        set({
          workflows: [],
          currentWorkflow: undefined
        });
      }
    }),
    {
      name: "beskriva-workflow-store",
      partialize: (state) => ({
        workflows: state.workflows,
        currentWorkflow: state.currentWorkflow
      })
    }
  )
);
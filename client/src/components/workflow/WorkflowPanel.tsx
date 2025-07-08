import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocumentStore } from "@/lib/stores/useDocumentStore";
import { useWorkflowStore } from "@/lib/stores/useWorkflowStore";
import { useTemplateStore } from "@/lib/stores/useTemplateStore";
import type { WorkflowStep, WorkflowTemplate } from "@shared/types";
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  Mic, 
  Image, 
  User,
  ChevronRight,
  Zap
} from "lucide-react";

const stepIcons = {
  chat: FileText,
  tts: Mic,
  image: Image,
  'user-input': User
};

const statusColors = {
  pending: "bg-gray-100 text-gray-700",
  'in-progress': "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  error: "bg-red-100 text-red-700"
};

export default function WorkflowPanel() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  const {
    workflowTemplates,
    workflows,
    currentWorkflow,
    currentDocument,
    startWorkflow,
    clearWorkflow,
    processingStatus
  } = useDocumentStore();

  const handleStartWorkflow = (templateId: string) => {
    if (!currentDocument) {
      alert('Please upload and select a document first.');
      return;
    }
    startWorkflow(templateId, currentDocument.id);
  };

  const getWorkflowProgress = () => {
    if (workflows.length === 0) return 0;
    const completed = workflows.filter(step => step.status === 'completed').length;
    return (completed / workflows.length) * 100;
  };

  const getStepIcon = (type: string) => {
    const Icon = stepIcons[type as keyof typeof stepIcons] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const currentTemplate = currentWorkflow ? workflowTemplates.find(t => t.id === currentWorkflow) : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Engine</h2>
          <p className="text-muted-foreground">
            Transform documents into rich content with AI-powered workflows
          </p>
        </div>
        {workflows.length > 0 && (
          <Button 
            variant="outline" 
            onClick={clearWorkflow}
            disabled={processingStatus === 'processing'}
          >
            <Square className="h-4 w-4 mr-2" />
            Clear Workflow
          </Button>
        )}
      </div>

      {/* Current Document */}
      {currentDocument && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Current Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentDocument.name}</p>
                <p className="text-sm text-muted-foreground">
                  {currentDocument.metadata?.pages} pages • {currentDocument.metadata?.wordCount} words
                </p>
              </div>
              <Badge variant="secondary">
                {currentDocument.extractedText ? 'Text Extracted' : 'Processing'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Workflow */}
      {workflows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                {currentTemplate?.name || 'Active Workflow'}
              </CardTitle>
              <Badge variant={processingStatus === 'processing' ? 'default' : 'secondary'}>
                {processingStatus === 'processing' ? 'Running' : 'Paused'}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(getWorkflowProgress())}%</span>
              </div>
              <Progress value={getWorkflowProgress()} className="h-2" />
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {workflows.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : step.status === 'error' ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : step.status === 'in-progress' ? (
                        <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        {getStepIcon(step.type)}
                        <span className="font-medium">{step.title}</span>
                        <Badge 
                          variant="secondary" 
                          className={statusColors[step.status]}
                        >
                          {step.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      {step.prompt && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {step.prompt}
                        </p>
                      )}
                      {step.result && (
                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                          <p className="font-medium">Result:</p>
                          <p className="line-clamp-3">{typeof step.result === 'string' ? step.result : JSON.stringify(step.result)}</p>
                        </div>
                      )}
                    </div>
                    {index < workflows.length - 1 && (
                      <ChevronRight className="h-4 w-4 text-gray-400 mt-1" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Workflow Templates */}
      {workflows.length === 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowTemplates.map((template) => (
            <Card 
              key={template.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedTemplate(selectedTemplate === template.id ? null : template.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {template.category}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {template.steps.length} steps
                    </span>
                  </div>
                  
                  {selectedTemplate === template.id && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Workflow Steps:</p>
                        {template.steps.map((step, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            {getStepIcon(step.type)}
                            <span>{step.title}</span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full mt-3" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartWorkflow(template.id);
                        }}
                        disabled={!currentDocument?.extractedText}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Workflow
                      </Button>
                      {!currentDocument?.extractedText && (
                        <p className="text-xs text-muted-foreground text-center">
                          Upload and process a document first
                        </p>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Document Warning */}
      {!currentDocument && workflows.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No Document Selected</h3>
              <p className="text-sm text-muted-foreground">
                Upload a document in the chat panel to start using workflows
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
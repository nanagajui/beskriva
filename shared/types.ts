// Consolidated type definitions for Beskriva
// This file serves as the single source of truth for shared types

// ============================================================================
// Core Application Types
// ============================================================================

export type TabType = "chat" | "stt" | "tts" | "image" | "settings" | "workflow";

export interface AppSettings {
  apiKey: string;
  baseUrl: string;
  theme: "light" | "dark" | "system";
  timeout: number;
}

export type Chat = {
  id: number;
  userId: number;
  createdAt: Date;
};

export type Message = {
  id: number;
  chatId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

// ============================================================================
// API Types (Lemonfox.ai Integration)
// ============================================================================

// Speech-to-Text API Types
export interface TranscriptionRequest {
  file: File;
  language?: string;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  speaker_labels?: boolean;
  prompt?: string;
  translate?: boolean;
  min_speakers?: number;
  max_speakers?: number;
  timestamp_granularities?: ('word' | 'segment')[];
  callback_url?: string;
}

export interface TranscriptionResponse {
  text: string;
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
    speaker?: number;
    words?: Array<{
      word: string;
      start: number;
      end: number;
      confidence: number;
    }>;
  }>;
}

// Text-to-Speech API Types
export interface SpeechRequest {
  input: string;
  voice: string;
  language?: string;
  response_format?: 'mp3' | 'wav' | 'ogg' | 'aac';
  speed?: number;
  word_timestamps?: boolean;
}

// Chat API Types
export interface ChatCompletionRequest {
  messages: Message[];
  model: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  stop?: string | string[];
  frequency_penalty?: number;
  presence_penalty?: number;
  top_p?: number;
}

export interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: 'stop' | 'length' | 'function_call';
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Image Generation API Types
export interface ImageGenerationRequest {
  prompt: string;
  negative_prompt?: string;
  n?: number;
  size?: '512x512' | '768x768' | '1024x1024' | '1024x576' | '576x1024';
  response_format?: 'url' | 'b64_json';
}

export interface ImageGenerationResponse {
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

// ============================================================================
// Document & Workflow Types
// ============================================================================

export interface DocumentFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  extractedText?: string;
  metadata?: {
    title?: string;
    author?: string;
    pages?: number;
    wordCount?: number;
  };
}

export interface WorkflowStep {
  id: string;
  type: 'chat' | 'tts' | 'image' | 'user-input';
  title: string;
  prompt?: string;
  parameters?: Record<string, any>;
  dependencies?: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  result?: any;
  createdAt: Date;
  completedAt?: Date;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: Omit<WorkflowStep, 'id' | 'status' | 'createdAt' | 'completedAt'>[];
  category: 'document' | 'content' | 'analysis';
}

export interface ExtractionProgress {
  progress: number;
  currentPage: number;
  totalPages: number;
  status: string;
}

// ============================================================================
// Media & Content Types
// ============================================================================

export interface GeneratedAudio {
  id: string;
  url: string;
  text: string;
  voice: string;
  language: string;
  speed: number;
  format: string;
  timestamp: Date;
  duration?: number;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  size: string;
  negativePrompt?: string;
}

export interface PodcastScript {
  id: string;
  title: string;
  speakers: Array<{
    name: string;
    voice: string;
    role: string;
  }>;
  segments: Array<{
    speaker: string;
    text: string;
    emotion?: string;
    duration?: number;
  }>;
  metadata?: {
    duration?: number;
    wordCount?: number;
    theme?: string;
    genre?: string;
  };
}

// ============================================================================
// Error & Status Types
// ============================================================================

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
  context?: string;
}

export type ProcessingStatus = 'idle' | 'extracting' | 'processing' | 'complete' | 'error';

export type LoadingState = {
  isLoading: boolean;
  progress?: number;
  status?: string;
  error?: AppError;
};

// ============================================================================
// UI Component Types
// ============================================================================

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  description?: string;
  className?: string;
}

export interface ProgressIndicatorProps {
  progress: number;
  status?: string;
  className?: string;
}

export interface ErrorDisplayProps {
  error: AppError | string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

// ============================================================================
// Storage & Cache Types
// ============================================================================

export interface StorageItem<T = any> {
  id: string;
  data: T;
  timestamp: Date;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export interface CacheStats {
  totalItems: number;
  totalSize: number;
  lastCleared?: Date;
  hitRate?: number;
}

// ============================================================================
// Voice & Language Configuration
// ============================================================================

export interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: 'male' | 'female' | 'neutral';
  accent?: string;
  description?: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

// ============================================================================
// Content Analysis Types
// ============================================================================

export interface ContentAnalysis {
  themes: string[];
  mood: string;
  genre: string;
  tone: string;
  complexity: 'simple' | 'intermediate' | 'advanced';
  keyTopics: string[];
  suggestedImageStyle?: string;
  estimatedReadingTime?: number;
}

export interface ImageStyleTemplate {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  category: 'podcast' | 'article' | 'research' | 'creative';
  aspectRatio?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// ============================================================================
// Event Types
// ============================================================================

export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
}

export type EventHandler<T = any> = (event: AppEvent & { payload: T }) => void;

// ============================================================================
// Configuration Types
// ============================================================================

export interface FeatureFlags {
  enableStreamingChat: boolean;
  enablePodcastGeneration: boolean;
  enableContentAlignment: boolean;
  enableAdvancedErrorReporting: boolean;
  maxFileSize: number;
  supportedFormats: string[];
}

export interface AppConfig {
  apiEndpoints: {
    chat: string;
    stt: string;
    tts: string;
    image: string;
  };
  features: FeatureFlags;
  ui: {
    defaultTheme: string;
    animationsEnabled: boolean;
    compactMode: boolean;
  };
}
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
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: string;
}

export interface ChatCompletionRequest {
  messages: ChatMessage[];
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

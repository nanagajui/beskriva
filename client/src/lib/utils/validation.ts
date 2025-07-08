import { z } from 'zod';
import type { 
  TranscriptionRequest, 
  SpeechRequest, 
  ChatCompletionRequest, 
  ImageGenerationRequest,
  DocumentFile 
} from '@shared/types';
import { createError } from './errorHandler';

// File validation helpers that were missing
export function validateFileSize(file: File, maxSizeMB: number = 10): void {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw createError('FILE_TOO_LARGE', `File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB`);
  }
}

export function validateFileType(file: File, allowedTypes: string[]): void {
  const isValidType = allowedTypes.some(type => 
    file.type === type || file.name.toLowerCase().endsWith(type.replace('application/', '.'))
  );
  
  if (!isValidType) {
    throw createError('FILE_TYPE_INVALID', `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
  }
}

// Validation schemas for API requests
export const transcriptionRequestSchema = z.object({
  file: z.instanceof(File),
  language: z.string().optional(),
  response_format: z.enum(['json', 'text', 'srt', 'verbose_json', 'vtt']).optional(),
  speaker_labels: z.boolean().optional(),
  prompt: z.string().optional(),
  translate: z.boolean().optional(),
  min_speakers: z.number().min(1).max(10).optional(),
  max_speakers: z.number().min(1).max(10).optional(),
  timestamp_granularities: z.array(z.enum(['word', 'segment'])).optional(),
  callback_url: z.string().url().optional()
});

export const speechRequestSchema = z.object({
  input: z.string().min(1).max(4000),
  voice: z.string().min(1),
  language: z.string().optional(),
  response_format: z.enum(['mp3', 'wav', 'ogg', 'aac']).optional(),
  speed: z.number().min(0.25).max(4.0).optional(),
  word_timestamps: z.boolean().optional()
});

export const chatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1),
    timestamp: z.date(),
    id: z.string().optional(),
    image: z.string().optional(),
    name: z.string().optional()
  })).min(1),
  model: z.string().min(1),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(8000).optional(),
  stream: z.boolean().optional(),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  frequency_penalty: z.number().min(-2).max(2).optional(),
  presence_penalty: z.number().min(-2).max(2).optional(),
  top_p: z.number().min(0).max(1).optional()
});

export const imageRequestSchema = z.object({
  prompt: z.string().min(1).max(1000),
  negative_prompt: z.string().max(1000).optional(),
  n: z.number().min(1).max(4).optional(),
  size: z.enum(['512x512', '768x768', '1024x1024', '1024x576', '576x1024']).optional(),
  response_format: z.enum(['url', 'b64_json']).optional()
});

export const documentFileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  size: z.number().min(0),
  type: z.string().min(1),
  uploadedAt: z.date(),
  extractedText: z.string().optional(),
  metadata: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    pages: z.number().min(1).optional(),
    wordCount: z.number().min(0).optional()
  }).optional()
});

// Validation functions
export function validateTranscriptionRequest(data: unknown): TranscriptionRequest {
  try {
    return transcriptionRequestSchema.parse(data);
  } catch (error) {
    throw createError('VALIDATION_FAILED', `Invalid transcription request: ${error}`);
  }
}

export function validateSpeechRequest(data: unknown): SpeechRequest {
  try {
    return speechRequestSchema.parse(data);
  } catch (error) {
    throw createError('VALIDATION_FAILED', `Invalid speech request: ${error}`);
  }
}

export function validateChatRequest(data: unknown): ChatCompletionRequest {
  try {
    return chatRequestSchema.parse(data);
  } catch (error) {
    throw createError('VALIDATION_FAILED', `Invalid chat request: ${error}`);
  }
}

export function validateImageRequest(data: unknown): ImageGenerationRequest {
  try {
    return imageRequestSchema.parse(data);
  } catch (error) {
    throw createError('VALIDATION_FAILED', `Invalid image request: ${error}`);
  }
}

export function validateDocumentFile(data: unknown): DocumentFile {
  try {
    return documentFileSchema.parse(data);
  } catch (error) {
    throw createError('VALIDATION_FAILED', `Invalid document file: ${error}`);
  }
}

// Settings validation
export const settingsSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  baseUrl: z.string().url('Must be a valid URL'),
  theme: z.enum(['light', 'dark', 'system']),
  timeout: z.number().min(1000).max(60000)
});

export function validateSettings(data: unknown) {
  try {
    return settingsSchema.parse(data);
  } catch (error) {
    throw createError('VALIDATION_FAILED', `Invalid settings: ${error}`);
  }
}

// File validation helpers
export function isValidPDFFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

export function isValidTextFile(file: File): boolean {
  return file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
}

export function isValidDocumentFile(file: File): boolean {
  return isValidPDFFile(file) || isValidTextFile(file);
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}

export function isValidAudioFile(file: File): boolean {
  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'];
  return validTypes.includes(file.type);
}

// URL validation
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Text validation
export function isValidPrompt(text: string): boolean {
  return text.trim().length > 0 && text.length <= 4000;
}

export function sanitizeText(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

// API response validation
export function validateApiResponse<T>(response: unknown, validator: (data: unknown) => T): T {
  if (!response) {
    throw createError('API_RESPONSE_INVALID', 'Empty response from API');
  }
  
  return validator(response);
}
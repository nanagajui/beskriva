import type { AppError } from '@shared/types';

export class BeskrivareError extends Error {
  public readonly code: string;
  public readonly context?: string;
  public readonly timestamp: Date;

  constructor(code: string, message: string, context?: string) {
    super(message);
    this.name = 'BeskrivareError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
  }

  toAppError(): AppError {
    return {
      code: this.code,
      message: this.message,
      context: this.context,
      timestamp: this.timestamp
    };
  }
}

export const ErrorCodes = {
  // API Errors
  API_KEY_MISSING: 'API_KEY_MISSING',
  API_REQUEST_FAILED: 'API_REQUEST_FAILED',
  API_RESPONSE_INVALID: 'API_RESPONSE_INVALID',
  
  // File Processing Errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_INVALID: 'FILE_TYPE_INVALID',
  FILE_PROCESSING_FAILED: 'FILE_PROCESSING_FAILED',
  PDF_EXTRACTION_FAILED: 'PDF_EXTRACTION_FAILED',
  
  // Workflow Errors
  WORKFLOW_TEMPLATE_NOT_FOUND: 'WORKFLOW_TEMPLATE_NOT_FOUND',
  WORKFLOW_STEP_FAILED: 'WORKFLOW_STEP_FAILED',
  WORKFLOW_DEPENDENCY_MISSING: 'WORKFLOW_DEPENDENCY_MISSING',
  
  // Storage Errors
  STORAGE_QUOTA_EXCEEDED: 'STORAGE_QUOTA_EXCEEDED',
  STORAGE_OPERATION_FAILED: 'STORAGE_OPERATION_FAILED',
  
  // Validation Errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING'
} as const;

export function createError(code: keyof typeof ErrorCodes, message: string, context?: string): BeskrivareError {
  return new BeskrivareError(code, message, context);
}

export function handleAsyncError<T>(
  promise: Promise<T>,
  errorCode: keyof typeof ErrorCodes,
  context?: string
): Promise<T> {
  return promise.catch((error) => {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    throw createError(errorCode, message, context);
  });
}

export function validateApiKey(apiKey: string | undefined): void {
  if (!apiKey || apiKey.trim() === '') {
    throw createError('API_KEY_MISSING', 'API key is required. Please set your Lemonfox.ai API key in settings.');
  }
}

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

export function safeParseJSON<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

export function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;

    const attempt = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          reject(error);
        } else {
          setTimeout(attempt, delay * attempts);
        }
      }
    };

    attempt();
  });
}
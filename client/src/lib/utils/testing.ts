// Testing utilities and health checks for Beskriva application

import { LemonfoxAPI } from '@/lib/api/lemonfox';
import { DocumentProcessor } from '@/lib/utils/documentProcessor';
import { validateApiKey, BeskrivareError, ErrorCodes } from '@/lib/utils/errorHandler';
import type { AppSettings, DocumentFile } from '@shared/types';

export interface HealthCheckResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  timestamp: Date;
  details?: any;
}

export interface SystemHealthReport {
  overall: 'healthy' | 'warning' | 'error';
  checks: HealthCheckResult[];
  timestamp: Date;
}

/**
 * Run comprehensive health checks on all system components
 */
export async function runSystemHealthCheck(settings?: AppSettings): Promise<SystemHealthReport> {
  const checks: HealthCheckResult[] = [];
  const timestamp = new Date();

  // Check local storage availability
  checks.push(await checkLocalStorage());
  
  // Check IndexedDB availability  
  checks.push(await checkIndexedDB());
  
  // Check PDF.js functionality
  checks.push(await checkPDFProcessing());
  
  // Check API configuration
  if (settings?.apiKey) {
    checks.push(await checkAPIConfiguration(settings));
  }
  
  // Check service worker status
  checks.push(await checkServiceWorker());
  
  // Check file system access (if supported)
  checks.push(await checkFileSystemAccess());

  // Determine overall health
  const hasErrors = checks.some(check => check.status === 'error');
  const hasWarnings = checks.some(check => check.status === 'warning');
  
  const overall = hasErrors ? 'error' : hasWarnings ? 'warning' : 'healthy';

  return {
    overall,
    checks,
    timestamp
  };
}

async function checkLocalStorage(): Promise<HealthCheckResult> {
  try {
    const testKey = '__beskriva_health_check__';
    const testValue = 'test';
    
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    if (retrieved !== testValue) {
      throw new Error('LocalStorage read/write mismatch');
    }
    
    return {
      component: 'LocalStorage',
      status: 'healthy',
      message: 'LocalStorage is working correctly',
      timestamp: new Date()
    };
  } catch (error) {
    return {
      component: 'LocalStorage',
      status: 'error',
      message: `LocalStorage failed: ${error}`,
      timestamp: new Date()
    };
  }
}

async function checkIndexedDB(): Promise<HealthCheckResult> {
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open('__beskriva_health_check__', 1);
      
      request.onerror = () => {
        resolve({
          component: 'IndexedDB',
          status: 'error',
          message: 'IndexedDB is not available',
          timestamp: new Date()
        });
      };
      
      request.onsuccess = () => {
        request.result.close();
        indexedDB.deleteDatabase('__beskriva_health_check__');
        resolve({
          component: 'IndexedDB',
          status: 'healthy',
          message: 'IndexedDB is working correctly',
          timestamp: new Date()
        });
      };
      
      request.onupgradeneeded = () => {
        // Database creation is working
      };
    } catch (error) {
      resolve({
        component: 'IndexedDB',
        status: 'error',
        message: `IndexedDB failed: ${error}`,
        timestamp: new Date()
      });
    }
  });
}

async function checkPDFProcessing(): Promise<HealthCheckResult> {
  try {
    // Create a minimal test PDF blob
    const testPDFContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj
xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000053 00000 n 
0000000100 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
151
%%EOF`;
    
    const testFile = new File([testPDFContent], 'test.pdf', { type: 'application/pdf' });
    
    // Test PDF.js basic functionality
    await DocumentProcessor.extractTextFromPDF(testFile);
    
    return {
      component: 'PDF Processing',
      status: 'healthy',
      message: 'PDF.js is working correctly',
      timestamp: new Date()
    };
  } catch (error) {
    return {
      component: 'PDF Processing',
      status: 'warning',
      message: `PDF processing may have issues: ${error}`,
      timestamp: new Date(),
      details: error
    };
  }
}

async function checkAPIConfiguration(settings: AppSettings): Promise<HealthCheckResult> {
  try {
    validateApiKey(settings.apiKey);
    
    if (!settings.baseUrl) {
      throw new Error('Base URL not configured');
    }
    
    new URL(settings.baseUrl); // Validate URL format
    
    return {
      component: 'API Configuration',
      status: 'healthy',
      message: 'API configuration is valid',
      timestamp: new Date()
    };
  } catch (error) {
    return {
      component: 'API Configuration',
      status: 'error',
      message: `API configuration invalid: ${error}`,
      timestamp: new Date()
    };
  }
}

async function checkServiceWorker(): Promise<HealthCheckResult> {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }
    
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return {
        component: 'Service Worker',
        status: 'warning',
        message: 'Service Worker not registered',
        timestamp: new Date()
      };
    }
    
    return {
      component: 'Service Worker',
      status: 'healthy',
      message: 'Service Worker is active',
      timestamp: new Date(),
      details: {
        scope: registration.scope,
        updateViaCache: registration.updateViaCache
      }
    };
  } catch (error) {
    return {
      component: 'Service Worker',
      status: 'warning',
      message: `Service Worker check failed: ${error}`,
      timestamp: new Date()
    };
  }
}

async function checkFileSystemAccess(): Promise<HealthCheckResult> {
  try {
    if (!('showOpenFilePicker' in window)) {
      return {
        component: 'File System Access',
        status: 'warning',
        message: 'File System Access API not supported (fallback available)',
        timestamp: new Date()
      };
    }
    
    return {
      component: 'File System Access',
      status: 'healthy',
      message: 'File System Access API is available',
      timestamp: new Date()
    };
  } catch (error) {
    return {
      component: 'File System Access',
      status: 'warning',
      message: `File System Access check failed: ${error}`,
      timestamp: new Date()
    };
  }
}

/**
 * Test API connectivity with actual endpoint
 */
export async function testAPIConnectivity(settings: AppSettings): Promise<HealthCheckResult> {
  try {
    validateApiKey(settings.apiKey);
    
    const api = new LemonfoxAPI();
    
    // Test with minimal chat request
    const testRequest = {
      messages: [{
        role: 'user' as const,
        content: 'Hello',
        timestamp: new Date()
      }],
      model: 'llama',
      max_tokens: 1
    };
    
    await api.chat(testRequest);
    
    return {
      component: 'API Connectivity',
      status: 'healthy',
      message: 'API is responding correctly',
      timestamp: new Date()
    };
  } catch (error) {
    return {
      component: 'API Connectivity',
      status: 'error',
      message: `API connectivity failed: ${error}`,
      timestamp: new Date(),
      details: error
    };
  }
}

/**
 * Validate document file integrity
 */
export function validateDocumentIntegrity(document: DocumentFile): HealthCheckResult {
  try {
    if (!document.id || document.id.trim() === '') {
      throw new Error('Missing document ID');
    }
    
    if (!document.name || document.name.trim() === '') {
      throw new Error('Missing document name');
    }
    
    if (document.size <= 0) {
      throw new Error('Invalid document size');
    }
    
    if (!document.uploadedAt || !(document.uploadedAt instanceof Date)) {
      throw new Error('Invalid upload date');
    }
    
    return {
      component: 'Document Integrity',
      status: 'healthy',
      message: 'Document data is valid',
      timestamp: new Date()
    };
  } catch (error) {
    return {
      component: 'Document Integrity',
      status: 'error',
      message: `Document validation failed: ${error}`,
      timestamp: new Date(),
      details: document
    };
  }
}

/**
 * Performance monitoring
 */
export function measurePerformance<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<{ result: T; duration: number; memoryUsage?: number }> {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize;
  
  return operation().then(result => {
    const endTime = performance.now();
    const endMemory = (performance as any).memory?.usedJSHeapSize;
    
    return {
      result,
      duration: endTime - startTime,
      memoryUsage: startMemory && endMemory ? endMemory - startMemory : undefined
    };
  });
}

/**
 * Generate system diagnostic report
 */
export function generateDiagnosticReport(): Record<string, any> {
  return {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth
    },
    memory: (performance as any).memory ? {
      usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
      totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
      jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
    } : 'Not available',
    connection: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt
    } : 'Not available',
    storage: {
      localStorage: (() => {
        try {
          return {
            available: true,
            usage: JSON.stringify(localStorage).length
          };
        } catch {
          return { available: false };
        }
      })()
    },
    features: {
      serviceWorker: 'serviceWorker' in navigator,
      indexedDB: 'indexedDB' in window,
      fileSystemAccess: 'showOpenFilePicker' in window,
      webAudio: 'AudioContext' in window || 'webkitAudioContext' in window,
      mediaRecorder: 'MediaRecorder' in window,
      notification: 'Notification' in window
    }
  };
}
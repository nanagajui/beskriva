import * as pdfjsLib from 'pdfjs-dist';
import type { DocumentFile } from '@/lib/stores/useDocumentStore';

// Configure PDF.js worker to prevent runtime errors
// Use the most stable approach for Replit environment
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export interface ExtractionProgress {
  progress: number;
  currentPage: number;
  totalPages: number;
  status: string;
}

export class DocumentProcessor {
  
  static async extractTextFromPDF(
    file: File, 
    onProgress?: (progress: ExtractionProgress) => void
  ): Promise<{ text: string; metadata: DocumentFile['metadata'] }> {
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Handle potential worker loading issues gracefully
      let pdf;
      try {
        pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          // Disable worker if it fails to load
          disableWorker: false,
          isEvalSupported: false
        }).promise;
      } catch (workerError) {
        console.warn('PDF worker failed, retrying without worker:', workerError);
        // Fallback without worker
        pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          disableWorker: true 
        }).promise;
      }
      
      const totalPages = pdf.numPages;
      let fullText = '';
      let metadata: DocumentFile['metadata'] = {
        pages: totalPages,
        wordCount: 0
      };

      // Extract PDF metadata
      try {
        const info = await pdf.getMetadata();
        if (info.info) {
          metadata.title = info.info.Title || undefined;
          metadata.author = info.info.Author || undefined;
        }
      } catch (metaError) {
        console.warn('Could not extract PDF metadata:', metaError);
      }

      // Extract text from each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        onProgress?.({
          progress: (pageNum / totalPages) * 100,
          currentPage: pageNum,
          totalPages,
          status: `Processing page ${pageNum} of ${totalPages}...`
        });

        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ')
            .trim();
          
          if (pageText) {
            fullText += pageText + '\n\n';
          }
        } catch (pageError) {
          console.warn(`Error processing page ${pageNum}:`, pageError);
          fullText += `[Error extracting page ${pageNum}]\n\n`;
        }
      }

      // Calculate word count
      metadata.wordCount = fullText.split(/\s+/).filter(word => word.length > 0).length;

      onProgress?.({
        progress: 100,
        currentPage: totalPages,
        totalPages,
        status: 'Text extraction completed'
      });

      return {
        text: fullText.trim(),
        metadata
      };

    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async extractTextFromFile(
    file: File,
    onProgress?: (progress: ExtractionProgress) => void
  ): Promise<{ text: string; metadata: DocumentFile['metadata'] }> {
    
    const fileType = file.type.toLowerCase();
    
    if (fileType === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      return this.extractTextFromPDF(file, onProgress);
    }
    
    if (fileType.startsWith('text/') || file.name.toLowerCase().endsWith('.txt')) {
      onProgress?.({
        progress: 50,
        currentPage: 1,
        totalPages: 1,
        status: 'Reading text file...'
      });
      
      const text = await file.text();
      const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
      
      onProgress?.({
        progress: 100,
        currentPage: 1,
        totalPages: 1,
        status: 'Text file processed'
      });
      
      return {
        text,
        metadata: {
          wordCount,
          pages: 1
        }
      };
    }
    
    throw new Error(`Unsupported file type: ${fileType}. Please upload a PDF or text file.`);
  }

  static createDocumentFile(file: File): DocumentFile {
    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date()
    };
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static truncateText(text: string, maxLength: number = 500): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  static extractKeyPhrases(text: string, count: number = 10): string[] {
    // Simple extraction - in production, you might use a more sophisticated NLP library
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });
    
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, count)
      .map(([word]) => word);
  }

  static chunkText(text: string, maxChunkSize: number = 4000): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentChunk.length + trimmedSentence.length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = trimmedSentence;
        } else {
          // Sentence is longer than max chunk size, split it
          chunks.push(trimmedSentence.substring(0, maxChunkSize));
        }
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }
}
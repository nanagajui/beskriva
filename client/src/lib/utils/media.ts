/**
 * Media utilities for handling audio, video, and image files
 */

// Audio conversion and manipulation
export class AudioUtils {
  static async convertBlobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to convert blob to data URL"));
      reader.readAsDataURL(blob);
    });
  }

  static async convertDataURLToBlob(dataURL: string): Promise<Blob> {
    const response = await fetch(dataURL);
    return response.blob();
  }

  static createAudioElement(src: string): HTMLAudioElement {
    const audio = new Audio();
    audio.src = src;
    audio.preload = "metadata";
    return audio;
  }

  static async getAudioDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.addEventListener("loadedmetadata", () => {
        resolve(audio.duration);
      });
      audio.addEventListener("error", () => {
        reject(new Error("Failed to load audio metadata"));
      });
      audio.src = URL.createObjectURL(file);
    });
  }

  static async compressAudio(file: File, quality: number = 0.8): Promise<Blob> {
    // Note: This is a simplified implementation
    // In a real application, you might use a library like lamejs for MP3 encoding
    return file;
  }

  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }
}

// Image utilities
export class ImageUtils {
  static async resizeImage(file: File, maxWidth: number, maxHeight: number, quality: number = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        
        canvas.width = width * ratio;
        canvas.height = height * ratio;

        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Failed to resize image"));
            }
          },
          "image/jpeg",
          quality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = URL.createObjectURL(file);
    });
  }

  static createThumbnail(file: File, size: number = 150): Promise<Blob> {
    return this.resizeImage(file, size, size, 0.7);
  }
}

// File utilities
export class FileUtils {
  static async downloadBlob(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static async saveFile(blob: Blob, filename: string): Promise<void> {
    if ("showSaveFilePicker" in window) {
      try {
        const fileHandle = await (window as any).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: "All files",
              accept: { "*/*": [] },
            },
          ],
        });
        
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        return;
      } catch (error) {
        // User cancelled or API not supported, fall back to download
      }
    }
    
    // Fallback to traditional download
    await this.downloadBlob(blob, filename);
  }

  static formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  static getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
  }

  static getMimeType(filename: string): string {
    const ext = this.getFileExtension(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      m4a: "audio/mp4",
      flac: "audio/flac",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      mp4: "video/mp4",
      webm: "video/webm",
    };
    return mimeTypes[ext] || "application/octet-stream";
  }
}

// Media recorder utilities
export class RecorderUtils {
  static async getMediaStream(constraints: MediaStreamConstraints): Promise<MediaStream> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Media recording is not supported in this browser");
    }
    
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  static getSupportedMimeTypes(): string[] {
    const types = [
      "audio/webm",
      "audio/webm;codecs=opus",
      "audio/mp4",
      "audio/mp4;codecs=mp4a.40.2",
      "audio/mpeg",
      "audio/wav",
    ];
    
    return types.filter((type) => MediaRecorder.isTypeSupported(type));
  }

  static getBestMimeType(): string {
    const supported = this.getSupportedMimeTypes();
    // Prefer webm with opus for best compression and quality
    return supported.find((type) => type.includes("webm")) || supported[0] || "audio/webm";
  }
}

// Blob URL management to prevent memory leaks
export class BlobManager {
  private static urls = new Set<string>();

  static createObjectURL(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    this.urls.add(url);
    return url;
  }

  static revokeObjectURL(url: string): void {
    if (this.urls.has(url)) {
      URL.revokeObjectURL(url);
      this.urls.delete(url);
    }
  }

  static revokeAllObjectURLs(): void {
    this.urls.forEach((url) => URL.revokeObjectURL(url));
    this.urls.clear();
  }
}

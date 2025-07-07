import { useState, useCallback } from "react";
import { FileUtils } from "@/lib/utils/media";

interface FileSystemHandle {
  kind: "file" | "directory";
  name: string;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: "file";
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: "directory";
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
}

interface FilePickerOptions {
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
  multiple?: boolean;
  excludeAcceptAllOption?: boolean;
}

interface DirectoryPickerOptions {
  mode?: "read" | "readwrite";
}

interface SaveFilePickerOptions {
  suggestedName?: string;
  types?: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
  excludeAcceptAllOption?: boolean;
}

export function useFileSystem() {
  const [isSupported, setIsSupported] = useState(() => {
    return (
      "showOpenFilePicker" in window &&
      "showSaveFilePicker" in window &&
      "showDirectoryPicker" in window
    );
  });

  const openFile = useCallback(async (options?: FilePickerOptions): Promise<File[]> => {
    if (!isSupported) {
      throw new Error("File System Access API is not supported");
    }

    try {
      const fileHandles = await (window as any).showOpenFilePicker(options);
      const files = await Promise.all(
        fileHandles.map((handle: FileSystemFileHandle) => handle.getFile())
      );
      return files;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return []; // User cancelled
      }
      throw error;
    }
  }, [isSupported]);

  const openSingleFile = useCallback(async (options?: Omit<FilePickerOptions, "multiple">): Promise<File | null> => {
    const files = await openFile({ ...options, multiple: false });
    return files[0] || null;
  }, [openFile]);

  const saveFile = useCallback(async (
    data: Blob | BufferSource | string,
    options?: SaveFilePickerOptions
  ): Promise<void> => {
    if (!isSupported) {
      // Fallback to download
      if (data instanceof Blob) {
        await FileUtils.downloadBlob(data, options?.suggestedName || "download");
      } else if (typeof data === "string") {
        const blob = new Blob([data], { type: "text/plain" });
        await FileUtils.downloadBlob(blob, options?.suggestedName || "download.txt");
      } else {
        const blob = new Blob([data]);
        await FileUtils.downloadBlob(blob, options?.suggestedName || "download");
      }
      return;
    }

    try {
      const fileHandle = await (window as any).showSaveFilePicker(options);
      const writable = await fileHandle.createWritable();
      await writable.write(data);
      await writable.close();
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return; // User cancelled
      }
      throw error;
    }
  }, [isSupported]);

  const openDirectory = useCallback(async (options?: DirectoryPickerOptions): Promise<FileSystemDirectoryHandle | null> => {
    if (!isSupported) {
      throw new Error("File System Access API is not supported");
    }

    try {
      const directoryHandle = await (window as any).showDirectoryPicker(options);
      return directoryHandle;
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        return null; // User cancelled
      }
      throw error;
    }
  }, [isSupported]);

  const readDirectory = useCallback(async (directoryHandle: FileSystemDirectoryHandle): Promise<FileSystemHandle[]> => {
    const entries: FileSystemHandle[] = [];
    for await (const [name, handle] of directoryHandle.entries()) {
      entries.push(handle);
    }
    return entries;
  }, []);

  const createFileInDirectory = useCallback(async (
    directoryHandle: FileSystemDirectoryHandle,
    fileName: string,
    data: Blob | BufferSource | string
  ): Promise<void> => {
    const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(data);
    await writable.close();
  }, []);

  const readFileFromDirectory = useCallback(async (
    directoryHandle: FileSystemDirectoryHandle,
    fileName: string
  ): Promise<File | null> => {
    try {
      const fileHandle = await directoryHandle.getFileHandle(fileName);
      return await fileHandle.getFile();
    } catch (error) {
      if ((error as Error).name === "NotFoundError") {
        return null;
      }
      throw error;
    }
  }, []);

  // Utility functions for common file types
  const saveTextFile = useCallback(async (content: string, filename?: string): Promise<void> => {
    await saveFile(content, {
      suggestedName: filename || "document.txt",
      types: [
        {
          description: "Text files",
          accept: { "text/plain": [".txt"] },
        },
      ],
    });
  }, [saveFile]);

  const saveJsonFile = useCallback(async (data: any, filename?: string): Promise<void> => {
    const content = JSON.stringify(data, null, 2);
    await saveFile(content, {
      suggestedName: filename || "data.json",
      types: [
        {
          description: "JSON files",
          accept: { "application/json": [".json"] },
        },
      ],
    });
  }, [saveFile]);

  const openTextFile = useCallback(async (): Promise<string | null> => {
    const file = await openSingleFile({
      types: [
        {
          description: "Text files",
          accept: { "text/plain": [".txt"] },
        },
      ],
    });
    
    if (!file) return null;
    return await file.text();
  }, [openSingleFile]);

  const openJsonFile = useCallback(async (): Promise<any | null> => {
    const file = await openSingleFile({
      types: [
        {
          description: "JSON files",
          accept: { "application/json": [".json"] },
        },
      ],
    });
    
    if (!file) return null;
    const text = await file.text();
    return JSON.parse(text);
  }, [openSingleFile]);

  const openImageFile = useCallback(async (): Promise<File | null> => {
    return await openSingleFile({
      types: [
        {
          description: "Image files",
          accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".bmp"],
          },
        },
      ],
    });
  }, [openSingleFile]);

  const openAudioFile = useCallback(async (): Promise<File | null> => {
    return await openSingleFile({
      types: [
        {
          description: "Audio files",
          accept: {
            "audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".flac"],
          },
        },
      ],
    });
  }, [openSingleFile]);

  return {
    isSupported,
    openFile,
    openSingleFile,
    saveFile,
    openDirectory,
    readDirectory,
    createFileInDirectory,
    readFileFromDirectory,
    saveTextFile,
    saveJsonFile,
    openTextFile,
    openJsonFile,
    openImageFile,
    openAudioFile,
  };
}

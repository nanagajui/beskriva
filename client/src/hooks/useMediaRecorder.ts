import { useState, useRef, useCallback, useEffect } from "react";
import { RecorderUtils, AudioUtils } from "@/lib/utils/media";

interface UseMediaRecorderOptions {
  audio?: boolean;
  video?: boolean;
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
  onDataAvailable?: (data: Blob) => void;
  onStop?: (data: Blob) => void;
  onError?: (error: Error) => void;
}

export function useMediaRecorder(options: UseMediaRecorderOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState("00:00");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const {
    audio = true,
    video = false,
    mimeType,
    audioBitsPerSecond = 128000,
    videoBitsPerSecond = 2500000,
    onDataAvailable,
    onStop,
    onError,
  } = options;

  const updateRecordingTime = useCallback(() => {
    if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      setRecordingTime(AudioUtils.formatTime(elapsed / 1000));
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      
      // Request media stream
      const stream = await RecorderUtils.getMediaStream({ audio, video });
      streamRef.current = stream;

      // Determine mime type
      const supportedMimeType = mimeType || RecorderUtils.getBestMimeType();

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType,
        audioBitsPerSecond,
        videoBitsPerSecond,
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          onDataAvailable?.(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: supportedMimeType });
        setRecordedBlob(blob);
        onStop?.(blob);
        
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        const error = new Error(`MediaRecorder error: ${event.error}`);
        setError(error.message);
        onError?.(error);
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      startTimeRef.current = Date.now();

      // Start timer
      intervalRef.current = setInterval(updateRecordingTime, 100);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to start recording");
      setError(error.message);
      onError?.(error);
    }
  }, [audio, video, mimeType, audioBitsPerSecond, videoBitsPerSecond, onDataAvailable, onStop, onError, updateRecordingTime]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isRecording, isPaused]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      intervalRef.current = setInterval(updateRecordingTime, 100);
    }
  }, [isRecording, isPaused, updateRecordingTime]);

  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
    setRecordingTime("00:00");
    chunksRef.current = [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isRecording,
    isPaused,
    recordingTime,
    recordedBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    isSupported: typeof MediaRecorder !== "undefined",
  };
}

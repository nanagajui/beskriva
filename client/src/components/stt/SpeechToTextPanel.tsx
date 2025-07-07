import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import FileUpload from "@/components/ui/file-upload";
import { useMediaRecorder } from "@/hooks/useMediaRecorder";
import { useSettingsStore } from "@/lib/stores/useSettingsStore";
import { useToast } from "@/hooks/use-toast";
import { transcribeAudio } from "@/lib/api/lemonfox";
import { Play, Pause, Square, Copy, Download, Info, Trash2 } from "lucide-react";

export default function SpeechToTextPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("auto");
  const [responseFormat, setResponseFormat] = useState("json");
  const [speakerLabels, setSpeakerLabels] = useState(false);
  const [translate, setTranslate] = useState(false);
  const [minSpeakers, setMinSpeakers] = useState(1);
  const [maxSpeakers, setMaxSpeakers] = useState(5);
  const [transcription, setTranscription] = useState<any>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const { apiKey } = useSettingsStore();
  const { toast } = useToast();
  const { 
    isRecording, 
    isPaused, 
    startRecording, 
    stopRecording, 
    pauseRecording, 
    resumeRecording, 
    recordingTime, 
    recordedBlob, 
    clearRecording,
    error: recordingError 
  } = useMediaRecorder({
    onStop: (blob) => {
      // Convert blob to File and set it
      const audioFile = new File([blob], `recording-${Date.now()}.webm`, { 
        type: blob.type 
      });
      setFile(audioFile);
      toast({
        title: "Recording Complete",
        description: "Audio recording saved. You can now transcribe it.",
      });
    },
    onError: (error) => {
      toast({
        title: "Recording Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleTranscribe = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure your API key in the Settings panel.",
        variant: "destructive",
      });
      return;
    }

    if (!file && !recordedBlob) {
      toast({
        title: "No Audio File",
        description: "Please select an audio file or record one to transcribe.",
        variant: "destructive",
      });
      return;
    }

    setIsTranscribing(true);
    
    try {
      // Use the uploaded file or recorded blob
      const audioFile = file || (recordedBlob ? new File([recordedBlob], `recording-${Date.now()}.webm`, { type: recordedBlob.type }) : null);
      
      if (!audioFile) {
        throw new Error("No audio file available");
      }

      const result = await transcribeAudio({
        file: audioFile,
        language: language === "auto" ? undefined : language,
        response_format: responseFormat as any,
        speaker_labels: speakerLabels,
        translate,
        min_speakers: speakerLabels ? minSpeakers : undefined,
        max_speakers: speakerLabels ? maxSpeakers : undefined,
      });
      
      setTranscription(result);
      toast({
        title: "Transcription Complete",
        description: "Your audio has been successfully transcribed.",
      });
    } catch (error) {
      toast({
        title: "Transcription Failed",
        description: error instanceof Error ? error.message : "An error occurred during transcription.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleCopy = async () => {
    try {
      const text = typeof transcription === "string" ? transcription : JSON.stringify(transcription, null, 2);
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Transcription has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy transcription.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    const text = typeof transcription === "string" ? transcription : JSON.stringify(transcription, null, 2);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcription-${Date.now()}.${responseFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Speech-to-Text Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Audio File</Label>
              <FileUpload
                accept="audio/*"
                maxSize={25 * 1024 * 1024} // 25MB
                onFileSelect={handleFileSelect}
                description="MP3, WAV, M4A, FLAC up to 25MB"
              />
              {file && (
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Recording Controls</Label>
              <div className="flex items-center space-x-3">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="flex items-center space-x-2"
                  >
                    <Play className="h-4 w-4" />
                    <span>Start Recording</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={isPaused ? resumeRecording : pauseRecording}
                      className="flex items-center space-x-2"
                    >
                      {isPaused ? (
                        <>
                          <Play className="h-4 w-4" />
                          <span>Resume</span>
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4" />
                          <span>Pause</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={stopRecording}
                      className="flex items-center space-x-2"
                    >
                      <Square className="h-4 w-4" />
                      <span>Stop</span>
                    </Button>
                  </>
                )}
                
                {recordedBlob && !isRecording && (
                  <Button
                    variant="outline"
                    onClick={clearRecording}
                    className="flex items-center space-x-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear</span>
                  </Button>
                )}
                
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {recordingTime}
                </div>
                
                {recordedBlob && !isRecording && (
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Recording ready
                  </div>
                )}
              </div>
              
              {recordingError && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                  {recordingError}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="language" className="text-sm font-medium mb-2 block">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="spanish">Spanish</SelectItem>
                    <SelectItem value="french">French</SelectItem>
                    <SelectItem value="german">German</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="format" className="text-sm font-medium mb-2 block">Response Format</Label>
                <Select value={responseFormat} onValueChange={setResponseFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON (with timestamps)</SelectItem>
                    <SelectItem value="text">Plain Text</SelectItem>
                    <SelectItem value="srt">SRT Subtitles</SelectItem>
                    <SelectItem value="vtt">VTT Subtitles</SelectItem>
                    <SelectItem value="verbose_json">Verbose JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="speaker-labels"
                    checked={speakerLabels}
                    onCheckedChange={(checked) => setSpeakerLabels(!!checked)}
                  />
                  <Label htmlFor="speaker-labels" className="text-sm">Speaker Labels</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="translate"
                    checked={translate}
                    onCheckedChange={(checked) => setTranslate(!!checked)}
                  />
                  <Label htmlFor="translate" className="text-sm">Translate to English</Label>
                </div>
              </div>

              {speakerLabels && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-speakers" className="text-sm font-medium mb-2 block">Min Speakers</Label>
                    <Input
                      id="min-speakers"
                      type="number"
                      min="1"
                      max="10"
                      value={minSpeakers}
                      onChange={(e) => setMinSpeakers(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-speakers" className="text-sm font-medium mb-2 block">Max Speakers</Label>
                    <Input
                      id="max-speakers"
                      type="number"
                      min="1"
                      max="10"
                      value={maxSpeakers}
                      onChange={(e) => setMaxSpeakers(parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={handleTranscribe}
              disabled={isTranscribing || !file}
              className="w-full"
            >
              {isTranscribing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Transcribing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Transcribe Audio
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Transcription Results</CardTitle>
              {transcription && (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {transcription ? (
              <div className="space-y-4">
                <ScrollArea className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  {responseFormat === "json" && typeof transcription === "object" ? (
                    <div className="space-y-3">
                      {transcription.segments?.map((segment: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {new Date(segment.start * 1000).toISOString().substr(14, 5)}
                          </span>
                          <div className="flex-1">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                              {segment.speaker && (
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                  [Speaker {segment.speaker}]
                                </span>
                              )} {segment.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {typeof transcription === "string" ? transcription : JSON.stringify(transcription, null, 2)}
                    </div>
                  )}
                </ScrollArea>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                      Transcription completed • {speakerLabels ? `${maxSpeakers} speakers detected` : 'No speaker detection'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>No transcription results yet. Upload an audio file and click "Transcribe Audio" to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

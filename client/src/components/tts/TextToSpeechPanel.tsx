import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import AudioPlayer from "@/components/ui/audio-player";
import { useSettingsStore } from "@/lib/stores/useSettingsStore";
import { useToast } from "@/hooks/use-toast";
import { generateSpeech } from "@/lib/api/lemonfox";
import { Play, Download, Share, CheckCircle } from "lucide-react";

// Based on Lemonfox.ai documentation - actual voice names from their TTS API
const voiceOptions = [
  { group: "English (American)", voices: [
    { value: "heart", label: "Heart" },
    { value: "bella", label: "Bella" },
    { value: "michael", label: "Michael" },
    { value: "alloy", label: "Alloy" },
    { value: "aoe", label: "Aoe" },
    { value: "dekor", label: "Dekor" },
    { value: "jessica", label: "Jessica" },
    { value: "nicole", label: "Nicole" },
    { value: "nova", label: "Nova" },
    { value: "river", label: "River" },
    { value: "sarah", label: "Sarah" },
    { value: "skye", label: "Skye" },
    { value: "echo", label: "Echo" },
    { value: "eric", label: "Eric" },
    { value: "fenrir", label: "Fenrir" },
    { value: "liam", label: "Liam" },
    { value: "onyx", label: "Onyx" },
    { value: "puck", label: "Puck" },
    { value: "adam", label: "Adam" },
    { value: "santa", label: "Santa" },
  ]},
  { group: "English (British)", voices: [
    { value: "alice", label: "Alice" },
    { value: "emma", label: "Emma" },
    { value: "isabella", label: "Isabella" },
    { value: "lily", label: "Lily" },
    { value: "daniel", label: "Daniel" },
    { value: "fable", label: "Fable" },
    { value: "george", label: "George" },
    { value: "lewis", label: "Lewis" },
  ]},
];

const languageOptions = [
  { value: "en-us", label: "English (US)" },
  { value: "en-gb", label: "English (UK)" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "hi", label: "Hindi" },
  { value: "it", label: "Italian" },
  { value: "pt-br", label: "Portuguese (Brazil)" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
];

export default function TextToSpeechPanel() {
  const [text, setText] = useState("Hello, welcome to Lemonfox AI text-to-speech service. This is a demonstration of our high-quality voice synthesis capabilities.");
  const [voice, setVoice] = useState("sarah");
  const [language, setLanguage] = useState("en-us");
  const [speed, setSpeed] = useState([1.0]);
  const [format, setFormat] = useState("mp3");
  const [wordTimestamps, setWordTimestamps] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioHistory, setAudioHistory] = useState<Array<{
    id: string;
    text: string;
    voice: string;
    url: string;
    timestamp: Date;
  }>>([]);

  const { apiKey } = useSettingsStore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure your API key in the Settings panel.",
        variant: "destructive",
      });
      return;
    }

    if (!text.trim()) {
      toast({
        title: "No Text",
        description: "Please enter some text to convert to speech.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const audioBlob = await generateSpeech({
        input: text,
        voice,
        language,
        speed: speed[0],
        response_format: format as any,
        word_timestamps: wordTimestamps,
      });
      
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      
      // Add to history
      const newItem = {
        id: Date.now().toString(),
        text: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
        voice: voiceOptions.flatMap(g => g.voices).find(v => v.value === voice)?.label || voice,
        url,
        timestamp: new Date(),
      };
      setAudioHistory(prev => [newItem, ...prev]);
      
      toast({
        title: "Speech Generated",
        description: "Your text has been successfully converted to speech.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred during speech generation.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string, filename?: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `speech-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const estimatedCost = (text.length / 1000000 * 1).toFixed(4);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Text-to-Speech Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Text to Synthesize</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to convert to speech..."
                className="min-h-[100px] resize-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {text.length} characters
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Est. cost: ${estimatedCost}
                </span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Voice</Label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {voiceOptions.map((group) => (
                    <div key={group.group}>
                      <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                        {group.group}
                      </div>
                      {group.voices.map((voice) => (
                        <SelectItem key={voice.value} value={voice.value}>
                          {voice.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Speed</Label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">0.5x</span>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  min={0.5}
                  max={4}
                  step={0.1}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">4x</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-12">
                  {speed[0].toFixed(1)}x
                </span>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Audio Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3 (Recommended)</SelectItem>
                  <SelectItem value="wav">WAV (High Quality)</SelectItem>
                  <SelectItem value="ogg">OGG (Open Source)</SelectItem>
                  <SelectItem value="aac">AAC (iOS Compatible)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="word-timestamps"
                  checked={wordTimestamps}
                  onCheckedChange={(checked) => setWordTimestamps(!!checked)}
                />
                <Label htmlFor="word-timestamps" className="text-sm">Word Timestamps</Label>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Word timestamps are only supported in English
              </div>
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !text.trim()}
              className="w-full bg-secondary hover:bg-secondary/90"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate Speech
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Audio</CardTitle>
              {audioUrl && (
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleDownload(audioUrl)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {audioUrl ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <AudioPlayer src={audioUrl} />
                  <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                    {voiceOptions.flatMap(g => g.voices).find(v => v.value === voice)?.label} • {speed[0].toFixed(1)}x speed • {format.toUpperCase()}
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                      Audio generated successfully • {text.length} characters • ${estimatedCost}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>No audio generated yet. Enter some text and click "Generate Speech" to get started.</p>
              </div>
            )}

            {audioHistory.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Generations</h3>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {audioHistory.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            const audio = new Audio(item.url);
                            audio.play();
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.text}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.voice} • {item.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownload(item.url, `speech-${item.id}.${format}`)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

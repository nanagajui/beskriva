import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import AudioPlayer from "@/components/ui/audio-player";
import { useToast } from "@/hooks/use-toast";
import { AudioProcessor, type PodcastScript, type Speaker } from "@/lib/utils/audioProcessor";
import { 
  Play, 
  Users, 
  Settings, 
  Download, 
  Share, 
  Mic,
  Clock,
  Volume2,
  Pause
} from "lucide-react";

export default function PodcastGenerator() {
  const [script, setScript] = useState("");
  const [parsedScript, setParsedScript] = useState<PodcastScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentLine, setCurrentLine] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [speed, setSpeed] = useState([1.0]);
  const [pauseBetweenSpeakers, setPauseBetweenSpeakers] = useState([0.5]);
  
  const { toast } = useToast();
  
  const handleParseScript = () => {
    if (!script.trim()) {
      toast({
        title: "No Script",
        description: "Please enter a podcast script to parse.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const parsed = AudioProcessor.parseScript(script);
      setParsedScript(parsed);
      toast({
        title: "Script Parsed",
        description: `Found ${parsed.speakers.length} speakers and ${parsed.dialogue.length} lines.`
      });
    } catch (error) {
      toast({
        title: "Parse Error",
        description: "Failed to parse the script. Please check the format.",
        variant: "destructive"
      });
    }
  };
  
  const handleGenerateAudio = async () => {
    if (!parsedScript) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    setCurrentLine(0);
    
    try {
      const result = await AudioProcessor.generateMultiSpeakerAudio(parsedScript, {
        speed: speed[0],
        pauseBetweenSpeakers: pauseBetweenSpeakers[0],
        onProgress: (progress, line) => {
          setGenerationProgress(progress);
          setCurrentLine(line);
        }
      });
      
      setAudioUrl(result.audioUrl);
      setTotalDuration(result.totalDuration);
      
      toast({
        title: "Podcast Generated",
        description: `Successfully created ${Math.round(result.totalDuration / 60)}:${String(Math.round(result.totalDuration % 60)).padStart(2, '0')} podcast.`
      });
      
    } catch (error) {
      console.error('Failed to generate podcast:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate the podcast. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = () => {
    if (!audioUrl || !parsedScript) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${parsedScript.title.replace(/[^a-zA-Z0-9]/g, '_')}_podcast.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShare = async () => {
    if (!audioUrl || !parsedScript) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: parsedScript.title,
          text: `Check out this AI-generated podcast: ${parsedScript.title}`,
          url: audioUrl
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      await navigator.clipboard.writeText(audioUrl);
      toast({ title: "URL copied to clipboard" });
    }
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };
  
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Script Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Mic className="h-5 w-5" />
            <span>Podcast Script</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Podcast Script (Format: "Speaker: dialogue")
            </Label>
            <Textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder={`# My Podcast Title

Host: Welcome to today's episode! We're discussing the future of AI.
Guest: Thanks for having me. AI is revolutionizing how we work.
Host: What excites you most about these developments?
Guest: The potential for AI to augment human creativity is incredible.`}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
          
          <div className="flex space-x-3">
            <Button onClick={handleParseScript} variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Parse Script
            </Button>
            
            {parsedScript && (
              <Button 
                onClick={handleGenerateAudio} 
                disabled={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Generating... ({currentLine}/{parsedScript.dialogue.length})
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Generate Podcast
                  </>
                )}
              </Button>
            )}
          </div>
          
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={generationProgress} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Processing line {currentLine} of {parsedScript?.dialogue.length}...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Script Analysis */}
      {parsedScript && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Speakers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Speakers ({parsedScript.speakers.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parsedScript.speakers.map((speaker) => (
                  <div key={speaker.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: speaker.color }}
                      />
                      <span className="font-medium">{speaker.name}</span>
                    </div>
                    <Badge variant="secondary">{speaker.voice}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Audio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Audio Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Speech Speed: {speed[0]}x
                </Label>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div>
                <Label className="text-sm font-medium mb-3 block">
                  Pause Between Speakers: {pauseBetweenSpeakers[0]}s
                </Label>
                <Slider
                  value={pauseBetweenSpeakers}
                  onValueChange={setPauseBetweenSpeakers}
                  min={0}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Estimated Duration</span>
                  </span>
                  <span>{formatDuration(totalDuration || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Generated Audio */}
      {audioUrl && parsedScript && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Volume2 className="h-5 w-5" />
              <span>{parsedScript.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AudioPlayer src={audioUrl} className="w-full" />
            
            <div className="flex items-center space-x-3">
              <Button onClick={handleDownload} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={handleShare} variant="outline">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <div className="flex-1" />
              <Badge variant="secondary">{formatDuration(totalDuration)}</Badge>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Dialogue Preview */}
      {parsedScript && (
        <Card>
          <CardHeader>
            <CardTitle>Dialogue Preview ({parsedScript.dialogue.length} lines)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {parsedScript.dialogue.map((line, index) => {
                  const speaker = parsedScript.speakers.find(s => s.name === line.speaker);
                  return (
                    <div key={index} className="flex space-x-3">
                      <div className="flex items-center space-x-2 min-w-[100px]">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: speaker?.color || '#gray' }}
                        />
                        <span className="text-sm font-medium">{line.speaker}:</span>
                      </div>
                      <p className="text-sm text-muted-foreground flex-1">{line.text}</p>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
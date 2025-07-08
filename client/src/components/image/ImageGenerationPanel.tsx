import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsStore } from "@/lib/stores/useSettingsStore";
import { useToast } from "@/hooks/use-toast";
import { generateImage } from "@/lib/api/lemonfox";
import { ContentAlignedImageGenerator, podcastCoverStyles, type PodcastCoverStyle } from "@/lib/utils/contentAlignedImageGen";
import { Wand2, Download, Expand, Share, Grid, List, Plus, Info, Palette, FileText } from "lucide-react";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  size: string;
}

export default function ImageGenerationPanel() {
  const [prompt, setPrompt] = useState("A serene landscape with rolling hills, a crystal-clear lake, and snow-capped mountains in the background, painted in the style of Claude Monet");
  const [negativePrompt, setNegativePrompt] = useState("blurry, low quality, distorted, watermark, text, signature");
  const [quantity, setQuantity] = useState("1");
  const [size, setSize] = useState("1024x1024");
  const [responseFormat, setResponseFormat] = useState("url");
  const [isGenerating, setIsGenerating] = useState(false);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Content-aligned generation state
  const [contentText, setContentText] = useState("");
  const [podcastTitle, setPodcastTitle] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<PodcastCoverStyle>(podcastCoverStyles[0]);
  const [customElements, setCustomElements] = useState("");

  const { apiKey } = useSettingsStore();
  const { toast } = useToast();

  const handleContentAnalysis = () => {
    if (!contentText.trim()) {
      toast({
        title: "No Content",
        description: "Please enter content to analyze for image generation.",
        variant: "destructive"
      });
      return;
    }

    const analysis = ContentAlignedImageGenerator.analyzeContent(contentText);
    toast({
      title: "Content Analyzed",
      description: `Detected theme: ${analysis.theme}, mood: ${analysis.mood}, genre: ${analysis.genre}`,
    });
  };

  const handleGeneratePodcastCover = async () => {
    if (!contentText.trim() || !podcastTitle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both content text and podcast title.",
        variant: "destructive"
      });
      return;
    }

    const customElementsArray = customElements.split(',').map(el => el.trim()).filter(el => el.length > 0);
    const generatedPrompt = ContentAlignedImageGenerator.generateCoverPrompt(
      contentText,
      podcastTitle,
      selectedStyle,
      customElementsArray.length > 0 ? customElementsArray : undefined
    );

    setPrompt(generatedPrompt);
    toast({
      title: "Prompt Generated",
      description: "Content-aligned prompt created! You can edit it before generating.",
    });
  };

  const handleGenerateContentImage = async () => {
    if (!contentText.trim()) {
      toast({
        title: "No Content",
        description: "Please provide content text to generate aligned images.",
        variant: "destructive"
      });
      return;
    }

    const generatedPrompt = ContentAlignedImageGenerator.generateContentImagePrompt(contentText, 'illustration');
    setPrompt(generatedPrompt);
    toast({
      title: "Prompt Generated",
      description: "Content-aligned illustration prompt created!",
    });
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please configure your API key in the Settings panel.",
        variant: "destructive",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "No Prompt",
        description: "Please enter a prompt to generate images.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await generateImage({
        prompt,
        negative_prompt: negativePrompt || undefined,
        n: parseInt(quantity),
        size: size as any,
        response_format: responseFormat as any,
      });
      
      const newImages: GeneratedImage[] = [];
      
      if (Array.isArray(result.data)) {
        result.data.forEach((item: any, index: number) => {
          newImages.push({
            id: `${Date.now()}-${index}`,
            url: item.url || `data:image/png;base64,${item.b64_json}`,
            prompt: prompt.substring(0, 50) + (prompt.length > 50 ? "..." : ""),
            timestamp: new Date(),
            size,
          });
        });
      }
      
      setImages(prev => [...newImages, ...prev]);
      
      toast({
        title: "Images Generated",
        description: `Successfully generated ${newImages.length} image(s).`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred during image generation.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (url: string, filename?: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `image-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const estimatedCost = (parseInt(quantity) * 0.02).toFixed(2);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center space-x-2">
            <Wand2 className="h-4 w-4" />
            <span>Manual Generation</span>
          </TabsTrigger>
          <TabsTrigger value="content-aligned" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Content-Aligned</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Image Generation Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Prompt</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    className="min-h-[80px] resize-none"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Negative Prompt (Optional)</Label>
                  <Textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="Describe what you don't want in the image..."
                    className="min-h-[60px] resize-none"
                  />
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full bg-accent hover:bg-accent/90"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Generating Images...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Images
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Number of Images</Label>
                  <Select value={quantity} onValueChange={setQuantity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 image</SelectItem>
                      <SelectItem value="2">2 images</SelectItem>
                      <SelectItem value="3">3 images</SelectItem>
                      <SelectItem value="4">4 images</SelectItem>
                      <SelectItem value="6">6 images</SelectItem>
                      <SelectItem value="8">8 images</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Image Size</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="512x512">512×512 (Square)</SelectItem>
                      <SelectItem value="768x768">768×768 (Square)</SelectItem>
                      <SelectItem value="1024x1024">1024×1024 (Square)</SelectItem>
                      <SelectItem value="1024x576">1024×576 (Landscape)</SelectItem>
                      <SelectItem value="576x1024">576×1024 (Portrait)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Response Format</Label>
                  <Select value={responseFormat} onValueChange={setResponseFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="url">URL (Faster)</SelectItem>
                      <SelectItem value="b64_json">Base64 (For embedding)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Info className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-700 dark:text-yellow-300">
                      Est. cost: ${estimatedCost}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Generated Images</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-gray-100 dark:bg-gray-800" : ""}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-gray-100 dark:bg-gray-800" : ""}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {images.length > 0 ? (
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
                {images.map((image) => (
                  <div key={image.id} className="group relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <img 
                      src={image.url} 
                      alt={image.prompt}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDownload(image.url, `image-${image.id}.png`)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => window.open(image.url, '_blank')}
                        >
                          <Expand className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({
                                title: 'Generated Image',
                                text: `Generated with prompt: ${image.prompt}`,
                                url: image.url
                              });
                            } else {
                              navigator.clipboard.writeText(image.url);
                              toast({ title: "Image URL copied to clipboard" });
                            }
                          }}
                        >
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">{image.prompt}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {image.size} • Generated {image.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <Wand2 className="h-12 w-12 mx-auto mb-2" />
                  <p>No images generated yet</p>
                  <p className="text-sm">Enter a prompt above and click "Generate Images" to create your first image.</p>
                </div>
              </div>
            )}

            {images.length > 0 && (
              <div className="mt-6 flex items-center justify-center">
                <Button variant="ghost" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Load More Images
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content-aligned" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Podcast Cover Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Podcast Cover Generator</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Podcast Title</Label>
                  <Input
                    value={podcastTitle}
                    onChange={(e) => setPodcastTitle(e.target.value)}
                    placeholder="Enter your podcast title..."
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Content Text</Label>
                  <Textarea
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    placeholder="Paste your podcast script, episode summary, or content description here..."
                    className="min-h-[120px]"
                  />
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Cover Style</Label>
                  <Select 
                    value={selectedStyle.id} 
                    onValueChange={(value) => {
                      const style = podcastCoverStyles.find(s => s.id === value);
                      if (style) setSelectedStyle(style);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {podcastCoverStyles.map((style) => (
                        <SelectItem key={style.id} value={style.id}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedStyle.description}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium mb-2 block">Custom Elements (optional)</Label>
                  <Input
                    value={customElements}
                    onChange={(e) => setCustomElements(e.target.value)}
                    placeholder="microphone, headphones, waves..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Comma-separated visual elements to include
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleContentAnalysis} variant="outline" className="flex-1">
                    <Info className="h-4 w-4 mr-2" />
                    Analyze Content
                  </Button>
                  <Button onClick={handleGeneratePodcastCover} className="flex-1">
                    <Palette className="h-4 w-4 mr-2" />
                    Generate Cover Prompt
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Content Illustration Generator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Content Illustration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Content to Illustrate</Label>
                  <Textarea
                    value={contentText}
                    onChange={(e) => setContentText(e.target.value)}
                    placeholder="Paste the content you want to create an illustration for..."
                    className="min-h-[160px]"
                  />
                </div>
                
                <div className="space-y-3">
                  <Button onClick={handleGenerateContentImage} className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Content Image Prompt
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const prompt = ContentAlignedImageGenerator.generateContentImagePrompt(contentText, 'photo');
                        setPrompt(prompt);
                        toast({ title: "Photo prompt generated!" });
                      }}
                      disabled={!contentText.trim()}
                    >
                      Photo Style
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        const prompt = ContentAlignedImageGenerator.generateContentImagePrompt(contentText, 'diagram');
                        setPrompt(prompt);
                        toast({ title: "Diagram prompt generated!" });
                      }}
                      disabled={!contentText.trim()}
                    >
                      Diagram Style
                    </Button>
                  </div>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">How it works:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• AI analyzes your content for themes and mood</li>
                    <li>• Generates contextually relevant image prompts</li>
                    <li>• Adapts visual style to content type</li>
                    <li>• Creates cohesive brand visuals</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

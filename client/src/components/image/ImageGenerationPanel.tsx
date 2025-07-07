import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSettingsStore } from "@/lib/stores/useSettingsStore";
import { useToast } from "@/hooks/use-toast";
import { generateImage } from "@/lib/api/lemonfox";
import { Wand2, Download, Expand, Share, Grid, List, Plus, Info } from "lucide-react";

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
    <div className="max-w-6xl mx-auto">
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
    </div>
  );
}

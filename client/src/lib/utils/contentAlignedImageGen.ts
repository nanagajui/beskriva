export interface ContentAnalysis {
  theme: string;
  mood: string;
  keywords: string[];
  genre: string;
  visualStyle: string;
}

export interface PodcastCoverStyle {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
  aspectRatio: string;
}

export const podcastCoverStyles: PodcastCoverStyle[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, corporate design with modern typography',
    promptTemplate: 'Professional podcast cover design, clean modern layout, corporate style, professional typography, {theme} theme, {mood} atmosphere, minimalist design, high quality',
    aspectRatio: '1:1'
  },
  {
    id: 'creative',
    name: 'Creative/Artistic',
    description: 'Bold, artistic design with creative elements',
    promptTemplate: 'Creative artistic podcast cover, bold design, artistic elements, vibrant colors, {theme} theme, {mood} mood, experimental typography, modern art style',
    aspectRatio: '1:1'
  },
  {
    id: 'tech',
    name: 'Tech/Digital',
    description: 'Modern tech aesthetic with digital elements',
    promptTemplate: 'Tech podcast cover design, digital aesthetic, modern technology theme, sleek interface, {theme} focus, {mood} vibe, futuristic elements, clean tech style',
    aspectRatio: '1:1'
  },
  {
    id: 'storytelling',
    name: 'Storytelling/Narrative',
    description: 'Narrative-driven design with story elements',
    promptTemplate: 'Storytelling podcast cover, narrative design, story elements, {theme} theme, {mood} atmosphere, book-like aesthetic, literary style, engaging visual narrative',
    aspectRatio: '1:1'
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Academic and learning-focused design',
    promptTemplate: 'Educational podcast cover design, learning theme, academic style, knowledge focus, {theme} subject, {mood} tone, educational graphics, professional learning aesthetic',
    aspectRatio: '1:1'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Fun, engaging design for entertainment content',
    promptTemplate: 'Entertainment podcast cover, fun engaging design, entertainment theme, {theme} focus, {mood} energy, vibrant colors, dynamic layout, engaging visual style',
    aspectRatio: '1:1'
  }
];

export class ContentAlignedImageGenerator {
  static analyzeContent(text: string): ContentAnalysis {
    const content = text.toLowerCase();
    
    // Theme detection
    let theme = 'general';
    if (content.includes('business') || content.includes('marketing') || content.includes('entrepreneurship')) {
      theme = 'business';
    } else if (content.includes('technology') || content.includes('tech') || content.includes('ai') || content.includes('software')) {
      theme = 'technology';
    } else if (content.includes('health') || content.includes('medical') || content.includes('wellness')) {
      theme = 'health';
    } else if (content.includes('education') || content.includes('learning') || content.includes('teaching')) {
      theme = 'education';
    } else if (content.includes('science') || content.includes('research') || content.includes('study')) {
      theme = 'science';
    }
    
    // Mood detection
    let mood = 'neutral';
    if (content.includes('exciting') || content.includes('amazing') || content.includes('incredible')) {
      mood = 'energetic';
    } else if (content.includes('calm') || content.includes('peaceful') || content.includes('serene')) {
      mood = 'calm';
    } else if (content.includes('serious') || content.includes('important') || content.includes('critical')) {
      mood = 'serious';
    } else if (content.includes('fun') || content.includes('entertaining') || content.includes('humorous')) {
      mood = 'playful';
    }
    
    // Genre detection
    let genre = 'discussion';
    if (content.includes('interview') || content.includes('conversation')) {
      genre = 'interview';
    } else if (content.includes('story') || content.includes('narrative')) {
      genre = 'storytelling';
    } else if (content.includes('news') || content.includes('current events')) {
      genre = 'news';
    } else if (content.includes('tutorial') || content.includes('how to')) {
      genre = 'educational';
    }
    
    // Extract keywords
    const keywords = this.extractKeywords(text);
    
    // Visual style recommendation
    const visualStyle = this.recommendVisualStyle(theme, mood, genre);
    
    return {
      theme,
      mood,
      keywords,
      genre,
      visualStyle
    };
  }
  
  static extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const commonWords = new Set(['that', 'this', 'with', 'have', 'will', 'been', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were']);
    
    const filteredWords = words.filter(word => !commonWords.has(word));
    
    // Count frequency
    const wordCount = new Map<string, number>();
    filteredWords.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    // Return top keywords
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }
  
  static recommendVisualStyle(theme: string, mood: string, genre: string): string {
    if (theme === 'business' && mood === 'serious') {
      return 'professional';
    } else if (theme === 'technology') {
      return 'tech';
    } else if (genre === 'storytelling') {
      return 'storytelling';
    } else if (genre === 'educational') {
      return 'educational';
    } else if (mood === 'playful' || mood === 'energetic') {
      return 'entertainment';
    } else {
      return 'creative';
    }
  }
  
  static generatePrompt(
    basePrompt: string, 
    content: string, 
    style: PodcastCoverStyle
  ): string {
    const analysis = this.analyzeContent(content);
    
    let enhancedPrompt = style.promptTemplate
      .replace('{theme}', analysis.theme)
      .replace('{mood}', analysis.mood);
    
    // Add keywords if relevant
    if (analysis.keywords.length > 0) {
      enhancedPrompt += `, featuring elements related to ${analysis.keywords.slice(0, 3).join(', ')}`;
    }
    
    // Combine with base prompt if provided
    if (basePrompt && basePrompt.trim()) {
      enhancedPrompt = `${basePrompt}, ${enhancedPrompt}`;
    }
    
    return enhancedPrompt;
  }
  
  static generateCoverPrompt(
    contentText: string,
    podcastTitle: string,
    style: PodcastCoverStyle,
    customElements?: string[]
  ): string {
    const analysis = this.analyzeContent(contentText);
    
    let enhancedPrompt = style.promptTemplate
      .replace('{theme}', analysis.theme)
      .replace('{mood}', analysis.mood);
    
    // Add podcast title context
    enhancedPrompt += `, podcast title: "${podcastTitle}"`;
    
    // Add keywords from content
    if (analysis.keywords.length > 0) {
      enhancedPrompt += `, incorporating ${analysis.keywords.slice(0, 3).join(', ')}`;
    }
    
    // Add custom elements if provided
    if (customElements && customElements.length > 0) {
      enhancedPrompt += `, including ${customElements.join(', ')}`;
    }
    
    // Add quality and format specifications
    enhancedPrompt += ', high quality, professional podcast cover design, square format, suitable for streaming platforms';
    
    return enhancedPrompt;
  }
  
  static generateContentImagePrompt(
    contentText: string,
    imageType: string = 'illustration'
  ): string {
    const analysis = this.analyzeContent(contentText);
    
    let prompt = `${imageType} representing ${analysis.theme} theme with ${analysis.mood} mood`;
    
    // Add specific content context
    if (analysis.keywords.length > 0) {
      prompt += `, featuring ${analysis.keywords.slice(0, 3).join(', ')}`;
    }
    
    // Add style based on genre
    switch (analysis.genre) {
      case 'educational':
        prompt += ', educational style, clear and informative visual design';
        break;
      case 'storytelling':
        prompt += ', narrative style, engaging visual storytelling';
        break;
      case 'interview':
        prompt += ', conversational style, professional yet approachable';
        break;
      default:
        prompt += ', modern and engaging visual style';
    }
    
    prompt += ', high quality, detailed artwork, suitable for content illustration';
    
    return prompt;
  }
}
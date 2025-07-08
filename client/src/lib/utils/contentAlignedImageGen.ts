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
    name: 'Tech/Science',
    description: 'Futuristic design with tech elements',
    promptTemplate: 'Technology podcast cover design, futuristic elements, digital art, sci-fi aesthetic, {theme} theme, {mood} atmosphere, geometric patterns, neon accents',
    aspectRatio: '1:1'
  },
  {
    id: 'conversational',
    name: 'Conversational',
    description: 'Warm, inviting design for discussion podcasts',
    promptTemplate: 'Conversational podcast cover, warm inviting design, discussion theme, friendly atmosphere, {theme} topic, {mood} feeling, speech bubbles, microphone elements',
    aspectRatio: '1:1'
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Academic style with educational elements',
    promptTemplate: 'Educational podcast cover design, academic style, learning theme, knowledge symbols, {theme} subject, {mood} atmosphere, book elements, scholarly design',
    aspectRatio: '1:1'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Fun, engaging design for entertainment content',
    promptTemplate: 'Entertainment podcast cover, fun engaging design, playful elements, dynamic composition, {theme} theme, {mood} energy, vibrant colors, entertainment industry style',
    aspectRatio: '1:1'
  }
];

export class ContentAlignedImageGenerator {
  
  static analyzeContent(text: string): ContentAnalysis {
    const lowercaseText = text.toLowerCase();
    
    // Extract keywords (simplified - in production you'd use NLP)
    const keywords = this.extractKeywords(text);
    
    // Determine theme based on content
    const theme = this.determineTheme(lowercaseText, keywords);
    
    // Determine mood
    const mood = this.determineMood(lowercaseText);
    
    // Determine genre
    const genre = this.determineGenre(lowercaseText, keywords);
    
    // Suggest visual style
    const visualStyle = this.determineVisualStyle(theme, genre, mood);
    
    return {
      theme,
      mood,
      keywords: keywords.slice(0, 10), // Top 10 keywords
      genre,
      visualStyle
    };
  }
  
  static generateCoverPrompt(
    content: string, 
    title: string,
    style: PodcastCoverStyle,
    customElements?: string[]
  ): string {
    const analysis = this.analyzeContent(content);
    
    let prompt = style.promptTemplate
      .replace('{theme}', analysis.theme)
      .replace('{mood}', analysis.mood);
    
    // Add title text overlay instruction
    prompt += `, podcast title overlay: "${title}"`;
    
    // Add content-specific elements
    if (analysis.keywords.length > 0) {
      prompt += `, visual elements related to: ${analysis.keywords.slice(0, 3).join(', ')}`;
    }
    
    // Add custom elements if provided
    if (customElements && customElements.length > 0) {
      prompt += `, additional elements: ${customElements.join(', ')}`;
    }
    
    // Add quality and format specifications
    prompt += ', high resolution, 1024x1024, professional quality, sharp details, vibrant colors';
    
    return prompt;
  }
  
  static generateContentImagePrompt(
    content: string,
    imageType: 'illustration' | 'photo' | 'diagram' | 'abstract' = 'illustration'
  ): string {
    const analysis = this.analyzeContent(content);
    
    const typeTemplates = {
      illustration: 'detailed illustration depicting',
      photo: 'realistic photograph showing',
      diagram: 'clear diagram explaining',
      abstract: 'abstract artistic representation of'
    };
    
    let prompt = `${typeTemplates[imageType]} ${analysis.theme}`;
    
    if (analysis.keywords.length > 0) {
      prompt += `, featuring ${analysis.keywords.slice(0, 3).join(', ')}`;
    }
    
    prompt += `, ${analysis.mood} atmosphere, ${analysis.visualStyle} style`;
    prompt += ', high quality, detailed, professional, 1024x1024';
    
    return prompt;
  }
  
  private static extractKeywords(text: string): string[] {
    // Simple keyword extraction (in production, use proper NLP)
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    // Count word frequency
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });
    
    // Remove common stop words
    const stopWords = new Set([
      'that', 'this', 'with', 'from', 'they', 'been', 'have', 'were', 'said', 
      'each', 'which', 'their', 'time', 'will', 'about', 'would', 'there', 
      'could', 'other', 'more', 'very', 'what', 'know', 'just', 'first',
      'into', 'over', 'think', 'also', 'your', 'work', 'life', 'only',
      'new', 'years', 'way', 'may', 'days', 'use', 'these', 'come', 'its',
      'during', 'learn', 'around', 'usually'
    ]);
    
    return Array.from(wordCount.entries())
      .filter(([word]) => !stopWords.has(word))
      .sort(([,a], [,b]) => b - a)
      .map(([word]) => word);
  }
  
  private static determineTheme(text: string, keywords: string[]): string {
    const themeKeywords = {
      technology: ['tech', 'digital', 'software', 'computer', 'internet', 'data', 'algorithm', 'artificial', 'intelligence'],
      business: ['business', 'company', 'market', 'financial', 'economic', 'startup', 'entrepreneur', 'investment'],
      health: ['health', 'medical', 'wellness', 'fitness', 'mental', 'therapy', 'doctor', 'treatment'],
      education: ['education', 'learning', 'teaching', 'school', 'university', 'knowledge', 'study', 'research'],
      science: ['science', 'research', 'discovery', 'experiment', 'theory', 'physics', 'chemistry', 'biology'],
      entertainment: ['entertainment', 'movie', 'music', 'game', 'show', 'celebrity', 'culture', 'art'],
      politics: ['politics', 'government', 'policy', 'election', 'democracy', 'society', 'public'],
      lifestyle: ['lifestyle', 'travel', 'food', 'fashion', 'personal', 'hobby', 'relationship']
    };
    
    for (const [theme, words] of Object.entries(themeKeywords)) {
      const matches = words.filter(word => 
        text.includes(word) || keywords.some(k => k.includes(word))
      ).length;
      if (matches >= 2) return theme;
    }
    
    return 'general discussion';
  }
  
  private static determineMood(text: string): string {
    const moodIndicators = {
      optimistic: ['positive', 'exciting', 'amazing', 'great', 'excellent', 'wonderful', 'success', 'growth'],
      serious: ['important', 'critical', 'significant', 'serious', 'urgent', 'concern', 'issue', 'problem'],
      curious: ['explore', 'discover', 'question', 'wonder', 'investigate', 'research', 'learn', 'understand'],
      energetic: ['dynamic', 'fast', 'quick', 'energy', 'active', 'vibrant', 'powerful', 'strong'],
      calming: ['peaceful', 'calm', 'relaxing', 'gentle', 'quiet', 'mindful', 'meditation', 'wellness']
    };
    
    for (const [mood, indicators] of Object.entries(moodIndicators)) {
      const matches = indicators.filter(indicator => text.includes(indicator)).length;
      if (matches >= 1) return mood;
    }
    
    return 'neutral';
  }
  
  private static determineGenre(text: string, keywords: string[]): string {
    if (text.includes('interview') || text.includes('conversation')) return 'interview';
    if (text.includes('news') || text.includes('current')) return 'news';
    if (text.includes('story') || text.includes('narrative')) return 'storytelling';
    if (text.includes('comedy') || text.includes('humor')) return 'comedy';
    if (text.includes('review') || text.includes('analysis')) return 'review';
    if (keywords.some(k => ['tutorial', 'how', 'guide', 'tips'].includes(k))) return 'educational';
    
    return 'discussion';
  }
  
  private static determineVisualStyle(theme: string, genre: string, mood: string): string {
    if (theme === 'technology') return 'modern minimalist';
    if (theme === 'business') return 'professional corporate';
    if (theme === 'entertainment') return 'vibrant dynamic';
    if (theme === 'science') return 'clean scientific';
    if (mood === 'energetic') return 'bold dynamic';
    if (mood === 'calming') return 'soft peaceful';
    if (genre === 'comedy') return 'playful colorful';
    
    return 'clean modern';
  }
}
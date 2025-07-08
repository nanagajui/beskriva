import { generateSpeech } from '@/lib/api/lemonfox';

export interface Speaker {
  id: string;
  name: string;
  voice: string;
  color: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  startTime?: number;
  duration?: number;
}

export interface PodcastScript {
  title: string;
  speakers: Speaker[];
  dialogue: DialogueLine[];
  totalDuration?: number;
}

export class AudioProcessor {
  
  static parseScript(scriptText: string): PodcastScript {
    const lines = scriptText.split('\n').filter(line => line.trim());
    const speakers = new Map<string, Speaker>();
    const dialogue: DialogueLine[] = [];
    
    // Extract title (first line or from [TITLE] marker)
    let title = "Untitled Podcast";
    const titleMatch = scriptText.match(/\[TITLE\]\s*(.+)/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else if (lines.length > 0) {
      title = lines[0].replace(/^#+\s*/, '').trim();
    }
    
    // Default voice assignments
    const defaultVoices = ['heart', 'bella', 'dan', 'liv', 'will', 'amy'];
    let voiceIndex = 0;
    
    // Parse dialogue lines
    for (const line of lines) {
      const speakerMatch = line.match(/^(\w+):\s*(.+)$/);
      if (speakerMatch) {
        const speakerName = speakerMatch[1];
        const text = speakerMatch[2];
        
        // Add new speaker if not seen before
        if (!speakers.has(speakerName)) {
          speakers.set(speakerName, {
            id: speakerName.toLowerCase(),
            name: speakerName,
            voice: defaultVoices[voiceIndex % defaultVoices.length],
            color: this.getColorForSpeaker(voiceIndex)
          });
          voiceIndex++;
        }
        
        dialogue.push({
          speaker: speakerName,
          text: text.trim()
        });
      }
    }
    
    return {
      title,
      speakers: Array.from(speakers.values()),
      dialogue
    };
  }
  
  static async generateMultiSpeakerAudio(
    script: PodcastScript,
    options: {
      speed?: number;
      pauseBetweenSpeakers?: number;
      onProgress?: (progress: number, currentLine: number) => void;
    } = {}
  ): Promise<{ audioUrl: string; totalDuration: number }> {
    
    const { speed = 1.0, pauseBetweenSpeakers = 0.5, onProgress } = options;
    const audioSegments: { blob: Blob; duration: number }[] = [];
    let totalDuration = 0;
    
    for (let i = 0; i < script.dialogue.length; i++) {
      const line = script.dialogue[i];
      const speaker = script.speakers.find(s => s.name === line.speaker);
      
      if (!speaker) continue;
      
      try {
        // Generate TTS for this line
        const audioBlob = await generateSpeech({
          text: line.text,
          voice: speaker.voice,
          speed,
          output_format: 'mp3'
        });
        
        // Estimate duration (rough calculation: ~150 words per minute)
        const wordCount = line.text.split(' ').length;
        const estimatedDuration = (wordCount / 150) * 60 / speed;
        
        audioSegments.push({
          blob: audioBlob,
          duration: estimatedDuration
        });
        
        totalDuration += estimatedDuration + pauseBetweenSpeakers;
        
        // Update progress
        if (onProgress) {
          onProgress((i + 1) / script.dialogue.length * 100, i + 1);
        }
        
      } catch (error) {
        console.error(`Failed to generate audio for line ${i}:`, error);
        throw error;
      }
    }
    
    // Combine audio segments
    const combinedBlob = await this.combineAudioSegments(audioSegments, pauseBetweenSpeakers);
    const audioUrl = URL.createObjectURL(combinedBlob);
    
    return { audioUrl, totalDuration };
  }
  
  private static async combineAudioSegments(
    segments: { blob: Blob; duration: number }[],
    pauseDuration: number
  ): Promise<Blob> {
    
    // For now, we'll create a simple concatenation
    // In a production app, you'd want proper audio mixing
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const buffers: AudioBuffer[] = [];
    
    // Load all audio segments
    for (const segment of segments) {
      try {
        const arrayBuffer = await segment.blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        buffers.push(audioBuffer);
      } catch (error) {
        console.error('Failed to decode audio segment:', error);
      }
    }
    
    if (buffers.length === 0) {
      throw new Error('No valid audio segments to combine');
    }
    
    // Calculate total duration and create combined buffer
    const sampleRate = buffers[0].sampleRate;
    const pauseSamples = Math.floor(pauseDuration * sampleRate);
    const totalSamples = buffers.reduce((sum, buffer) => sum + buffer.length, 0) + 
                        (buffers.length - 1) * pauseSamples;
    
    const combinedBuffer = audioContext.createBuffer(
      buffers[0].numberOfChannels,
      totalSamples,
      sampleRate
    );
    
    // Copy audio data with pauses
    let offset = 0;
    for (let i = 0; i < buffers.length; i++) {
      const buffer = buffers[i];
      
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        combinedBuffer.getChannelData(channel).set(channelData, offset);
      }
      
      offset += buffer.length;
      
      // Add pause between segments (except after last segment)
      if (i < buffers.length - 1) {
        offset += pauseSamples;
      }
    }
    
    // Convert back to blob
    return this.audioBufferToBlob(combinedBuffer);
  }
  
  private static async audioBufferToBlob(audioBuffer: AudioBuffer): Promise<Blob> {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const sampleRate = audioBuffer.sampleRate;
    
    // Create WAV file
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }
  
  private static getColorForSpeaker(index: number): string {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // emerald
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // violet
      '#06B6D4', // cyan
      '#84CC16', // lime
      '#F97316'  // orange
    ];
    return colors[index % colors.length];
  }
}
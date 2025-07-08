import { useSettingsStore } from "@/lib/stores/useSettingsStore";
import { 
  TranscriptionRequest, 
  TranscriptionResponse, 
  SpeechRequest, 
  ChatCompletionRequest, 
  ChatCompletionResponse, 
  ImageGenerationRequest, 
  ImageGenerationResponse 
} from "@shared/types";

class LemonfoxAPI {
  private getHeaders(): Record<string, string> {
    const { apiKey } = useSettingsStore.getState();
    return {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  private getBaseUrl(): string {
    const { baseUrl } = useSettingsStore.getState();
    return baseUrl;
  }

  private getTimeout(): number {
    const { timeout } = useSettingsStore.getState();
    return timeout * 1000;
  }

  async transcribeAudio(request: TranscriptionRequest): Promise<TranscriptionResponse> {
    const formData = new FormData();
    formData.append('file', request.file);
    
    if (request.language) formData.append('language', request.language);
    if (request.response_format) formData.append('response_format', request.response_format);
    if (request.speaker_labels) formData.append('speaker_labels', 'true');
    if (request.translate) formData.append('translate', 'true');
    if (request.min_speakers) formData.append('min_speakers', request.min_speakers.toString());
    if (request.max_speakers) formData.append('max_speakers', request.max_speakers.toString());
    if (request.prompt) formData.append('prompt', request.prompt);
    if (request.timestamp_granularities) {
      formData.append('timestamp_granularities', JSON.stringify(request.timestamp_granularities));
    }

    const response = await fetch(`${this.getBaseUrl()}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${useSettingsStore.getState().apiKey}`,
      },
      body: formData,
      signal: AbortSignal.timeout(this.getTimeout()),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async generateSpeech(request: SpeechRequest): Promise<Blob> {
    const response = await fetch(`${this.getBaseUrl()}/audio/speech`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.getTimeout()),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.blob();
  }

  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (request.stream) {
      return this.streamChatCompletion(request);
    }

    const response = await fetch(`${this.getBaseUrl()}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.getTimeout()),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async streamChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.getBaseUrl()}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.getTimeout()),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    let content = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            break;
          }
          
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              content += delta;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    return {
      choices: [{
        message: {
          role: 'assistant',
          content,
        },
        finish_reason: 'stop',
        index: 0,
      }],
      usage: {
        prompt_tokens: request.messages.reduce((acc, msg) => acc + Math.ceil(msg.content.length / 4), 0),
        completion_tokens: Math.ceil(content.length / 4),
        total_tokens: request.messages.reduce((acc, msg) => acc + Math.ceil(msg.content.length / 4), 0) + Math.ceil(content.length / 4),
      },
    };
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const response = await fetch(`${this.getBaseUrl()}/images/generations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.getTimeout()),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

const lemonfoxAPI = new LemonfoxAPI();

export const transcribeAudio = (request: TranscriptionRequest) => 
  lemonfoxAPI.transcribeAudio(request);

export const generateSpeech = (request: SpeechRequest) => 
  lemonfoxAPI.generateSpeech(request);

export const chatCompletion = (request: ChatCompletionRequest) => 
  lemonfoxAPI.chatCompletion(request);

export const generateImage = (request: ImageGenerationRequest) => 
  lemonfoxAPI.generateImage(request);

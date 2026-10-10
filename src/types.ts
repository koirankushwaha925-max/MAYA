export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isGreeting?: boolean;
}

export interface UserSettings {
  autoSpeak: boolean;
  voiceRate: number;
  voiceURI: string;
  soundEffectsEnabled: boolean;
  micLanguage: 'hi-IN' | 'en-IN';
}

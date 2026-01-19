export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string; // If empty, we generate a placeholder
  systemPrompt: string; // The persona
  firstMessage: string;
  createdAt: number;
}

export interface ChatSession {
  id: string;
  characterId: string;
  messages: Message[];
  lastMessageAt: number;
}

export interface UserSettings {
  userName: string;
  apiKey: string; // Stored encrypted
  apiProvider: 'openai' | 'openrouter';
  model: string; // e.g., 'gpt-4', 'mythomax-l2-13b'
  customLogoUrl?: string; // New: Allow user to paste a URL for the logo
}

export interface AppState {
  user: UserSettings;
  characters: Character[];
  sessions: ChatSession[];
  currentSessionId: string | null;
  theme: 'dark' | 'light'; // Defaulting to dark/true-black
}
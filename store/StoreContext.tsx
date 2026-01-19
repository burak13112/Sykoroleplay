import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Character, ChatSession, Message, UserSettings } from '../types';
import { decryptKey, encryptKey, loadFromStorage, saveToStorage } from '../lib/secureStorage';
import { v4 as uuidv4 } from 'uuid'; // We don't have uuid lib, so we'll use a simple helper
// Simple ID generator since we can't use 'uuid' package in this strict environment
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const INITIAL_SETTINGS: UserSettings = {
  userName: 'Guest',
  apiKey: '',
  apiProvider: 'openrouter', // Default to openrouter for cheaper/free models often found there
  model: 'mythomax-l2-13b',
  customLogoUrl: 'https://files.catbox.moe/ym7y1f.jpeg', // Set default to the provided user logo
};

interface StoreContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  characters: Character[];
  addCharacter: (char: Omit<Character, 'id' | 'createdAt'>) => void;
  deleteCharacter: (id: string) => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  startSession: (characterId: string) => void;
  addMessageToSession: (sessionId: string, role: 'user' | 'assistant', content: string) => void;
  getRawApiKey: () => string; // Returns decrypted key
  deleteSession: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State Initialization
  const [settings, setSettings] = useState<UserSettings>(() => 
    loadFromStorage('velvet_settings', INITIAL_SETTINGS)
  );
  
  const [characters, setCharacters] = useState<Character[]>(() => 
    loadFromStorage('velvet_characters', [])
  );
  
  const [sessions, setSessions] = useState<ChatSession[]>(() => 
    loadFromStorage('velvet_sessions', [])
  );
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => saveToStorage('velvet_settings', settings), [settings]);
  useEffect(() => saveToStorage('velvet_characters', characters), [characters]);
  useEffect(() => saveToStorage('velvet_sessions', sessions), [sessions]);

  // Actions
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getRawApiKey = () => {
    if (!settings.apiKey) return '';
    // If the key doesn't look like base64, it might be legacy plain text (migration handling)
    try {
      return decryptKey(settings.apiKey);
    } catch {
      return settings.apiKey;
    }
  };

  const addCharacter = (charData: Omit<Character, 'id' | 'createdAt'>) => {
    const newChar: Character = {
      ...charData,
      id: generateId(),
      createdAt: Date.now(),
    };
    setCharacters(prev => [newChar, ...prev]);
  };

  const deleteCharacter = (id: string) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
    setSessions(prev => prev.filter(s => s.characterId !== id));
    if (sessions.find(s => s.characterId === id)?.id === currentSessionId) {
      setCurrentSessionId(null);
    }
  };

  const startSession = (characterId: string) => {
    // Check if session exists
    const existing = sessions.find(s => s.characterId === characterId);
    if (existing) {
      setCurrentSessionId(existing.id);
      return;
    }

    // Create new
    const char = characters.find(c => c.id === characterId);
    if (!char) return;

    const newSession: ChatSession = {
      id: generateId(),
      characterId,
      messages: char.firstMessage ? [{
        id: generateId(),
        role: 'assistant',
        content: char.firstMessage,
        timestamp: Date.now()
      }] : [],
      lastMessageAt: Date.now()
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) setCurrentSessionId(null);
  };

  const addMessageToSession = (sessionId: string, role: 'user' | 'assistant', content: string) => {
    setSessions(prev => prev.map(s => {
      if (s.id !== sessionId) return s;
      return {
        ...s,
        lastMessageAt: Date.now(),
        messages: [
          ...s.messages,
          {
            id: generateId(),
            role,
            content,
            timestamp: Date.now()
          }
        ]
      };
    }));
  };

  return (
    <StoreContext.Provider value={{
      settings,
      updateSettings,
      characters,
      addCharacter,
      deleteCharacter,
      sessions,
      currentSessionId,
      setCurrentSessionId,
      startSession,
      addMessageToSession,
      getRawApiKey,
      deleteSession
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
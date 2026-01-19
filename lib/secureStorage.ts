/**
 * NOTE: In a real production environment, you would never store API keys 
 * in LocalStorage if high security is required. However, for a Client-Side BYOK app,
 * this is the standard pattern. We add a layer of obfuscation (XOR + Base64) 
 * so the key isn't sitting in plain text, but it is NOT mathematically secure 
 * against a dedicated attacker with access to the machine.
 */

const STORAGE_KEY = 'VELVET_APP_DATA';
const SALT = 'velvet-secure-salt-v1';

// Simple XOR obfuscation
const xorEncrypt = (text: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ SALT.charCodeAt(i % SALT.length));
  }
  return btoa(result);
};

const xorDecrypt = (encrypted: string): string => {
  try {
    const text = atob(encrypted);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ SALT.charCodeAt(i % SALT.length));
    }
    return result;
  } catch (e) {
    return '';
  }
};

export const saveToStorage = <T>(key: string, data: T) => {
  try {
    const json = JSON.stringify(data);
    localStorage.setItem(key, json);
  } catch (e) {
    console.error("Failed to save to storage", e);
  }
};

export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load from storage", e);
    return defaultValue;
  }
};

// Specialized helpers for sensitive data
export const encryptKey = (key: string) => xorEncrypt(key);
export const decryptKey = (key: string) => xorDecrypt(key);

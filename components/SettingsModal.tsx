import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, User, Zap, ImageIcon } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { encryptKey, decryptKey } from '../lib/secureStorage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, getRawApiKey } = useStore();
  const [localKey, setLocalKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLocalKey(getRawApiKey());
    }
  }, [isOpen]);

  const handleSave = () => {
    const currentStoredKey = getRawApiKey();
    if (localKey !== currentStoredKey) {
       updateSettings({ apiKey: encryptKey(localKey) });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white border border-white/50 rounded-2xl p-8 shadow-2xl shadow-blue-900/20 animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <User className="w-6 h-6 text-blue-500" /> 
            Settings
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* User Profile */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Display Name</label>
              <input
                type="text"
                value={settings.userName}
                onChange={(e) => updateSettings({ userName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="Your name"
              />
            </div>
            
            {/* Custom Logo URL */}
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" />
                Custom Logo URL (Optional)
              </label>
              <input
                type="text"
                value={settings.customLogoUrl || ''}
                onChange={(e) => updateSettings({ customLogoUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-xs"
                placeholder="https://catbox.moe/..."
              />
              <p className="text-[10px] text-slate-400 mt-1.5 ml-1">Paste an image link here to replace the sidebar logo.</p>
            </div>
          </div>

          {/* API Configuration */}
          <div className="space-y-5 pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" /> Connection Logic
            </h3>

            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-xl">
              <button
                onClick={() => updateSettings({ apiProvider: 'openrouter' })}
                className={`text-sm py-2 rounded-lg font-medium transition-all shadow-sm ${settings.apiProvider === 'openrouter' ? 'bg-white text-blue-600' : 'text-slate-500 hover:text-slate-700 bg-transparent shadow-none'}`}
              >
                OpenRouter
              </button>
              <button
                onClick={() => updateSettings({ apiProvider: 'openai' })}
                className={`text-sm py-2 rounded-lg font-medium transition-all shadow-sm ${settings.apiProvider === 'openai' ? 'bg-white text-blue-600' : 'text-slate-500 hover:text-slate-700 bg-transparent shadow-none'}`}
              >
                OpenAI
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Model ID</label>
              <input
                type="text"
                value={settings.model}
                onChange={(e) => updateSettings({ model: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm"
                placeholder="e.g. gpt-4"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">API Key</label>
              <div className="relative">
                <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                    type="password"
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm"
                    placeholder="sk-..."
                />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
              <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 font-medium leading-relaxed">
                Your keys remain locally encrypted on your device. Echo is a bridge, not a vault.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Sparkles, X, MessageCircle, User } from 'lucide-react';
import { useStore } from '../store/StoreContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CharacterCreator: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addCharacter } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    firstMessage: '',
    avatarUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.systemPrompt) return;
    
    addCharacter(formData);
    setFormData({ name: '', description: '', systemPrompt: '', firstMessage: '', avatarUrl: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-white border border-white/50 rounded-2xl shadow-2xl shadow-blue-900/10 animate-slide-up flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" /> 
            New Echo
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Identity Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            placeholder="e.g. Atlas"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-600 mb-2">Avatar URL</label>
                    <input
                        type="text"
                        value={formData.avatarUrl}
                        onChange={e => setFormData({...formData, avatarUrl: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        placeholder="https://image.url..."
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Short Description</label>
                <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. An ancient librarian of the future"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">Persona (System Prompt)</label>
                <textarea
                    value={formData.systemPrompt}
                    onChange={e => setFormData({...formData, systemPrompt: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none h-32 resize-none"
                    placeholder="Define who they are. Be creative, be specific, be bold..."
                />
                <p className="text-xs text-slate-400 mt-2 font-medium">This is the soul of your Echo.</p>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-400" /> First Message
                </label>
                <textarea
                    value={formData.firstMessage}
                    onChange={e => setFormData({...formData, firstMessage: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none h-24 resize-none"
                    placeholder="How do they say hello?"
                />
            </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50/50 rounded-b-2xl">
            <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.systemPrompt}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Awaken Echo
            </button>
        </div>
      </div>
    </div>
  );
};
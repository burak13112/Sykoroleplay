import React, { useState } from 'react';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { useStore } from '../store/StoreContext';

interface Props {
  onOpenSettings: () => void;
  onOpenCreator: () => void;
  isMobileOpen: boolean;
  closeMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({ onOpenSettings, onOpenCreator, isMobileOpen, closeMobile }) => {
  const { characters, sessions, startSession, deleteSession, currentSessionId, settings } = useStore();
  const [imgError, setImgError] = useState(false);

  // If user changes the URL in settings, reset the error state so we try to load the new one
  React.useEffect(() => {
    setImgError(false);
  }, [settings.customLogoUrl]);

  // The provided logo URL
  const DEFAULT_LOGO_URL = "https://files.catbox.moe/ym7y1f.jpeg";

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white/70 backdrop-blur-xl border-r border-white/50 shadow-xl shadow-blue-900/5 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        {/* Header - Custom Logo Area */}
        <div className="h-32 flex items-center justify-center p-6 border-b border-white/30 relative overflow-hidden">
            {/* Background Glow for Logo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-blue-400/10 blur-[50px] rounded-full pointer-events-none"></div>
            
            <div className="w-full h-full flex items-center justify-center relative z-10">
                {/* 
                   Priority 1: User defined Custom URL from Settings
                   Priority 2: The Default provided Catbox URL
                   Priority 3: SVG Fallback (only if image fails to load)
                */}
                {!imgError ? (
                    <img 
                        src={settings.customLogoUrl || DEFAULT_LOGO_URL} 
                        alt="Echo" 
                        className="max-h-24 w-auto object-contain drop-shadow-sm opacity-90 hover:opacity-100 transition-opacity duration-500 rounded-lg"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    /* SVG Replica of the provided Logo Design */
                    <svg viewBox="0 0 300 100" className="w-full h-full drop-shadow-sm select-none">
                        <defs>
                            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0" />
                                <stop offset="20%" stopColor="#bae6fd" stopOpacity="0.8" />
                                <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.8" />
                                <stop offset="80%" stopColor="#bae6fd" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#334155" />
                                <stop offset="100%" stopColor="#475569" />
                            </linearGradient>
                        </defs>
                        
                        {/* The Wave / Mountain Shape Behind */}
                        <path 
                            d="M0,65 C80,65 100,35 150,35 C200,35 220,65 300,65 L300,75 L0,75 Z" 
                            fill="url(#waveGradient)" 
                            opacity="0.6"
                        />
                         <path 
                            d="M0,70 C80,70 100,50 150,50 C200,50 220,70 300,70" 
                            fill="none" 
                            stroke="#bae6fd" 
                            strokeWidth="1"
                            opacity="0.5"
                        />

                        {/* The Text "ECHO" */}
                        <text 
                            x="150" 
                            y="75" 
                            textAnchor="middle" 
                            fontSize="72" 
                            fontFamily="'Plus Jakarta Sans', sans-serif" 
                            fontWeight="200" 
                            letterSpacing="0.25em" 
                            fill="url(#textGradient)"
                            className="drop-shadow-sm"
                        >
                            ECHO
                        </text>
                    </svg>
                )}
            </div>
        </div>

        {/* New Chat Button */}
        <div className="px-5 mb-4 mt-6">
          <button 
            onClick={() => {
                onOpenCreator();
                closeMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-blue-100 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-slate-600 hover:text-blue-600 group"
          >
            <div className="p-1 rounded-full bg-blue-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Plus className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-semibold">New Echo</span>
          </button>
        </div>

        {/* Character List */}
        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Your Echoes</p>
          
          {characters.length === 0 && (
            <div className="text-center py-10 px-4 border-2 border-dashed border-slate-100 rounded-xl mx-2">
                <p className="text-slate-500 text-sm font-medium">Silence...</p>
                <p className="text-slate-400 text-xs mt-1">Create an echo to begin.</p>
            </div>
          )}

          {characters.map(char => {
            // Find active session for this character to highlight
            const isActive = sessions.find(s => s.characterId === char.id)?.id === currentSessionId;
            const session = sessions.find(s => s.characterId === char.id);

            return (
              <div 
                key={char.id}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden ${
                    isActive 
                    ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/50' 
                    : 'hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100'
                }`}
                onClick={() => {
                    startSession(char.id);
                    closeMobile();
                }}
              >
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0 overflow-hidden shadow-inner ring-2 ring-white">
                       {char.avatarUrl ? (
                           <img src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                       ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-gradient-to-br from-slate-100 to-slate-200">
                               {char.name.charAt(0)}
                           </div>
                       )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-semibold truncate ${isActive ? 'text-blue-700' : 'text-slate-700 group-hover:text-slate-900'}`}>
                            {char.name}
                        </span>
                        <span className="text-xs text-slate-400 truncate group-hover:text-slate-500 transition-colors">
                            {char.description}
                        </span>
                    </div>
                </div>
                
                {session && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all relative z-10"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/50 bg-white/30 backdrop-blur-md">
          <button 
            onClick={onOpenSettings}
            className="flex items-center gap-3 w-full p-3 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all group"
          >
            <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
            <span className="text-sm font-medium">Settings & API</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
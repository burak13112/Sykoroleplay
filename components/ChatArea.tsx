import React, { useEffect, useRef, useState } from 'react';
import { Send, Menu, MoreVertical, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '../store/StoreContext';
import { streamCompletion } from '../lib/llm';

interface Props {
  onMenuClick: () => void;
}

export const ChatArea: React.FC<Props> = ({ onMenuClick }) => {
  const { 
    currentSessionId, 
    sessions, 
    characters, 
    addMessageToSession, 
    settings, 
    getRawApiKey 
  } = useStore();

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const currentCharacter = currentSession ? characters.find(c => c.id === currentSession.characterId) : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages, streamedContent, currentSessionId]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || !currentSessionId || !currentCharacter || isGenerating) return;
    
    const apiKey = getRawApiKey();
    if (!apiKey) {
      alert("Please enter your API Key in Settings first.");
      return;
    }

    const userMessage = input.trim();
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    
    addMessageToSession(currentSessionId, 'user', userMessage);

    setIsGenerating(true);
    setStreamedContent('');

    const contextMessages = currentSession?.messages.map(m => ({
      role: m.role,
      content: m.content
    })) || [];
    
    const apiMessages = [...contextMessages, { role: 'user', content: userMessage }];

    await streamCompletion({
      apiKey,
      provider: settings.apiProvider,
      model: settings.model,
      messages: apiMessages,
      systemPrompt: currentCharacter.systemPrompt,
      onUpdate: (chunk) => setStreamedContent(chunk),
      onFinish: (fullText) => {
        addMessageToSession(currentSessionId, 'assistant', fullText);
        setStreamedContent('');
        setIsGenerating(false);
      },
      onError: (err) => {
        console.error(err);
        setIsGenerating(false);
        setStreamedContent('');
        alert(`Generation Failed: ${err.message}`);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!currentSession || !currentCharacter) {
    return (
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-200 to-cyan-200 rounded-full blur-[100px] opacity-30 animate-pulse" />
        
        <div className="text-center space-y-6 max-w-md px-6 relative z-10 animate-fade-in">
          <div className="w-24 h-24 bg-white rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-blue-100 rotate-3 transition-transform hover:rotate-6">
             <Sparkles className="w-10 h-10 text-blue-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome to Echo</h2>
            <p className="text-slate-500 leading-relaxed">Select an echo from the sidebar or create a new persona to start a conversation.</p>
          </div>
          <button onClick={onMenuClick} className="md:hidden text-blue-500 font-semibold mt-4 hover:underline">
             Open Sidebar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
        {/* Chat Header */}
        <div className="h-20 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 backdrop-blur-xl bg-white/60 border-b border-white/50 shadow-sm">
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="md:hidden p-2 text-slate-500 hover:text-blue-600">
                    <Menu className="w-6 h-6" />
                </button>
                <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-blue-400 to-cyan-300">
                    <div className="w-full h-full rounded-full bg-white overflow-hidden">
                        {currentCharacter.avatarUrl ? (
                            <img src={currentCharacter.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm font-bold text-slate-400 bg-slate-100">
                                {currentCharacter.name[0]}
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">{currentCharacter.name}</h3>
                    <div className="flex items-center gap-1.5">
                         <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                         <p className="text-xs text-slate-500 font-medium">Resonating</p>
                    </div>
                </div>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <MoreVertical className="w-5 h-5" />
            </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
            {currentSession.messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                >
                    <div 
                        className={`max-w-[85%] md:max-w-[70%] px-6 py-4 text-sm md:text-base leading-relaxed shadow-sm transition-all duration-300 hover:shadow-md ${
                            msg.role === 'user' 
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-[2rem] rounded-br-sm' 
                            : 'bg-white text-slate-700 border border-slate-100 rounded-[2rem] rounded-bl-sm'
                        }`}
                    >
                        <span className="whitespace-pre-wrap">{msg.content}</span>
                    </div>
                </div>
            ))}

            {/* Streaming Bubble */}
            {isGenerating && (
                <div className="flex justify-start animate-fade-in">
                    <div className="max-w-[85%] md:max-w-[70%] px-6 py-4 text-sm md:text-base leading-relaxed border border-blue-200 bg-blue-50/50 text-slate-700 rounded-[2rem] rounded-bl-sm">
                        {streamedContent ? (
                            <span className="whitespace-pre-wrap">{streamedContent}</span>
                        ) : (
                            <div className="flex items-center gap-2 text-blue-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs font-semibold uppercase tracking-wide">Thinking...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-6">
            <div className="max-w-4xl mx-auto relative flex items-end gap-3 bg-white rounded-3xl p-2 shadow-xl shadow-blue-900/5 border border-white/50 ring-1 ring-slate-900/5 focus-within:ring-2 focus-within:ring-blue-400/50 transition-all duration-300">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${currentCharacter.name}...`}
                    className="w-full bg-transparent text-slate-700 placeholder-slate-400 text-base p-3 resize-none outline-none max-h-32 min-h-[50px]"
                    rows={1}
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isGenerating}
                    className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20 mb-1"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
                AI can make mistakes. Everything is an echo of imagination.
            </p>
        </div>
    </div>
  );
};
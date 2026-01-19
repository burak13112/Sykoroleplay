import React, { useState } from 'react';
import { StoreProvider } from './store/StoreContext';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SettingsModal } from './components/SettingsModal';
import { CharacterCreator } from './components/CharacterCreator';

const AppLayout: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen w-full font-sans overflow-hidden">
      <Sidebar 
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCreator={() => setIsCreatorOpen(true)}
        isMobileOpen={isMobileNavOpen}
        closeMobile={() => setIsMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col md:pl-72 h-full transition-all duration-300">
        <ChatArea onMenuClick={() => setIsMobileNavOpen(true)} />
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      
      <CharacterCreator 
        isOpen={isCreatorOpen} 
        onClose={() => setIsCreatorOpen(false)} 
      />

      {/* Mobile Overlay */}
      {isMobileNavOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppLayout />
    </StoreProvider>
  );
};

export default App;
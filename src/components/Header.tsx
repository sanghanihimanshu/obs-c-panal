
import React from 'react';
import { useOBS } from '@/context/OBSContext';
import { Video, Menu } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { isConnected, currentScene } = useOBS();

  return (
    <div className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-10 animate-fade-in">
      <div className="container mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={toggleSidebar} className="icon-btn md:hidden">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-medium">OBS Control</h1>
          </div>
        </div>
        
        {isConnected && currentScene && (
          <div className="flex items-center gap-2">
            <div className="indicator-dot indicator-green"></div>
            <span className="text-sm font-medium">Live: {currentScene}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;

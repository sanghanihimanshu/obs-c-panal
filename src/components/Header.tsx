import React from 'react';
import { useOBS } from '@/context/OBSContext';
import { Video, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const { isConnected, currentScene } = useOBS();

  return (
    <header className="h-[65px] border-b backdrop-blur-sm bg-background/50 sticky top-0 z-50">
      <div className="container h-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="font-bold text-xl">OBS Control Panel</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;

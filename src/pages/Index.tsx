
import React, { useState, useEffect } from 'react';
import { OBSProvider } from '@/context/OBSContext';
import Header from '@/components/Header';
import ConnectionForm from '@/components/ConnectionForm';
import SceneSwitcher from '@/components/SceneSwitcher';
import AudioMixer from '@/components/AudioMixer';
import StreamControls from '@/components/StreamControls';
import StatsMonitor from '@/components/StatsMonitor';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <OBSProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header toggleSidebar={toggleSidebar} />
        
        <div className="flex-1 flex">
          {/* Sidebar */}
          <div 
            className={cn(
              "w-72 h-[calc(100vh-65px)] bg-secondary/30 backdrop-blur-sm flex-shrink-0 fixed md:static left-0 top-[65px] z-20 overflow-y-auto transition-transform duration-300 ease-in-out border-r",
              {
                "translate-x-0": sidebarOpen,
                "-translate-x-full md:translate-x-0": !sidebarOpen,
              }
            )}
          >
            <div className="p-4 space-y-4 pb-20">
              <ConnectionForm />
              <StatsMonitor />
              <StreamControls />
            </div>
          </div>
          
          {/* Main Content */}
          <div className={cn(
            "flex-1 p-4 md:p-6 transition-all duration-300",
            {
              "ml-0 md:ml-72": sidebarOpen,
              "ml-0": !sidebarOpen,
            }
          )}>
            {/* Overlay for mobile sidebar when open */}
            {sidebarOpen && isMobile && (
              <div 
                className="fixed inset-0 bg-black/20 z-10 md:hidden"
                onClick={toggleSidebar}
              />
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SceneSwitcher />
              <AudioMixer />
            </div>
          </div>
        </div>
      </div>
    </OBSProvider>
  );
};

export default Index;

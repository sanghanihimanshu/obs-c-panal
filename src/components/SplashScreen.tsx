import { useEffect, useState } from 'react';
import { Video } from 'lucide-react';

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="space-y-4 text-center animate-fade-up backdrop-blur-sm p-8 rounded-lg border border-border/50">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse-ring rounded-full" />
          <Video className="w-16 h-16 mx-auto text-primary relative z-10" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          OBS Control Panel
        </h1>
        <p className="text-sm text-muted-foreground">Mobile Remote Control</p>
      </div>
    </div>
  );
}

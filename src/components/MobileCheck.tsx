import { useIsMobile } from '@/hooks/use-mobile';

export function MobileCheck({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold">Mobile Access Only</h1>
          <p className="text-muted-foreground">
            This application is designed for mobile devices only. Please open it on your smartphone or tablet.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

import React, { useState, useEffect } from 'react';
import { useOBS } from '@/context/OBSContext';
import { Layout, Monitor, EyeIcon, EyeOffIcon, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SceneSwitcher = () => {
  const { isConnected, scenes, currentScene, setCurrentScene, sources, toggleSourceVisibility, refreshAll } = useOBS();
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    if (retryCount >= 3) {
      toast.error('Max retry attempts reached. Please check OBS connection.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Refreshing OBS data...');
      await refreshAll();
      setRetryCount(0);
      console.log('Refresh complete. Scenes:', scenes);
    } catch (err) {
      console.error('Refresh failed:', err);
      setRetryCount(prev => prev + 1);
      toast.error('Failed to refresh scenes. Retrying...');
      setTimeout(handleRefresh, 1000);
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && scenes.length === 0) {
      handleRefresh();
    }
  }, [isConnected]);

  if (!isConnected) {
    return null;
  }

  return (
    <div className="glass-card p-5 animate-scale-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layout className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium">Scenes</h2>
        </div>
        <button
          onClick={handleRefresh}
          className={cn(
            "p-2 rounded-md hover:bg-secondary/50 transition-colors",
            isLoading && "animate-spin"
          )}
          disabled={isLoading}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="text-red-500 text-sm mb-4 p-2 bg-red-500/10 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-1 mb-6">
        {isLoading ? (
          <div className="text-muted-foreground text-sm py-2 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading scenes...</span>
          </div>
        ) : scenes.length > 0 ? (
          scenes.map((scene) => (
            <div
              key={scene.sceneName}
              className={cn(
                "scene-item",
                "cursor-pointer hover:bg-secondary/50 transition-colors",
                "flex items-center gap-2 py-2 px-3 rounded-md",
                {
                  "bg-secondary/70": scene.sceneName === currentScene,
                  "bg-secondary/10": scene.sceneName !== currentScene
                }
              )}
              onClick={() => {
                console.log('Switching to scene:', scene.sceneName);
                setCurrentScene(scene.sceneName);
              }}
            >
              <Monitor className="w-4 h-4" />
              <span>{scene.sceneName}</span>
            </div>
          ))
        ) : (
          <div className="text-muted-foreground text-sm py-2">
            No scenes available. Click refresh to try again.
          </div>
        )}
      </div>

      {currentScene && sources.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3 mt-6">
            <EyeIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-medium">Sources in "{currentScene}"</h2>
          </div>

          <div className="space-y-1">
            {sources.map((source) => (
              <div key={source.sceneItemId} className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-secondary/30 transition-all duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{source.sourceName || source.inputName}</span>
                </div>
                <button
                  className="icon-btn"
                  onClick={() => toggleSourceVisibility(source.sourceName || source.inputName, !source.sceneItemEnabled)}
                >
                  {source.sceneItemEnabled ? (
                    <EyeIcon className="w-4 h-4" />
                  ) : (
                    <EyeOffIcon className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SceneSwitcher;


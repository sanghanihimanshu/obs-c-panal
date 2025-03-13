
import React from 'react';
import { useOBS } from '@/context/OBSContext';
import { Layout, Monitor, EyeIcon, EyeOffIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const SceneSwitcher = () => {
  const { isConnected, scenes, currentScene, setCurrentScene, sources, toggleSourceVisibility } = useOBS();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="glass-card p-5 animate-scale-in">
      <div className="flex items-center gap-2 mb-4">
        <Layout className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-medium">Scenes</h2>
      </div>
      
      <div className="space-y-1 mb-6">
        {scenes.length > 0 ? (
          scenes.map((scene) => (
            <div
              key={scene.sceneName}
              className={cn("scene-item", {
                "active": scene.sceneName === currentScene
              })}
              onClick={() => setCurrentScene(scene.sceneName)}
            >
              <Monitor className="w-4 h-4" />
              <span>{scene.sceneName}</span>
            </div>
          ))
        ) : (
          <div className="text-muted-foreground text-sm py-2">No scenes available</div>
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

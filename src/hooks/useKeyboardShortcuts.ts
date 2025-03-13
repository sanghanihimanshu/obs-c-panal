import { useEffect } from 'react';
import { useOBS } from '@/context/OBSContext';

export const useKeyboardShortcuts = () => {
  const { scenes, setCurrentScene, isConnected } = useOBS();

  useEffect(() => {
    if (!isConnected) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Alt + number for scene switching
      if (event.altKey && !isNaN(Number(event.key))) {
        const sceneIndex = Number(event.key) - 1;
        if (sceneIndex >= 0 && sceneIndex < scenes.length) {
          setCurrentScene(scenes[sceneIndex].sceneName);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isConnected, scenes, setCurrentScene]);
};

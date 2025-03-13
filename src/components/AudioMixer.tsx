import React, { useState, useCallback } from 'react';
import { Volume2, VolumeX, Volume1, Save, RefreshCw } from 'lucide-react';
import { useOBS } from '@/context/OBSContext';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AudioMonitor from './AudioMonitor';

interface AudioPreset {
  sceneName: string;
  settings: Record<string, { volume: number; muted: boolean }>;
}

const AudioMixer = () => {
  const { isConnected, audioSources, setAudioVolume, toggleAudioMute, currentScene} = useOBS();
  const [presets, setPresets] = useState<AudioPreset[]>(() => {
    const saved = localStorage.getItem('audioPresets');
    return saved ? JSON.parse(saved) : [];
  });

  const savePreset = useCallback(() => {
    const preset: AudioPreset = {
      sceneName: currentScene,
      settings: audioSources.reduce((acc, source) => ({
        ...acc,
        [source.inputName]: {
          volume: source.volume,
          muted: source.muted
        }
      }), {})
    };

    const newPresets = [...presets.filter(p => p.sceneName !== currentScene), preset];
    setPresets(newPresets);
    localStorage.setItem('audioPresets', JSON.stringify(newPresets));
    toast.success('Audio preset saved');
  }, [currentScene, audioSources, presets]);

  const loadPreset = useCallback(() => {
    const preset = presets.find(p => p.sceneName === currentScene);
    if (!preset) return;

    Object.entries(preset.settings).forEach(([inputName, settings]) => {
      if (!settings.muted) setAudioVolume(inputName, settings.volume);
      toggleAudioMute(inputName, settings.muted);
    });
    toast.success('Audio preset loaded');
  }, [currentScene, presets, setAudioVolume, toggleAudioMute]);

  if (!isConnected) return null;

  const getVolumeIcon = (volume: number, isMuted: boolean) => {
    if (isMuted) return <VolumeX className="w-4 h-4" />;
    if (volume > 0.5) return <Volume2 className="w-4 h-4" />;
    return <Volume1 className="w-4 h-4" />;
  };

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-medium">Audio Mixer - {currentScene}</h2>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={savePreset}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Preset
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={loadPreset}
            disabled={!presets.some(p => p.sceneName === currentScene)}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Load Preset
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {audioSources.map((source) => (
          <div key={source.inputName} className="flex items-center gap-4">
            <button
              onClick={() => toggleAudioMute(source.inputName, !source.muted)}
              className={cn(
                "p-2 rounded-md hover:bg-secondary/50 transition-colors",
                source.muted && "text-muted-foreground"
              )}
            >
              {getVolumeIcon(source.volume, source.muted)}
            </button>
            
            <div className="flex-1">
              <p className="text-sm mb-1">{source.inputName}</p>
              <div className="space-y-2">
                <Slider
                  defaultValue={[source.volume * 100]}
                  max={100}
                  step={1}
                  disabled={source.muted}
                  onValueChange={(value) => setAudioVolume(source.inputName, value[0] / 100)}
                />
                <AudioMonitor sourceName={source.inputName} />
              </div>
            </div>
            
            <span className="text-sm w-12 text-right">
              {Math.round(source.volume * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioMixer;

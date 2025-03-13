
import React from 'react';
import { useOBS } from '@/context/OBSContext';
import { Volume2, VolumeX, MicIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const AudioMixer = () => {
  const { isConnected, audioSources, setAudioVolume, toggleAudioMute } = useOBS();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="glass-card p-5 animate-scale-in">
      <div className="flex items-center gap-2 mb-4">
        <Volume2 className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-medium">Audio Mixer</h2>
      </div>
      
      {audioSources.length > 0 ? (
        <div className="space-y-4">
          {audioSources.map((source) => (
            <div key={source.inputName} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MicIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium truncate max-w-[160px]">
                    {source.inputName}
                  </span>
                </div>
                <button
                  className="icon-btn"
                  onClick={() => toggleAudioMute(source.inputName, !source.muted)}
                >
                  {source.muted ? (
                    <VolumeX className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>
              
              <div className={cn("transition-opacity", {
                "opacity-50": source.muted
              })}>
                <Slider
                  value={[source.volume ? source.volume * 100 : 0]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => setAudioVolume(source.inputName, value[0] / 100)}
                  disabled={source.muted}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>{Math.round(source.volume ? source.volume * 100 : 0)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm py-2">No audio sources available</div>
      )}
    </div>
  );
};

export default AudioMixer;

import React, { useEffect, useState } from 'react';
import { useOBS } from '@/context/OBSContext';
import { cn } from '@/lib/utils';

const AudioMonitor = ({ sourceName }: { sourceName: string }) => {
  const { obs, isConnected } = useOBS();
  const [level, setLevel] = useState(0);

  useEffect(() => {
    if (!isConnected) return;

    const handleVolumeMeter = (data: any) => {
      if (data.inputs.some((input: any) => input.inputName === sourceName)) {
        const sourceData = data.inputs.find((input: any) => input.inputName === sourceName);
        setLevel(sourceData?.inputLevelMul || 0);
      }
    };

    obs.on('InputVolumeMeters', handleVolumeMeter);
    return () => {
      obs.off('InputVolumeMeters', handleVolumeMeter);
    };
  }, [isConnected, sourceName]);

  return (
    <div className="h-2 bg-secondary rounded-full overflow-hidden">
      <div 
        className={cn(
          "h-full bg-primary transition-all duration-75",
          level > 0.8 && "bg-red-500"
        )}
        style={{ width: `${Math.min(level * 100, 100)}%` }}
      />
    </div>
  );
};

export default AudioMonitor;

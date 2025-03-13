
import React from 'react';
import { useOBS } from '@/context/OBSContext';
import { Button } from '@/components/ui/button';
import { 
  VideoIcon, 
  PauseIcon, 
  PlayIcon, 
  Square as StopSquare, 
  RadioIcon,
  Video,
  Radio
} from 'lucide-react';
import { cn } from '@/lib/utils';

const StreamControls = () => {
  const { 
    isConnected,
    recordingStatus,
    streamingStatus,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    startStreaming,
    stopStreaming
  } = useOBS();

  if (!isConnected) {
    return null;
  }

  return (
    <div className="glass-card p-5 animate-scale-in">
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Video className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-medium">Recording</h2>
            
            <div className={cn("ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", {
              "bg-green-100 text-green-800": recordingStatus === 'recording',
              "bg-yellow-100 text-yellow-800": recordingStatus === 'paused',
              "bg-gray-100 text-gray-800": recordingStatus === 'stopped',
            })}>
              <div className={cn("w-1.5 h-1.5 rounded-full", {
                "bg-green-500 animate-pulse-subtle": recordingStatus === 'recording',
                "bg-yellow-500": recordingStatus === 'paused',
                "bg-gray-500": recordingStatus === 'stopped',
              })}></div>
              <span>
                {recordingStatus === 'recording' ? 'Recording' : 
                 recordingStatus === 'paused' ? 'Paused' : 'Stopped'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {recordingStatus === 'stopped' ? (
              <Button
                variant="default"
                size="sm"
                onClick={startRecording}
                className="flex-1"
              >
                <VideoIcon className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={stopRecording}
                  className="flex-1"
                >
                  <StopSquare className="w-4 h-4 mr-2" />
                  Stop
                </Button>
                
                {recordingStatus === 'recording' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={pauseRecording}
                    className="flex-1"
                  >
                    <PauseIcon className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resumeRecording}
                    className="flex-1"
                  >
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="border-t pt-6 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-medium">Streaming</h2>
            
            <div className={cn("ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", {
              "bg-green-100 text-green-800": streamingStatus === 'streaming',
              "bg-gray-100 text-gray-800": streamingStatus === 'stopped',
            })}>
              <div className={cn("w-1.5 h-1.5 rounded-full", {
                "bg-green-500 animate-pulse-subtle": streamingStatus === 'streaming',
                "bg-gray-500": streamingStatus === 'stopped',
              })}></div>
              <span>
                {streamingStatus === 'streaming' ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {streamingStatus === 'stopped' ? (
              <Button
                variant="default"
                size="sm"
                onClick={startStreaming}
                className="flex-1"
              >
                <RadioIcon className="w-4 h-4 mr-2" />
                Start Streaming
              </Button>
            ) : (
              <Button
                variant="destructive"
                size="sm"
                onClick={stopStreaming}
                className="flex-1"
              >
                <StopSquare className="w-4 h-4 mr-2" />
                Stop Streaming
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamControls;

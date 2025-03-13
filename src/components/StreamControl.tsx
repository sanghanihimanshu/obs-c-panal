import React, { useState, useEffect } from 'react';
import { useOBS } from '@/context/OBSContext';
import { Radio, Video, Pause, Play, Square, Loader2, Timer, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const StreamControl = () => {
  const [streamDuration, setStreamDuration] = useState(0);
  const [streamBitrate, setStreamBitrate] = useState(0);
  const [recordingPath, setRecordingPath] = useState('');

  const {
    isConnected,
    streamingStatus,
    recordingStatus,
    startStreaming,
    stopStreaming,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    stats,
    obs,
  } = useOBS();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (streamingStatus === 'streaming') {
      interval = setInterval(() => {
        setStreamDuration(prev => prev + 1);
        // Get stream stats
        obs.call('GetStreamStatus').then((data: any) => {
          setStreamBitrate(data.kbitsPerSec);
        });
      }, 1000);
    } else {
      setStreamDuration(0);
    }

    return () => clearInterval(interval);
  }, [streamingStatus]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isConnected) return null;

  return (
    <div className="glass-card p-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Radio className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-medium">Stream</h2>
          </div>
          
          <Button
            variant={streamingStatus === 'streaming' ? 'destructive' : 'default'}
            className="w-full"
            onClick={streamingStatus === 'streaming' ? stopStreaming : startStreaming}
          >
            {streamingStatus === 'streaming' ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop Stream
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 mr-2" />
                Start Stream
              </>
            )}
          </Button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Video className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-medium">Recording</h2>
          </div>
          
          <div className="flex gap-2">
            {recordingStatus === 'recording' || recordingStatus === 'paused' ? (
              <>
                <Button
                  variant="destructive"
                  onClick={stopRecording}
                >
                  <Square className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={recordingStatus === 'paused' ? resumeRecording : pauseRecording}
                  className="flex-1"
                >
                  {recordingStatus === 'paused' ? (
                    <Play className="w-4 h-4 mr-2" />
                  ) : (
                    <Pause className="w-4 h-4 mr-2" />
                  )}
                  {recordingStatus === 'paused' ? 'Resume' : 'Pause'}
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                className="w-full"
                onClick={startRecording}
              >
                <Video className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            )}
          </div>
        </div>
      </div>

      {streamingStatus === 'streaming' && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Duration</span>
            <span>{formatDuration(streamDuration)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Bitrate</span>
            <span>{streamBitrate.toFixed(1)} kb/s</span>
          </div>
          <Progress value={streamBitrate / 60} max={100} />
        </div>
      )}

      {/* Stats Section */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">CPU</p>
            <p className="font-medium">{stats.cpuUsage?.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Memory</p>
            <p className="font-medium">{(stats.memoryUsage || 0).toFixed(1)} MB</p>
          </div>
          <div>
            <p className="text-muted-foreground">FPS</p>
            <p className="font-medium">{stats.fps?.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Dropped Frames</p>
            <p className="font-medium">{stats.outputSkippedFrames || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamControl;

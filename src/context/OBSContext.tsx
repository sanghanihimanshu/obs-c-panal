import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import OBSWebSocket from 'obs-websocket-js';
import { toast } from 'sonner';

type OBSContextType = {
  obs: OBSWebSocket;
  isConnected: boolean;
  isConnecting: boolean;
  connect: (url: string, password?: string) => Promise<void>;
  disconnect: () => void;
  scenes: any[];
  currentScene: string;
  setCurrentScene: (sceneName: string) => Promise<void>;
  sources: any[];
  toggleSourceVisibility: (sourceName: string, visible: boolean) => Promise<void>;
  recordingStatus: string;
  streamingStatus: string;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  startStreaming: () => Promise<void>;
  stopStreaming: () => Promise<void>;
  audioSources: any[];
  setAudioVolume: (sourceName: string, volume: number) => Promise<void>;
  toggleAudioMute: (sourceName: string, mute: boolean) => Promise<void>;
  stats: {
    cpuUsage?: number;
    memoryUsage?: number;
    fps?: number;
    renderTime?: number;
    outputSkippedFrames?: number;
  };
  refreshAll: () => Promise<void>;
};

const OBSContext = createContext<OBSContextType | undefined>(undefined);

const safeNumberConversion = (value: any | undefined): number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? undefined : parsed;
  }
  
  return undefined;
};

export const OBSProvider = ({ children }: { children: ReactNode }) => {
  const [obs] = useState<OBSWebSocket>(() => new OBSWebSocket());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [scenes, setScenes] = useState<any[]>([]);
  const [currentScene, setCurrentSceneState] = useState<string>('');
  const [sources, setSources] = useState<any[]>([]);
  const [audioSources, setAudioSources] = useState<any[]>([]);
  const [recordingStatus, setRecordingStatus] = useState<string>('stopped');
  const [streamingStatus, setStreamingStatus] = useState<string>('stopped');
  const [stats, setStats] = useState<OBSContextType['stats']>({});

  const refreshScenes = async () => {
    if (!isConnected) {
      console.log('Not fetching scenes - OBS not connected');
      return;
    }

    try {
      // Get scene list with retries
      let retryCount = 0;
      const maxRetries = 3;
      let sceneList;

      while (retryCount < maxRetries) {
        try {
          sceneList = await obs.call('GetSceneList');
          break;
        } catch (error) {
          retryCount++;
          if (retryCount === maxRetries) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!sceneList?.scenes?.length) {
        throw new Error('No scenes available');
      }

      setScenes(sceneList.scenes);
      
      // Get current scene
      const currentSceneResponse = await obs.call('GetCurrentProgramScene');
      if (currentSceneResponse?.currentProgramSceneName) {
        setCurrentSceneState(currentSceneResponse.currentProgramSceneName);
        await Promise.all([
          refreshSources(),
          refreshAudioSources()
        ]);
      }

      return sceneList.scenes;
    } catch (error: any) {
      console.error('Scene loading error:', error);
      toast.error(`Scene loading failed: ${error.message}`);
      return [];
    }
  };

  const refreshSources = async () => {
    if (!isConnected || !currentScene) return;
    
    try {
      const { sceneItems } = await obs.call('GetSceneItemList', { 
        sceneName: currentScene 
      });
      setSources(sceneItems);
      
      return sceneItems;
    } catch (error) {
      console.error('Error fetching sources:', error);
      toast.error('Failed to fetch sources');
    }
  };
  
  const refreshAudioSources = async () => {
    if (!isConnected) return;
    
    try {
      const { inputs } = await obs.call('GetInputList', {
        inputKind: 'audio_input_capture'
      });
      
      const { inputs: allInputs } = await obs.call('GetInputList');
      const audioInputs = allInputs.filter((input: any) => 
        input.inputKind.includes('audio') || input.inputKind === 'browser_source'
      );
      
      const audioSourcesData = [...inputs, ...audioInputs];
      
      const sourcesWithDetails = await Promise.all(
        audioSourcesData.map(async (source: any) => {
          try {
            const inputVolumeResponse = await obs.call('GetInputVolume', {
              inputName: source.inputName
            });
            
            let muted = false;
            try {
              const inputMuteResponse = await obs.call('GetInputMute', {
                inputName: source.inputName
              });
              
              if (inputMuteResponse && typeof inputMuteResponse.inputMuted === 'boolean') {
                muted = inputMuteResponse.inputMuted;
              }
            } catch (muteError) {
              console.warn(`Could not get mute state for ${source.inputName}:`, muteError);
            }
            
            return {
              ...source,
              volume: inputVolumeResponse.inputVolumeMul,
              muted: muted
            };
          } catch {
            return source;
          }
        })
      );
      
      setAudioSources(sourcesWithDetails);
      return sourcesWithDetails;
    } catch (error) {
      console.error('Error fetching audio sources:', error);
      toast.error('Failed to fetch audio sources');
    }
  };
  
  const refreshStreamingStatus = async () => {
    if (!isConnected) return;
    
    try {
      const { outputActive } = await obs.call('GetStreamStatus');
      setStreamingStatus(outputActive ? 'streaming' : 'stopped');
    } catch (error) {
      console.error('Error fetching streaming status:', error);
    }
  };
  
  const refreshRecordingStatus = async () => {
    if (!isConnected) return;
    
    try {
      const response = await obs.call('GetRecordStatus');
      const outputActive = response.outputActive;
      
      let isPaused = false;
      if ('outputPaused' in response) {
        isPaused = Boolean(response.outputPaused);
      }
      
      if (outputActive) {
        setRecordingStatus(isPaused ? 'paused' : 'recording');
      } else {
        setRecordingStatus('stopped');
      }
    } catch (error) {
      console.error('Error fetching recording status:', error);
    }
  };
  
  const refreshStats = async () => {
    if (!isConnected) return;
    
    try {
      const statsData = await obs.call('GetStats');
      const typeSafeStats: OBSContextType['stats'] = {
        cpuUsage: safeNumberConversion(statsData.cpuUsage),
        memoryUsage: safeNumberConversion(statsData.memoryUsage),
        fps: safeNumberConversion(statsData.activeFps),
        renderTime: safeNumberConversion(statsData.averageFrameRenderTime),
        outputSkippedFrames: safeNumberConversion(statsData.renderSkippedFrames)
      };
      
      setStats(typeSafeStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  
  const refreshAll = async () => {
    if (!isConnected) return;
    
    await refreshScenes();
    await refreshSources();
    await refreshAudioSources();
    await refreshStreamingStatus();
    await refreshRecordingStatus();
    await refreshStats();
  };

  const connect = async (url: string, password?: string) => {
    if (isConnected) {
      await disconnect();
    }
    
    setIsConnecting(true);
    
    try {
      await obs.connect(url, password);
      setIsConnected(true);
      toast.success('Connected to OBS Studio');
      await refreshAll();
    } catch (error) {
      console.error('Connection failed:', error);
      toast.error('Failed to connect to OBS Studio');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    if (isConnected) {
      obs.disconnect();
      setIsConnected(false);
      setScenes([]);
      setSources([]);
      setAudioSources([]);
      setCurrentSceneState('');
      setRecordingStatus('stopped');
      setStreamingStatus('stopped');
      setStats({});
      toast.info('Disconnected from OBS Studio');
    }
  };

  const setCurrentScene = async (sceneName: string) => {
    if (!isConnected) return;
    
    try {
      await obs.call('SetCurrentProgramScene', {
        sceneName
      });
      setCurrentSceneState(sceneName);
      await refreshSources();
    } catch (error) {
      console.error('Error setting scene:', error);
      toast.error('Failed to switch scene');
    }
  };

  const toggleSourceVisibility = async (sourceName: string, visible: boolean) => {
    if (!isConnected || !currentScene) return;
    
    try {
      const { sceneItems } = await obs.call('GetSceneItemList', {
        sceneName: currentScene
      });
      
      const sceneItem = sceneItems.find((item: any) => 
        item.sourceName === sourceName || item.inputName === sourceName
      );
      
      if (!sceneItem) {
        throw new Error(`Source not found: ${sourceName}`);
      }
      
      await obs.call('SetSceneItemEnabled', {
        sceneName: currentScene,
        sceneItemId: sceneItem.sceneItemId as number,
        sceneItemEnabled: visible
      });
      
      await refreshSources();
    } catch (error) {
      console.error('Error toggling source visibility:', error);
      toast.error('Failed to toggle source visibility');
    }
  };

  const startRecording = async () => {
    if (!isConnected) return;
    
    try {
      await obs.call('StartRecord');
      setRecordingStatus('recording');
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!isConnected) return;
    
    try {
      await obs.call('StopRecord');
      setRecordingStatus('stopped');
      toast.success('Recording stopped');
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to stop recording');
    }
  };

  const pauseRecording = async () => {
    if (!isConnected) return;
    
    try {
      await obs.call('PauseRecord');
      setRecordingStatus('paused');
      toast.success('Recording paused');
    } catch (error) {
      console.error('Error pausing recording:', error);
      toast.error('Failed to pause recording');
    }
  };

  const resumeRecording = async () => {
    if (!isConnected) return;
    
    try {
      await obs.call('ResumeRecord');
      setRecordingStatus('recording');
      toast.success('Recording resumed');
    } catch (error) {
      console.error('Error resuming recording:', error);
      toast.error('Failed to resume recording');
    }
  };

  const startStreaming = async () => {
    if (!isConnected) return;
    
    try {
      await obs.call('StartStream');
      setStreamingStatus('streaming');
      toast.success('Stream started');
    } catch (error) {
      console.error('Error starting stream:', error);
      toast.error('Failed to start stream');
    }
  };

  const stopStreaming = async () => {
    if (!isConnected) return;
    
    try {
      await obs.call('StopStream');
      setStreamingStatus('stopped');
      toast.success('Stream stopped');
    } catch (error) {
      console.error('Error stopping stream:', error);
      toast.error('Failed to stop stream');
    }
  };

  const setAudioVolume = async (sourceName: string, volume: number) => {
    if (!isConnected) return;
    
    try {
      await obs.call('SetInputVolume', {
        inputName: sourceName,
        inputVolumeMul: volume
      });
      await refreshAudioSources();
    } catch (error) {
      console.error('Error setting audio volume:', error);
      toast.error('Failed to adjust volume');
    }
  };

  const toggleAudioMute = async (sourceName: string, mute: boolean) => {
    if (!isConnected) return;
    
    try {
      await obs.call('SetInputMute', {
        inputName: sourceName,
        inputMuted: mute
      });
      await refreshAudioSources();
    } catch (error) {
      console.error('Error toggling audio mute:', error);
      toast.error('Failed to toggle mute');
    }
  };

  useEffect(() => {
    const setupEventHandlers = () => {
      obs.on('ConnectionClosed', () => {
        setIsConnected(false);
        toast.error('Connection to OBS Studio closed');
      });
      
      obs.on('CurrentProgramSceneChanged', async ({ sceneName }) => {
        setCurrentSceneState(sceneName);
        await refreshSources();
      });
      
      obs.on('SceneItemEnableStateChanged', async () => {
        await refreshSources();
      });
      
      obs.on('InputVolumeChanged', async () => {
        await refreshAudioSources();
      });
      
      obs.on('InputMuteStateChanged', async () => {
        await refreshAudioSources();
      });
      
      obs.on('RecordStateChanged', async (data) => {
        const outputActive = data.outputActive;
        let isPaused = false;
        
        if ('outputPaused' in data && data.outputPaused !== undefined) {
          isPaused = Boolean(data.outputPaused);
        }
        
        if (outputActive) {
          setRecordingStatus(isPaused ? 'paused' : 'recording');
        } else {
          setRecordingStatus('stopped');
        }
      });
      
      obs.on('StreamStateChanged', async ({ outputActive }) => {
        setStreamingStatus(outputActive ? 'streaming' : 'stopped');
      });

      // Add scene-specific handlers
      obs.on('SceneCreated', refreshScenes);
      obs.on('SceneRemoved', refreshScenes);
      obs.on('SceneNameChanged', refreshScenes);
      
      // Add audio monitoring handlers
      obs.on('InputVolumeMeters', (data) => {
        console.log('Audio levels:', data);
      });
    };
    
    setupEventHandlers();
    
    const statsInterval = setInterval(() => {
      if (isConnected) {
        refreshStats();
      }
    }, 2000);
    
    return () => {
      if (isConnected) {
        obs.disconnect();
      }
      clearInterval(statsInterval);
    };
  }, []);

  useEffect(() => {
    if (isConnected && currentScene) {
      refreshSources();
    }
  }, [isConnected, currentScene]);

  // Add this effect to sync audio with scene changes
  useEffect(() => {
    if (currentScene) {
      refreshAudioSources();
    }
  }, [currentScene]);

  const contextValue: OBSContextType = {
    obs,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    scenes,
    currentScene,
    setCurrentScene,
    sources,
    toggleSourceVisibility,
    recordingStatus,
    streamingStatus,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    startStreaming,
    stopStreaming,
    audioSources,
    setAudioVolume,
    toggleAudioMute,
    stats,
    refreshAll
  };

  return (
    <OBSContext.Provider value={contextValue}>
      {children}
    </OBSContext.Provider>
  );
};

export const useOBS = (): OBSContextType => {
  const context = useContext(OBSContext);
  if (context === undefined) {
    throw new Error('useOBS must be used within an OBSProvider');
  }
  return context;
};

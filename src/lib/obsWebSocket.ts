
import OBSWebSocket from 'obs-websocket-js';

export const createOBSConnection = (url: string, password?: string): Promise<OBSWebSocket> => {
  const obs = new OBSWebSocket();
  
  return new Promise((resolve, reject) => {
    obs.connect(url, password)
      .then(() => {
        resolve(obs);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const disconnectOBS = (obs: OBSWebSocket): void => {
  obs.disconnect();
};

export const getScenes = async (obs: OBSWebSocket): Promise<any[]> => {
  try {
    const { scenes } = await obs.call('GetSceneList');
    return scenes;
  } catch (error) {
    console.error('Error fetching scenes:', error);
    return [];
  }
};

export const getCurrentScene = async (obs: OBSWebSocket): Promise<string> => {
  try {
    const { currentProgramSceneName } = await obs.call('GetCurrentProgramScene');
    return currentProgramSceneName;
  } catch (error) {
    console.error('Error fetching current scene:', error);
    return '';
  }
};

export const setCurrentScene = async (obs: OBSWebSocket, sceneName: string): Promise<void> => {
  try {
    await obs.call('SetCurrentProgramScene', {
      sceneName
    });
  } catch (error) {
    console.error('Error setting scene:', error);
    throw error;
  }
};

export const getSceneSources = async (obs: OBSWebSocket, sceneName: string): Promise<any[]> => {
  try {
    const { sceneItems } = await obs.call('GetSceneItemList', {
      sceneName
    });
    return sceneItems;
  } catch (error) {
    console.error('Error fetching scene sources:', error);
    return [];
  }
};

export const toggleSourceVisibility = async (
  obs: OBSWebSocket,
  sceneName: string,
  sourceName: string,
  visible: boolean
): Promise<void> => {
  try {
    const { sceneItems } = await obs.call('GetSceneItemList', {
      sceneName
    });
    
    const sceneItem = sceneItems.find((item: any) => 
      item.sourceName === sourceName || item.inputName === sourceName
    );
    
    if (!sceneItem) {
      throw new Error(`Source not found: ${sourceName}`);
    }
    
    await obs.call('SetSceneItemEnabled', {
      sceneName,
      sceneItemId: sceneItem.sceneItemId,
      sceneItemEnabled: visible
    });
  } catch (error) {
    console.error('Error toggling source visibility:', error);
    throw error;
  }
};

export const startRecording = async (obs: OBSWebSocket): Promise<void> => {
  try {
    await obs.call('StartRecord');
  } catch (error) {
    console.error('Error starting recording:', error);
    throw error;
  }
};

export const stopRecording = async (obs: OBSWebSocket): Promise<void> => {
  try {
    await obs.call('StopRecord');
  } catch (error) {
    console.error('Error stopping recording:', error);
    throw error;
  }
};

export const pauseRecording = async (obs: OBSWebSocket): Promise<void> => {
  try {
    await obs.call('PauseRecord');
  } catch (error) {
    console.error('Error pausing recording:', error);
    throw error;
  }
};

export const resumeRecording = async (obs: OBSWebSocket): Promise<void> => {
  try {
    await obs.call('ResumeRecord');
  } catch (error) {
    console.error('Error resuming recording:', error);
    throw error;
  }
};

export const startStreaming = async (obs: OBSWebSocket): Promise<void> => {
  try {
    await obs.call('StartStream');
  } catch (error) {
    console.error('Error starting streaming:', error);
    throw error;
  }
};

export const stopStreaming = async (obs: OBSWebSocket): Promise<void> => {
  try {
    await obs.call('StopStream');
  } catch (error) {
    console.error('Error stopping streaming:', error);
    throw error;
  }
};

export const getAudioSources = async (obs: OBSWebSocket): Promise<any[]> => {
  try {
    const { inputs } = await obs.call('GetInputList', {
      inputKind: 'audio_input_capture'
    });
    
    const { inputs: allInputs } = await obs.call('GetInputList');
    const audioInputs = allInputs.filter((input: any) => 
      input.inputKind.includes('audio') || input.inputKind === 'browser_source'
    );
    
    const audioSources = [...inputs, ...audioInputs];
    
    const sourcesWithDetails = await Promise.all(
      audioSources.map(async (source: any) => {
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
    
    return sourcesWithDetails;
  } catch (error) {
    console.error('Error fetching audio sources:', error);
    return [];
  }
};

export const setAudioVolume = async (
  obs: OBSWebSocket,
  sourceName: string,
  volume: number
): Promise<void> => {
  try {
    await obs.call('SetInputVolume', {
      inputName: sourceName,
      inputVolumeMul: volume
    });
  } catch (error) {
    console.error('Error setting audio volume:', error);
    throw error;
  }
};

export const toggleAudioMute = async (
  obs: OBSWebSocket,
  sourceName: string,
  mute: boolean
): Promise<void> => {
  try {
    await obs.call('SetInputMute', {
      inputName: sourceName,
      inputMuted: mute
    });
  } catch (error) {
    console.error('Error toggling audio mute:', error);
    throw error;
  }
};

export const getStats = async (obs: OBSWebSocket): Promise<any> => {
  try {
    const statsData = await obs.call('GetStats');
    
    const processedStats = {
      cpuUsage: typeof statsData.cpuUsage === 'number' 
        ? statsData.cpuUsage 
        : typeof statsData.cpuUsage === 'string'
          ? parseFloat(statsData.cpuUsage)
          : undefined,
          
      memoryUsage: typeof statsData.memoryUsage === 'number' 
        ? statsData.memoryUsage 
        : typeof statsData.memoryUsage === 'string'
          ? parseFloat(statsData.memoryUsage)
          : undefined,
          
      activeFps: typeof statsData.activeFps === 'number' 
        ? statsData.activeFps 
        : typeof statsData.activeFps === 'string'
          ? parseFloat(statsData.activeFps)
          : undefined,
          
      averageFrameRenderTime: typeof statsData.averageFrameRenderTime === 'number' 
        ? statsData.averageFrameRenderTime 
        : typeof statsData.averageFrameRenderTime === 'string'
          ? parseFloat(statsData.averageFrameRenderTime)
          : undefined,
          
      renderSkippedFrames: typeof statsData.renderSkippedFrames === 'number' 
        ? statsData.renderSkippedFrames 
        : typeof statsData.renderSkippedFrames === 'string'
          ? parseFloat(statsData.renderSkippedFrames)
          : undefined
    };
    
    return processedStats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {};
  }
};

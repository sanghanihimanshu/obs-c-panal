
import React, { useState } from 'react';
import { useOBS } from '@/context/OBSContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LockIcon, WifiIcon, WifiOffIcon } from 'lucide-react';

const ConnectionForm = () => {
  const { isConnected, isConnecting, connect, disconnect } = useOBS();
  const [url, setUrl] = useState('ws://localhost:4455');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      await connect(url, password);
    } else {
      disconnect();
    }
  };

  return (
    <div className="obs-panel p-6 mb-6">
      <div className="text-sm font-medium flex items-center gap-2 mb-4">
        <div className={`indicator-dot ${isConnected ? 'indicator-green' : 'indicator-red'}`}></div>
        <span>{isConnected ? 'Connected to OBS Studio' : 'Not Connected'}</span>
      </div>
      
      <form onSubmit={handleConnect} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium">
            WebSocket URL
          </label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="ws://localhost:4455"
            className="transition-all duration-200"
            disabled={isConnected || isConnecting}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium flex items-center justify-between">
            <span>Password</span>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </label>
          <div className="relative">
            <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (optional)"
              className="pl-10 transition-all duration-200"
              disabled={isConnected || isConnecting}
            />
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full transition-all duration-200"
          disabled={isConnecting}
        >
          {isConnected ? (
            <>
              <WifiOffIcon className="w-4 h-4 mr-2" />
              Disconnect
            </>
          ) : (
            <>
              <WifiIcon className="w-4 h-4 mr-2" />
              {isConnecting ? 'Connecting...' : 'Connect to OBS'}
            </>
          )}
        </Button>
      </form>
    </div>
  );
};

export default ConnectionForm;

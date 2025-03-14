
import React, { useState, useEffect } from 'react';
import { useOBS } from '@/context/OBSContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LockIcon, WifiIcon, WifiOffIcon, ShieldIcon, InfoIcon, AlertTriangleIcon } from 'lucide-react';
import { storage } from '@/lib/storage';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

const ConnectionForm = () => {
  const { isConnected, isConnecting, connect, disconnect } = useOBS();
  const [url, setUrl] = useState('ws://localhost:4455');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [allowStore, setAllowStore] = useState(false);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);
  const [bypassSecurityWarning, setBypassSecurityWarning] = useState(false);

  // Check if the connection is insecure (ws://) versus secure (wss://)
  const isInsecureConnection = url.startsWith('ws://');
  const isSecureContext = window.isSecureContext;
  const isLocalhost = url.includes('localhost') || url.includes('127.0.0.1');

  useEffect(() => {
    // Show security warning if trying to use insecure WebSocket in secure context
    // unless it's localhost which is generally allowed
    setShowSecurityWarning(isSecureContext && isInsecureConnection && !isLocalhost);
  }, [url, isSecureContext, isInsecureConnection, isLocalhost]);

  useEffect(() => {
    const savedCreds = storage.getCredentials();
    if (savedCreds) {
      setUrl(savedCreds.url);
      setPassword(savedCreds.password);
      setAllowStore(true);
      if (savedCreds.allowStore) {
        // Don't auto-connect if we're in a secure context with an insecure URL
        // unless it's localhost or the user has chosen to bypass the security warning
        const shouldAutoConnect = !(
          window.isSecureContext && 
          savedCreds.url.startsWith('ws://') && 
          !savedCreds.url.includes('localhost') && 
          !savedCreds.url.includes('127.0.0.1') && 
          !savedCreds.bypassSecurity
        );
        
        if (shouldAutoConnect) {
          connect(savedCreds.url, savedCreds.password, savedCreds.bypassSecurity);
        }
      }
    }
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) {
      if (showSecurityWarning && !bypassSecurityWarning) {
        toast.warning(
          "Connection may fail due to security restrictions. Enable 'Allow Insecure Connection' to bypass."
        );
        return;
      }
      
      await connect(url, password, bypassSecurityWarning);
      if (allowStore) {
        storage.saveCredentials({ 
          url, 
          password, 
          allowStore,
          bypassSecurity: bypassSecurityWarning 
        });
      }
    } else {
      disconnect();
      storage.clearCredentials();
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    const isNewUrlInsecure = newUrl.startsWith('ws://');
    const isLocalUrl = newUrl.includes('localhost') || newUrl.includes('127.0.0.1');
    setShowSecurityWarning(window.isSecureContext && isNewUrlInsecure && !isLocalUrl);
  };

  return (
    <div className="obs-panel p-6 mb-6">
      <div className="text-sm font-medium flex items-center gap-2 mb-4">
        <div className={`indicator-dot ${isConnected ? 'indicator-green' : 'indicator-red'}`}></div>
        <span>{isConnected ? 'Connected to OBS Studio' : 'Not Connected'}</span>
      </div>
      
      {showSecurityWarning && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangleIcon className="h-4 w-4 mr-2" />
          <AlertDescription>
            <p className="mb-2">Insecure WebSocket (ws://) connections to non-local addresses are blocked in secure contexts (HTTPS).</p>
            <div className="flex items-center mt-2 space-x-2">
              <Switch 
                id="bypass-security"
                checked={bypassSecurityWarning}
                onCheckedChange={setBypassSecurityWarning}
              />
              <label htmlFor="bypass-security" className="text-sm font-medium cursor-pointer">
                Allow Insecure Connection
              </label>
            </div>
            <p className="text-xs mt-2">Note: This may not work in all browsers. Try using wss:// instead.</p>
          </AlertDescription>
        </Alert>
      )}
      
      <form onSubmit={handleConnect} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="url" className="text-sm font-medium flex items-center gap-2">
            WebSocket URL
            {isInsecureConnection ? (
              <span className="text-xs text-orange-500 flex items-center">
                <ShieldIcon className="h-3 w-3 mr-1" /> Insecure
              </span>
            ) : (
              <span className="text-xs text-green-500 flex items-center">
                <ShieldIcon className="h-3 w-3 mr-1" /> Secure
              </span>
            )}
          </label>
          <Input
            id="url"
            value={url}
            onChange={handleUrlChange}
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
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowStore"
            checked={allowStore}
            onCheckedChange={(checked) => setAllowStore(checked as boolean)}
            className="w-4 h-4 border border-gray-300 rounded-sm focus:ring-primary focus:ring-2"
          />
          <label htmlFor="allowStore" className="text-sm text-muted-foreground">
            Remember connection details
          </label>
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

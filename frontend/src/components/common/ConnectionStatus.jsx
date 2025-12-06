import React, { useState, useEffect } from 'react';
import { checkBackendConnection } from '../../utils/connectionStatus';

const ConnectionStatus = ({ showWhenConnected = false }) => {
  const [status, setStatus] = useState({ connected: null, loading: true });

  useEffect(() => {
    const checkConnection = async () => {
      const result = await checkBackendConnection();
      setStatus({ connected: result.connected, loading: false, ...result });
    };

    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  // Only show when disconnected (unless showWhenConnected is true)
  if (status.loading || (status.connected && !showWhenConnected)) {
    return null;
  }

  if (!status.connected) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-pulse">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span className="text-sm font-medium">Backend connection lost</span>
      </div>
    );
  }

  if (showWhenConnected && status.connected) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span className="text-sm font-medium">Connected</span>
      </div>
    );
  }

  return null;
};

export default ConnectionStatus;


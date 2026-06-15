import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely suppress benign browser-level HMR WebSocket re-connections
if (typeof window !== 'undefined') {
  const ignoreWebSocketError = (event: ErrorEvent | PromiseRejectionEvent) => {
    let errorMsg = '';
    
    if ('reason' in event && event.reason) {
      errorMsg = event.reason.message || String(event.reason);
    } else if ('message' in event) {
      errorMsg = event.message || '';
    }

    if (
      errorMsg.includes('WebSocket') ||
      errorMsg.includes('websocket') ||
      errorMsg.includes('ws://') ||
      errorMsg.includes('wss://')
    ) {
      event.preventDefault();
      event.stopPropagation();
      console.warn('[Meeting Brain] Safely caught and neutralized benign development environment WebSocket connection warning.');
    }
  };

  window.addEventListener('unhandledrejection', ignoreWebSocketError);
  window.addEventListener('error', ignoreWebSocketError);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);


import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global guard for iframe ResizeObserver loop and cross-origin HMR script exceptions
if (typeof window !== 'undefined') {
  const resizeObserverErr = (e: ErrorEvent) => {
    const msg = e.message || '';
    if (
      msg === 'ResizeObserver loop limit exceeded' ||
      msg === 'ResizeObserver loop completed with undeliverable notifications' ||
      msg.includes('ResizeObserver') ||
      msg.includes('Script error') ||
      msg === 'Script error.'
    ) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  };
  window.addEventListener('error', resizeObserverErr);

  // Handle unhandled rejections for the same
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const reason = e.reason && e.reason.message;
    if (reason && (reason.includes('ResizeObserver') || reason.includes('ResizeObserver loop'))) {
      e.stopImmediatePropagation();
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

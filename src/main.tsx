import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global guard for iframe ResizeObserver loop and cross-origin HMR script exceptions
if (typeof window !== 'undefined') {
  const resizeObserverErr = (e: ErrorEvent) => {
    try {
      const msg = typeof (e?.message) === 'string' ? e.message : (e?.error && typeof e.error.message === 'string' ? e.error.message : '');
      if (
        !msg ||
        msg.includes('ResizeObserver') ||
        msg.includes('Script error') ||
        msg === 'Script error.'
      ) {
        if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
        if (e && e.preventDefault) e.preventDefault();
      }
    } catch (err) {}
  };
  window.addEventListener('error', resizeObserverErr);

  // Handle unhandled rejections for the same
  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    try {
      const reason = e.reason && (e.reason.message || e.reason);
      if (typeof reason === 'string' && (reason.includes('ResizeObserver') || reason.includes('Script error') || reason.includes('Script error.'))) {
        if (e && e.stopImmediatePropagation) e.stopImmediatePropagation();
        if (e && e.preventDefault) e.preventDefault();
      }
    } catch (err) {}
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

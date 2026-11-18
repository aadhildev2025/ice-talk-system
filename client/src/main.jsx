import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';
import './index.css';
import { setupDsuperInterceptor } from './services/dsuperStorageService';

// Initialize isolated local storage interceptor for dsuper login
setupDsuperInterceptor(axios);

// Ensure all form inputs immediately gain focus on click in Electron and desktop browsers
if (typeof window !== 'undefined') {
  const ensureFocus = (target) => {
    if (!target) return;
    const tag = target.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      try {
        if (document.activeElement !== target) target.focus();
        window.electronAPI?.focusMainWindow?.();
      } catch {}
    }
  };

  window.addEventListener('pointerdown', (e) => ensureFocus(e.target), true);
  window.addEventListener('click', (e) => ensureFocus(e.target), true);
  window.addEventListener(
    'focusin',
    () => {
      window.electronAPI?.focusMainWindow?.();
    },
    true
  );
  window.addEventListener('focus', () => {
    window.electronAPI?.focusMainWindow?.();
  });

  // Prevent mouse wheel from inadvertently scrolling/changing number input values
  window.addEventListener(
    'wheel',
    (e) => {
      if (e.target && e.target.tagName?.toLowerCase() === 'input' && e.target.type === 'number') {
        e.preventDefault();
      }
    },
    { passive: false }
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

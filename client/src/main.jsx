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
  window.addEventListener(
    'click',
    (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        e.target.focus();
      }
    },
    true
  );

  // Prevent mouse wheel from inadvertently scrolling/changing number input values
  window.addEventListener(
    'wheel',
    () => {
      if (document.activeElement && document.activeElement.type === 'number') {
        document.activeElement.blur();
      }
    },
    { passive: true }
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

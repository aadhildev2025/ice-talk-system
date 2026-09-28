import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

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

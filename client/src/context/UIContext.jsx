import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
  // 'desktop' | 'touch'
  const [uiMode, setUiMode] = useState(() => {
    return localStorage.getItem('icetalk_ui_mode') || 'desktop';
  });

  const isTouchMode = uiMode === 'touch';

  const setMode = (mode) => {
    setUiMode(mode);
    localStorage.setItem('icetalk_ui_mode', mode);
  };

  const toggleUIMode = () => {
    const next = uiMode === 'touch' ? 'desktop' : 'touch';
    setMode(next);
  };

  useEffect(() => {
    if (isTouchMode) {
      document.documentElement.classList.add('touch-mode');
    } else {
      document.documentElement.classList.remove('touch-mode');
    }
  }, [isTouchMode]);

  return (
    <UIContext.Provider
      value={{
        uiMode,
        isTouchMode,
        setMode,
        toggleUIMode,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);

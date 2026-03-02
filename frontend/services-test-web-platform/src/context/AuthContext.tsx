import React, { useState, useEffect } from 'react';
import { AuthContext } from './useAuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeApiKey, setActiveApiKey] = useState<string | null>(() => {
    return localStorage.getItem('togglemaster_api_key');
  });

  useEffect(() => {
    if (activeApiKey) {
      localStorage.setItem('togglemaster_api_key', activeApiKey);
    } else {
      localStorage.removeItem('togglemaster_api_key');
    }
  }, [activeApiKey]);

  return (
    <AuthContext.Provider value={{ activeApiKey, setActiveApiKey }}>
      {children}
    </AuthContext.Provider>
  );
};

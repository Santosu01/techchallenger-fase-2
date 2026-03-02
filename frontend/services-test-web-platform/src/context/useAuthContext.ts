import { createContext, useContext } from 'react';

export interface AuthContextType {
  activeApiKey: string | null;
  setActiveApiKey: (key: string | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

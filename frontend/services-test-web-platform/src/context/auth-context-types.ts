import { createContext } from 'react';

export interface AuthContextType {
  activeApiKey: string | null;
  setActiveApiKey: (key: string | null) => void;
  isInitialized: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

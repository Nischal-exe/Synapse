import { createContext } from 'react';

export interface User {
    id: number;
    username: string;
    email: string;
    full_name?: string;
}

export interface AuthContextType {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

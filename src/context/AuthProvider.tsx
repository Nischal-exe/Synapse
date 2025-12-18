import { createContext, useState, type ReactNode, useEffect } from 'react';
import { getMe } from '../services/api';

interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!localStorage.getItem('token');
    });
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            getMe().then(userData => {
                setUser(userData);
            }).catch(() => {
                // If fetching user fails, maybe token is invalid?
                // For now, simple error handling or logout could happen here
                console.error("Failed to fetch user");
            });
        } else {
            setUser(null);
        }
    }, [isAuthenticated]);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

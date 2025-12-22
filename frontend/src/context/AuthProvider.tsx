import { createContext, useState, type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { getMe } from '../services/api';

interface User {
    id: number;
    username: string;
    email: string;
    full_name: string;
    supabase_id?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    loading: boolean;
    logout: () => void;
    checkUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const fetchInternalUser = async () => {
        try {
            const userData = await getMe();
            setUser(userData);
        } catch (err) {
            console.error("Failed to fetch internal user profile", err);
        }
    };

    useEffect(() => {
        // Immediate synchronous check for hash before Supabase swallows it
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
            console.log("Recovery mode detected via hash, redirecting...");
            navigate('/update-password');
            // Do not return here, let session logic proceed so we are authenticated
        }

        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {

            if (session) {
                localStorage.setItem('token', session.access_token);
                setIsAuthenticated(true);
                fetchInternalUser();
            }
            setLoading(false);
        });

        // Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                navigate('/update-password');
                return;
            }

            if (session) {
                localStorage.setItem('token', session.access_token);
                setIsAuthenticated(true);
                if (!user) fetchInternalUser();
            } else {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const logout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, loading, logout, checkUser: fetchInternalUser }}>
            {children}
        </AuthContext.Provider>
    );
};

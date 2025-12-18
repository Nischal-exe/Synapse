import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await api.post('/auth/login', { username, password });
            login(response.data.access_token);
            navigate('/dashboard');
        } catch (err: unknown) {
            const errorData = err as { response?: { data?: { detail?: string } } };
            setError(errorData.response?.data?.detail || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] animate-float" />
            </div>

            <div className="max-w-md w-full glass-card p-10 relative z-10 animate-fade-in shadow-2xl">
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block group transition-transform duration-500 hover:scale-110">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 mx-auto mb-6">
                            <img className="h-10 w-10 object-contain brightness-0 invert" src={logo} alt="Synapse" />
                        </div>
                    </Link>
                    <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">Welcome Back</h2>
                    <p className="text-muted-foreground font-medium">Continue your collaborative journey with Synapse</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold p-4 rounded-xl animate-shake">
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 bg-muted/30 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
                                    placeholder="your_username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-bold text-muted-foreground">Password</label>
                                <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-12 pr-4 py-4 bg-muted/30 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2 group"
                    >
                        Sign In
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="text-center mt-10">
                    <p className="text-muted-foreground font-medium">
                        New to Synapse?{' '}
                        <Link to="/register" className="text-primary font-bold hover:underline decoration-2 underline-offset-4">
                            Create an account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react'; // Changed User to Mail

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-16 px-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[15%] left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[15%] right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-md w-full glass-card p-12 relative z-10 animate-fade-in border-primary/20 bg-white/50 dark:bg-black/50">
                <div className="text-center mb-12">
                    <Link to="/" className="inline-block mb-8 hover:scale-105 transition-transform duration-500">
                        <img className="h-24 w-auto object-contain mx-auto" src={logo} alt="Synapse" />
                    </Link>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">Welcome Back</h2>
                    <p className="text-foreground/50 font-sans text-sm font-medium tracking-wide">Enter your credentials to access your account.</p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-5 rounded-2xl animate-shake font-sans uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1 font-sans">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-14 pr-5 py-4 bg-primary/5 border border-primary/10 rounded-full text-foreground placeholder-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-sans text-sm"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] font-sans">Password</label>
                                <Link to="/forgot-password" title="Forgot Password" className="text-[10px] font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-[0.2em] font-sans">
                                    Forget Password
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Lock className="h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-14 pr-5 py-4 bg-primary/5 border border-primary/10 rounded-full text-foreground placeholder-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-sans text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full py-5 text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3"
                    >
                        Login
                    </button>
                </form>

                <div className="text-center mt-12">
                    <p className="text-foreground/40 font-sans text-sm font-medium">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary hover:underline underline-offset-8">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.png';
import { User, Mail, Lock, Calendar, UserCircle } from 'lucide-react';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [dob, setDob] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                    data: {
                        username,
                        full_name: fullName,
                        date_of_birth: dob
                    }
                }
            });

            if (error) throw error;

            navigate('/verify', { state: { email } });
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-16 px-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[5%] right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[5%] left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-xl w-full glass-card p-12 relative z-10 animate-fade-in border-primary/20 bg-white/50 dark:bg-black/50">
                <div className="text-center mb-12">
                    <Link to="/" className="inline-block mb-8 hover:scale-105 transition-transform duration-500">
                        <img className="h-24 w-auto object-contain mx-auto" src={logo} alt="Synapse" />
                    </Link>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">Register</h2>
                    <p className="text-foreground/50 font-sans text-sm uppercase tracking-widest font-bold">Join thousands of learners.</p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-5 rounded-2xl animate-shake font-sans uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1 font-sans">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <User className="h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-14 pr-5 py-4 bg-primary/5 border border-primary/10 rounded-full text-foreground placeholder-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-sans text-sm"
                                    placeholder="Enter full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1 font-sans">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <UserCircle className="h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-14 pr-5 py-4 bg-primary/5 border border-primary/10 rounded-full text-foreground placeholder-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-sans text-sm"
                                    placeholder="Choose username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

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
                                    placeholder="Enter email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1 font-sans">Date of Birth</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Calendar className="h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="date"
                                    required
                                    className="block w-full pl-14 pr-5 py-4 bg-primary/5 border border-primary/10 rounded-full text-foreground placeholder-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-sans text-sm"
                                    value={dob}
                                    onChange={(e) => setDob(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1 font-sans">Password</label>
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

                    <button
                        type="submit"
                        className="btn-primary w-full py-5 text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3 mt-4"
                    >
                        Register
                    </button>
                </form>

                <div className="text-center mt-12">
                    <p className="text-foreground/40 font-sans text-sm font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline underline-offset-8">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

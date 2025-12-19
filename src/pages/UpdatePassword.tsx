import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.png';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';

export default function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Build-in security check: Supabase sets a session when clicking the email link
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
                setError("Invalid or expired password reset link.");
            }
        });
    }, []);

    // Password validation
    const hasNumber = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const isLengthValid = password.length >= 8;

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            // Success! Redirect to dashboard or login
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-16 px-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[5%] right-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[5%] left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-md w-full glass-card p-12 relative z-10 animate-fade-in border-primary/20 bg-white/50 dark:bg-black/50 overflow-hidden">
                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <Link to="/" className="inline-block mb-8 hover:scale-105 transition-transform duration-500">
                            <img className="h-12 w-auto object-contain mx-auto" src={logo} alt="Synapse" />
                        </Link>
                        <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">Set New Password</h2>
                        <p className="text-foreground/50 font-sans text-sm uppercase tracking-widest font-bold">Secure your account entry.</p>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-5 rounded-2xl animate-shake font-sans uppercase tracking-wider mb-8">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleUpdatePassword} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1 font-sans">New Password</label>
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
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] ml-1 font-sans">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Lock className="h-4 w-4 text-foreground/30 group-focus-within:text-primary transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-14 pr-5 py-4 bg-primary/5 border border-primary/10 rounded-full text-foreground placeholder-foreground/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-sans text-sm"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Complexity Indicators */}
                        <div className="space-y-3 bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                            <h4 className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] font-sans mb-4">Requirements</h4>
                            <div className={`flex items-center text-xs font-sans ${isLengthValid ? 'text-primary' : 'text-foreground/30'}`}>
                                <CheckCircle2 className={`w-3.5 h-3.5 mr-2 transition-colors ${isLengthValid ? 'text-primary' : 'text-foreground/10'}`} />
                                8+ characters
                            </div>
                            <div className={`flex items-center text-xs font-sans ${hasNumber ? 'text-primary' : 'text-foreground/30'}`}>
                                <CheckCircle2 className={`w-3.5 h-3.5 mr-2 transition-colors ${hasNumber ? 'text-primary' : 'text-foreground/10'}`} />
                                At least one number
                            </div>
                            <div className={`flex items-center text-xs font-sans ${hasUpper ? 'text-primary' : 'text-foreground/30'}`}>
                                <CheckCircle2 className={`w-3.5 h-3.5 mr-2 transition-colors ${hasUpper ? 'text-primary' : 'text-foreground/10'}`} />
                                One uppercase letter
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !hasNumber || !hasUpper || !isLengthValid}
                            className="btn-primary w-full py-5 text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? "Updating..." : "Update Password"}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

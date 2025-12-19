import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import logo from '../assets/logo.png';
import { ChevronLeft, ArrowRight, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });

            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset email');
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

            <div className="max-w-md w-full glass-card p-12 relative z-10 animate-fade-in border-primary/20 bg-white/50 dark:bg-black/50">
                <div className="relative z-10">
                    <div className="text-center mb-10">
                        <Link to="/login" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-colors absolute left-0 -top-4 font-sans focus:outline-none">
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                            Back to Login
                        </Link>
                        <Link to="/" className="inline-block mb-8 hover:scale-105 transition-transform duration-500">
                            <img className="h-12 w-auto object-contain mx-auto" src={logo} alt="Synapse" />
                        </Link>
                        <h2 className="text-4xl font-bold tracking-tight text-foreground mb-4">Reset Password</h2>
                        <p className="text-foreground/50 font-sans text-sm uppercase tracking-widest font-bold px-4">Secure your link via transmission.</p>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold p-5 rounded-2xl animate-shake font-sans uppercase tracking-wider mb-8">
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center bg-primary/5 border border-primary/10 p-10 rounded-[2.5rem] animate-fade-in">
                            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-8 animate-pulse" />
                            <h3 className="text-2xl font-bold text-foreground mb-4">Transmission Sent</h3>
                            <p className="text-foreground/60 text-sm font-sans leading-relaxed mb-10">
                                A synchronization link has been dispatched to <br /> <strong>{email}</strong>
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="text-primary font-black uppercase tracking-widest text-[10px] font-sans hover:underline underline-offset-8 transition-all"
                            >
                                Return to Entry Point
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleResetRequest} className="space-y-8">
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
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-5 text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? "Dispatching..." : "Send Reset Link"}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

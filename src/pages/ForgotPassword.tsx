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
                redirectTo: `${window.location.origin}/update-password`,
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
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-[32px] border border-border backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <Link to="/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors absolute left-0 -top-2">
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back to Login
                        </Link>
                        <img className="mx-auto h-12 w-auto object-contain brightness-0 invert mb-6" src={logo} alt="Synapse" />
                        <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">
                            Reset Password
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Enter your email to receive a password reset link
                        </p>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-xl text-sm font-medium animate-shake mb-6 flex items-start">
                            <span className="mr-2">⚠️</span>
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="text-center bg-green-500/10 border border-green-500/20 p-6 rounded-2xl">
                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <h3 className="text-xl font-bold text-foreground mb-2">Check your email</h3>
                            <p className="text-muted-foreground text-sm">
                                We have sent a password reset link to <strong>{email}</strong>.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="mt-6 text-primary font-bold hover:underline"
                            >
                                Return to Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleResetRequest} className="space-y-6">
                            <div className="group">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-1.5 block group-focus-within:text-foreground transition-colors">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-12 pr-5 py-4 bg-muted/50 border border-input rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all font-medium"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-sm font-black rounded-2xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none transition-all active:scale-95 shadow-xl shadow-primary/20 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {loading ? "Sending..." : "Send Reset Link"}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 bg-card p-10 rounded-[32px] border border-border backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-center mb-8">
                        <img className="mx-auto h-12 w-auto object-contain brightness-0 invert mb-6" src={logo} alt="Synapse" />
                        <h2 className="text-3xl font-black tracking-tight text-foreground mb-2">
                            Set New Password
                        </h2>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-xl text-sm font-medium animate-shake mb-6 flex items-start">
                            <span className="mr-2">⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="space-y-4">
                            <div className="group">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-1.5 block group-focus-within:text-foreground transition-colors">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-5 py-4 bg-muted/50 border border-input rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all font-medium"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-1.5 block group-focus-within:text-foreground transition-colors">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-5 py-4 bg-muted/50 border border-input rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all font-medium"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Complexity Indicators */}
                        <div className="space-y-2 bg-muted/30 p-4 rounded-xl border border-border">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Password Requirements</h4>
                            <div className={`flex items-center text-sm ${isLengthValid ? 'text-green-400' : 'text-muted-foreground'} transition-colors`}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                At least 8 characters
                            </div>
                            <div className={`flex items-center text-sm ${hasNumber ? 'text-green-400' : 'text-muted-foreground'} transition-colors`}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                At least one number
                            </div>
                            <div className={`flex items-center text-sm ${hasUpper ? 'text-green-400' : 'text-muted-foreground'} transition-colors`}>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                At least one uppercase letter
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !hasNumber || !hasUpper || !isLengthValid}
                            className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-sm font-black rounded-2xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none transition-all active:scale-95 shadow-xl shadow-primary/20 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? "Updating..." : "Update Password"}
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

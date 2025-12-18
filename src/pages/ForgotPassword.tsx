import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';
import { ChevronLeft, ArrowRight, CheckCircle2, Lock, Mail, KeyRound } from 'lucide-react';

export default function ForgotPassword() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Password validation regex
    const hasNumber = /\d/.test(newPassword);
    const hasUpper = /[A-Z]/.test(newPassword);
    const isLengthValid = newPassword.length >= 8;

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await api.post('/auth/verify-reset-otp', { email, otp });
            setStep(3);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!hasNumber || !hasUpper || !isLengthValid) {
            setError("Password does not meet complexity requirements");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, new_password: newPassword });
            // Show success and redirect
            navigate('/login');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to reset password');
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
                            {step === 1 && "Forgot Password?"}
                            {step === 2 && "Verification Code"}
                            {step === 3 && "Reset Password"}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            {step === 1 && "Enter your email to receive a verification code"}
                            {step === 2 && `We sent a code to ${email}`}
                            {step === 3 && "Create a new strong password"}
                        </p>
                    </div>

                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-4 rounded-xl text-sm font-medium animate-shake mb-6 flex items-start">
                            <span className="mr-2">⚠️</span>
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleRequestOTP} className="space-y-6">
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
                                {loading ? "Sending..." : "Send Code"}
                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="group">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1 mb-1.5 block group-focus-within:text-foreground transition-colors">Enter OTP</label>
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-12 pr-5 py-4 bg-muted/50 border border-input rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-input transition-all font-medium tracking-[0.5em] text-center text-lg"
                                        placeholder="••••••"
                                        value={otp}
                                        maxLength={6}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-sm font-black rounded-2xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none transition-all active:scale-95 shadow-xl shadow-primary/20 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Verifying..." : "Verify Code"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Change Email
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
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
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
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
                                className="w-full flex justify-center items-center py-4 px-6 border border-transparent text-sm font-black rounded-2xl text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none transition-all active:scale-95 shadow-xl shadow-primary/20 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

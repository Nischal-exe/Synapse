import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import LoadingDots from '../components/LoadingDots';

export default function VerifyEmail() {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get email from router state (passed from Register page)
    const email = location.state?.email;

    if (!email) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="mb-4">No email provided for verification.</p>
                    <button onClick={() => navigate('/register')} className="text-blue-500">Go to Register</button>
                </div>
            </div>
        );
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post('http://localhost:8000/auth/verify', {
                email,
                otp
            });
            // Success
            navigate('/login', { state: { message: "Email verified! Please login." } });
        } catch (err: any) {
            console.error("Verification error:", err);
            setError(err.response?.data?.detail || "Verification failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black font-sans">
            <div className="w-full max-w-md p-8 bg-zinc-900/50 rounded-2xl border border-zinc-800 shadow-xl backdrop-blur-sm">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                        Verify Email
                    </h2>
                    <p className="text-zinc-400 text-sm">
                        Enter the OTP sent to <span className="text-white">{email}</span>
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleVerify} className="space-y-6">
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-zinc-300 mb-1.5">
                            One Time Password
                        </label>
                        <input
                            id="otp"
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full bg-black/50 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                            placeholder="Enter 6-digit OTP"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                    >
                        {loading ? <LoadingDots /> : 'Verify Account'}
                    </button>

                    <div className="text-center text-xs text-zinc-500">
                        Didn't receive code? <span className="text-zinc-400 hover:text-white cursor-pointer transition-colors">Resend (Coming Soon)</span>
                    </div>
                </form>
            </div>
        </div>
    );
}

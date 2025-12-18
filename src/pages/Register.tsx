import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import logo from '../assets/logo.png';

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
            await api.post('/auth/signup', {
                username,
                email,
                password,
                full_name: fullName,
                date_of_birth: dob,
            });
            navigate('/login');
        } catch (err: unknown) {
            const errorData = err as { response?: { data?: { detail?: string } } };
            setError(errorData.response?.data?.detail || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-md w-full space-y-8 bg-zinc-900/50 p-10 rounded-[32px] border border-zinc-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                <div className="relative z-10">
                    <div className="text-center">
                        <Link to="/" className="inline-block hover:scale-105 transition-transform">
                            <img className="mx-auto h-16 w-auto object-contain brightness-0 invert" src={logo} alt="Synapse" />
                        </Link>
                        <h2 className="mt-8 text-4xl font-black tracking-tight text-white mb-2">Create Account</h2>
                        <p className="text-zinc-500 font-medium">Join the Synapse community</p>
                    </div>
                    <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 py-3 rounded-xl text-sm font-medium animate-shake text-center">
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="group">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1 mb-1.5 block group-focus-within:text-white transition-colors">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-5 py-3.5 bg-black/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-600 transition-all font-medium"
                                    placeholder="Enter your full name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1 mb-1.5 block group-focus-within:text-white transition-colors">Birthday</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full px-5 py-3.5 bg-black/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-600 transition-all font-medium color-scheme-dark"
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                    />
                                </div>
                                <div className="group">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1 mb-1.5 block group-focus-within:text-white transition-colors">Username</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-5 py-3.5 bg-black/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-600 transition-all font-medium"
                                        placeholder="Pick a handle"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1 mb-1.5 block group-focus-within:text-white transition-colors">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full px-5 py-3.5 bg-black/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-600 transition-all font-medium"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="group">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 ml-1 mb-1.5 block group-focus-within:text-white transition-colors">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full px-5 py-3.5 bg-black/50 border border-zinc-800 rounded-2xl text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-zinc-600 transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-4 px-6 border border-transparent text-sm font-black rounded-2xl text-black bg-white hover:bg-zinc-200 focus:outline-none transition-all active:scale-95 shadow-xl shadow-white/5 uppercase tracking-wider"
                            >
                                Get Started
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-10">
                        <p className="text-zinc-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-white hover:underline decoration-zinc-500 underline-offset-4 focus:outline-none">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

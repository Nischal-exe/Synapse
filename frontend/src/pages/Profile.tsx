import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import { User, Calendar, Mail, Shield, ArrowLeft } from 'lucide-react';

export default function Profile() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone and will remove all your data.")) {
            try {
                // Assuming deleteUser is imported from api
                // We need to import it first, but let's add the logic block
                const { deleteUser } = await import('../services/api');
                await deleteUser();
                await logout();
                navigate('/');
            } catch (error) {
                console.error("Failed to delete account:", error);
                alert("Failed to delete account. Please try again.");
            }
        }
    };

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-foreground/60">Please log in to view profile.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden pt-32">
            <Header />

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] left-[10%] w-[25%] h-[25%] bg-primary/5 rounded-full blur-[100px]" />
            </div>

            <div className="max-w-3xl mx-auto px-6 py-12 relative z-10 animate-fade-in">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-foreground/40 hover:text-primary transition-colors duration-300 mb-8 font-sans text-xs font-bold uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="glass-card p-8 sm:p-12 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <User className="w-64 h-64 text-primary" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-12">
                            <div className="w-32 h-32 rounded-full bg-primary flex items-center justify-center text-4xl text-white font-bold font-sans shadow-lg shadow-primary/20 shrink-0">
                                {user.username?.[0].toUpperCase()}
                            </div>
                            <div className="text-center sm:text-left">
                                <h1 className="text-3xl sm:text-4xl font-bold mb-2">{user.full_name || user.username}</h1>
                                <p className="text-foreground/40 font-mono text-sm">@{user.username}</p>
                                <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                    {user.role || 'Member'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="p-6 rounded-2xl bg-background/50 border border-primary/5 hover:border-primary/20 transition-colors duration-300">
                                <div className="flex items-center gap-4 mb-2">
                                    <Mail className="w-5 h-5 text-primary" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-foreground/40 font-sans">Email Address</span>
                                </div>
                                <p className="text-lg font-medium pl-9">{user.email}</p>
                            </div>

                            <div className="p-6 rounded-2xl bg-background/50 border border-primary/5 hover:border-primary/20 transition-colors duration-300">
                                <div className="flex items-center gap-4 mb-2">
                                    <Calendar className="w-5 h-5 text-primary" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-foreground/40 font-sans">Date of Birth</span>
                                </div>
                                <p className="text-lg font-medium pl-9">{user.date_of_birth || 'Not provided'}</p>
                            </div>

                            <div className="p-6 rounded-2xl bg-background/50 border border-primary/5 hover:border-primary/20 transition-colors duration-300">
                                <div className="flex items-center gap-4 mb-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    <span className="text-xs font-bold uppercase tracking-widest text-foreground/40 font-sans">Account ID</span>
                                </div>
                                <p className="text-lg font-medium pl-9 font-mono text-foreground/60">#{user.id}</p>
                            </div>

                            <div className="pt-8 flex justify-center border-t border-primary/10 mt-4">
                                <button
                                    onClick={handleDeleteAccount}
                                    className="text-destructive hover:bg-destructive/5 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-2"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

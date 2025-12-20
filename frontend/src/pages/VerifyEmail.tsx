import { useNavigate, useLocation } from 'react-router-dom';
import { Mail } from 'lucide-react';

export default function VerifyEmail() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="max-w-md w-full glass-card p-10 text-center animate-fade-in">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                    <Mail className="w-10 h-10" />
                </div>

                <h2 className="text-3xl font-bold mb-4">Check Your Email</h2>
                <p className="text-muted-foreground mb-8 text-lg">
                    We've sent a verification link to <br />
                    <span className="text-foreground font-bold">{email || 'your inbox'}</span>.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => window.open('https://mail.google.com', '_blank')}
                        className="btn-primary w-full py-3"
                    >
                        Open Gmail
                    </button>

                    <button
                        onClick={async () => {
                            if (email) {
                                const { error } = await import('../supabaseClient').then(m => m.supabase.auth.resend({
                                    type: 'signup',
                                    email: email,
                                    options: {
                                        emailRedirectTo: `${import.meta.env.PROD ? 'https://synapsepro.online' : window.location.origin}/login`
                                    }
                                }));
                                if (error) alert('Error resending email: ' + error.message);
                                else alert('Verification email resent!');
                            }
                        }}
                        className="w-full py-3 rounded-xl border border-primary/20 bg-primary/5 text-primary text-sm font-bold uppercase tracking-widest hover:bg-primary/10 transition-colors"
                    >
                        Resend Email
                    </button>

                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Menu } from 'lucide-react';
import logo from '../assets/logo.png';

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-primary/5 transition-all duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-3 rounded-full hover:bg-primary/5 text-foreground/40 transition-all duration-300"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    )}
                    <Link to="/" className="flex items-center group">
                        <div className="h-20 flex items-center transition-all duration-500 group-hover:scale-105">
                            <img src={logo} alt="Synapse" className="h-16 w-auto object-contain" />
                        </div>
                    </Link>
                </div>

                <div className="flex items-center gap-4 md:gap-10">
                    <nav className="hidden md:flex items-center gap-10">
                        <Link to="/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-colors duration-300 font-sans">
                            Dashboard
                        </Link>
                    </nav>

                    <div className="h-6 w-px bg-primary/10 hidden md:block" />

                    <div className="flex items-center gap-4">

                        <div className="hidden sm:flex items-center gap-6">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold font-sans">
                                            {user?.username?.[0].toUpperCase()}
                                        </div>
                                        <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest font-sans">{user?.username}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-3 rounded-full text-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all duration-300"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Link
                                        to="/login"
                                        className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-colors font-sans"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="btn-primary py-2 px-6 text-[10px] uppercase tracking-[0.2em]"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, Menu } from 'lucide-react';
import logo from '../assets/logo.png';

interface HeaderProps {
    onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
    const { isAuthenticated, user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-white/10 dark:border-white/5 transition-all duration-500">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {onMenuClick && (
                        <button
                            onClick={onMenuClick}
                            className="lg:hidden p-2.5 rounded-xl hover:bg-primary/10 text-muted-foreground transition-all duration-300"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    )}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-500">
                            <img src={logo} alt="S" className="w-6 h-6 object-contain brightness-0 invert" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-colors duration-300">
                            SYNAPSE
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-4 md:gap-8">
                    <nav className="hidden md:flex items-center gap-8">
                        <Link to="/dashboard" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-300">
                            Dashboard
                        </Link>
                    </nav>

                    <div className="h-6 w-px bg-border hidden md:block" />

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl hover:bg-muted text-muted-foreground transition-all duration-300"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5 animate-spin-slow" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <div className="hidden sm:flex items-center gap-4">
                            {isAuthenticated ? (
                                <>
                                    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">
                                            {user?.username?.[0].toUpperCase()}
                                        </div>
                                        <span className="text-sm font-bold text-foreground">{user?.username}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-300"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="px-5 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="btn-primary py-2 px-6 text-sm"
                                    >
                                        Join Now
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

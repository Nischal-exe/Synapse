import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut } from 'lucide-react';
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
        <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-3">
                        {onMenuClick && (
                            <button
                                onClick={onMenuClick}
                                className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        )}
                        <Link to="/" className="flex items-center space-x-2">
                            {/* Logo is treated as white for this dark theme */}
                            <img src={logo} alt="Synapse" className="h-8 md:h-10 w-auto object-contain brightness-0 invert" />
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4 md:space-x-6">
                        {isAuthenticated && user && (
                            <span className="text-sm font-medium text-muted-foreground hidden sm:block">
                                Hello, {user.username}
                            </span>
                        )}

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {isAuthenticated ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                    Login
                                </Link>
                                <Link to="/register" className="btn-primary flex items-center justify-center py-2 px-4 border border-transparent text-sm font-black rounded-xl text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

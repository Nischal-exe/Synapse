import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';
import { useState } from 'react';

interface HeaderProps {
    onMenuClick?: () => void;
    variant?: 'default' | 'transparent';
    className?: string;
}

export default function Header({ onMenuClick, variant = 'default', className }: HeaderProps) {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isTransparent = variant === 'transparent';

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        navigate('/login');
    };

    return (
        <header className={`z-50 transition-all duration-500 ${isTransparent ? 'bg-transparent border-transparent' : 'bg-background border-b border-primary/5'} ${className || 'fixed top-0 left-0 right-0'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-24 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center group cursor-default">
                        <div className="h-24 flex items-center transition-all duration-500">
                            <img src={logo} alt="Synapse" className="h-20 w-auto object-contain" />
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Button - on the right side */}
                <button
                    onClick={onMenuClick || (() => setIsMobileMenuOpen(true))}
                    className="lg:hidden p-3 rounded-full hover:bg-primary/5 text-foreground/40 transition-all duration-300"
                >
                    <Menu className="w-6 h-6" />
                </button>

                {/* Desktop Navigation */}
                <div className="hidden lg:flex items-center gap-2 sm:gap-4 md:gap-10">
                    <nav className="flex items-center gap-3 sm:gap-6 md:gap-10">
                        <Link to="/dashboard" className="text-xs font-black uppercase tracking-[0.2em] text-foreground/80 hover:text-primary transition-all duration-300 font-sans hover:scale-105">
                            Dashboard
                        </Link>
                    </nav>

                    <div className="h-6 w-px bg-primary/10" />

                    <div className="flex items-center gap-2 sm:gap-4">

                        <div className="flex items-center gap-2 sm:gap-3 md:gap-6">
                            {isAuthenticated ? (
                                <>
                                    <Link to="/profile" className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors duration-300">
                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold font-sans">
                                            {user?.username?.[0].toUpperCase()}
                                        </div>
                                        <span className="text-xs font-bold text-foreground/70 uppercase tracking-widest font-sans">{user?.username}</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-3 rounded-full text-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all duration-300"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-2 sm:gap-4">
                                    <Link
                                        to="/register"
                                        className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-colors font-sans"
                                    >
                                        Register
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="btn-primary py-2 px-4 sm:px-6 text-[10px] uppercase tracking-[0.2em]"
                                    >
                                        Login
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Sidebar - Solid White Background */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[100] lg:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[101]"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* Sidebar Panel - Solid White Background */}
                    <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-[102] flex flex-col transform transition-transform duration-500 ease-out animate-slide-right">
                        {/* Header: Bold MENU and Close */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-black text-gray-900 tracking-[0.1em] uppercase">MENU</h2>
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Middle: Links */}
                        <nav className="flex-1 py-4 overflow-y-auto">
                            <Link
                                to="/dashboard"
                                className="w-full flex items-center px-8 py-4 text-gray-800 hover:text-primary transition-colors text-left"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className="text-[17px] font-bold">Dashboard</span>
                            </Link>

                            {isAuthenticated && (
                                <Link
                                    to="/profile"
                                    className="w-full flex items-center px-8 py-4 text-gray-800 hover:text-primary transition-colors text-left"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <span className="text-[17px] font-bold">Profile</span>
                                </Link>
                            )}

                            <div className="border-t border-gray-50 mt-2" />
                        </nav>

                        {/* Bottom: Action Buttons */}
                        <div className="p-8 border-t border-gray-100 space-y-4">
                            {!isAuthenticated ? (
                                <>
                                    <Link
                                        to="/register"
                                        className="w-full h-14 flex items-center justify-center bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Register
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="w-full h-14 flex items-center justify-center border-2 border-gray-100 text-gray-900 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-50 transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                </>
                            ) : (
                                <button
                                    onClick={handleLogout}
                                    className="w-full h-14 flex items-center justify-center border-2 border-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest hover:bg-red-50 transition-all"
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

import { useNavigate } from 'react-router-dom';
import { X, Hash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSidebarData } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface JoinedRoom {
    id: number;
    name: string;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();
    const [joinedRooms, setJoinedRooms] = useState<JoinedRoom[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getSidebarData();
                setJoinedRooms(data.joined_rooms);
            } catch (error) {
                console.error("Failed to fetch sidebar data", error);
            }
        };
        fetchData();
    }, []);

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-[100] w-64 bg-white lg:bg-muted/40 lg:backdrop-blur-2xl border-r border-primary/5 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <div className="h-full flex flex-col pt-0 lg:pt-4 bg-white lg:bg-transparent">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 lg:hidden">
                    <h2 className="text-lg font-black text-gray-900 tracking-[0.1em] uppercase">MENU</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="h-16 hidden lg:flex items-center justify-between px-6 border-b border-primary/5">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] font-sans">Joined rooms</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto py-2 lg:py-8 space-y-2 lg:space-y-6 custom-scrollbar">
                    {/* Mobile Only Navigation Section */}
                    <nav className="lg:hidden">
                        <button
                            onClick={() => {
                                navigate('/dashboard');
                                onClose();
                            }}
                            className="w-full flex items-center px-8 py-4 text-gray-800 hover:text-primary transition-colors text-left"
                        >
                            <span className="text-[17px] font-bold">Dashboard</span>
                        </button>

                        {isAuthenticated && (
                            <button
                                onClick={() => {
                                    navigate('/profile');
                                    onClose();
                                }}
                                className="w-full flex items-center px-8 py-4 text-gray-800 hover:text-primary transition-colors text-left"
                            >
                                <span className="text-[17px] font-bold">Profile</span>
                            </button>
                        )}
                        <div className="border-t border-gray-50 mt-2 mb-4" />
                    </nav>

                    <div className="px-8 mb-4 lg:hidden">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] font-sans">Joined rooms</span>
                    </div>

                    <div className="space-y-2 lg:px-4">
                        {joinedRooms.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                                <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mb-4 border border-primary/10">
                                    <Hash className="w-5 h-5 text-primary/40" />
                                </div>
                                <p className="text-foreground/40 text-[9px] font-bold uppercase tracking-widest font-sans">No Links</p>
                                <p className="text-foreground/20 text-[9px] uppercase tracking-wider mt-2 px-2 leading-loose font-sans">Synchronize with a collective to see your links here.</p>
                            </div>
                        ) : (
                            joinedRooms.map((room) => (
                                <button
                                    key={room.id}
                                    onClick={() => {
                                        navigate(`/room/${room.id}`);
                                        onClose();
                                    }}
                                    className="w-full flex items-center px-3 py-2 text-foreground/60 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-300 group relative overflow-hidden text-left"
                                >
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 mr-3 border border-primary/20 shrink-0 shadow-sm">
                                        <span className="text-[9px] font-black uppercase font-sans">
                                            {room.name.substring(0, 2)}
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-black tracking-widest uppercase truncate relative z-10 font-sans group-hover:translate-x-1 transition-transform duration-300 text-foreground">{room.name}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Mobile Logout Button Section */}
                {isAuthenticated && (
                    <div className="p-8 border-t border-gray-100 lg:hidden">
                        <button
                            onClick={() => {
                                logout();
                                onClose();
                                navigate('/login');
                            }}
                            className="w-full h-14 flex items-center justify-center border-2 border-red-50 text-red-600 rounded-2xl font-black uppercase tracking-widest hover:bg-red-50 transition-all font-sans"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </aside>
    );
}

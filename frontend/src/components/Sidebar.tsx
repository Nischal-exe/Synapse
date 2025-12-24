import { useNavigate } from 'react-router-dom';
import { X, Hash, Shield } from 'lucide-react';
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
    const { user } = useAuth();
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
            className={`fixed inset-y-0 left-0 z-50 w-80 bg-background/90 backdrop-blur-2xl border-r border-primary/5 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) lg:translate-x-0 lg:static lg:inset-0 shadow-[20px_0_40px_rgba(0,0,0,0.02)] lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <div className="h-full flex flex-col pt-24 lg:pt-0">
                <div className="h-24 flex items-center justify-between px-8 border-b border-primary/5">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.2em] font-sans">The Collective</span>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-3 text-foreground/40 hover:text-primary transition-all rounded-full hover:bg-primary/5" aria-label="Close sidebar">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 sm:py-10 px-4 sm:px-6 space-y-4 custom-scrollbar">
                    {/* Admin Link - Only visible to admins */}
                    {user?.role === 'admin' && (
                        <div className="mb-6 pb-6 border-b border-primary/10">
                            <button
                                onClick={() => {
                                    navigate('/admin');
                                    onClose();
                                }}
                                className="w-full flex items-center px-5 py-4 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-full transition-all duration-300 group relative overflow-hidden text-left border border-purple-500/20"
                                aria-label="Open admin panel"
                            >
                                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500 mr-5 border border-purple-500/20 shrink-0">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold tracking-widest uppercase truncate relative z-10 font-sans group-hover:translate-x-1 transition-transform duration-300">Admin Panel</span>
                            </button>
                        </div>
                    )}

                    {joinedRooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-6 border border-primary/10">
                                <Hash className="w-6 h-6 text-primary/40" />
                            </div>
                            <p className="text-foreground/60 text-xs font-bold uppercase tracking-widest font-sans">No Links</p>
                            <p className="text-foreground/30 text-[10px] uppercase tracking-wider mt-3 leading-loose font-sans">Synchronize with a collective <br /> to see your links here.</p>
                        </div>
                    ) : (
                        joinedRooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() => {
                                    navigate(`/room/${room.id}`);
                                    onClose();
                                }}
                                className="w-full flex items-center px-5 py-4 text-foreground/50 hover:text-primary hover:bg-primary/5 rounded-full transition-all duration-300 group relative overflow-hidden text-left"
                            >
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 mr-5 border border-primary/10 shrink-0">
                                    <span className="text-[10px] font-black uppercase font-sans">
                                        {room.name.substring(0, 2)}
                                    </span>
                                </div>
                                <span className="text-xs font-bold tracking-widest uppercase truncate relative z-10 font-sans group-hover:translate-x-1 transition-transform duration-300">{room.name}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
}

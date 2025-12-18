import { useNavigate } from 'react-router-dom';
import { X, Hash, LayoutGrid } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSidebarData } from '../services/api';

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
            className={`fixed inset-y-0 left-0 z-50 w-80 bg-background/40 backdrop-blur-2xl border-r border-white/10 dark:border-white/5 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) lg:translate-x-0 lg:static lg:inset-0 shadow-2xl lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <div className="h-full flex flex-col">
                <div className="h-20 flex items-center justify-between px-8 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-primary" />
                        <span className="text-sm font-black text-foreground uppercase tracking-widest">My Communities</span>
                    </div>
                    <button onClick={onClose} className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-all rounded-xl hover:bg-muted">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-8 px-4 space-y-1 custom-scrollbar">
                    {joinedRooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4 border border-primary/10">
                                <Hash className="w-8 h-8 text-primary" />
                            </div>
                            <p className="text-foreground text-sm font-bold">No communities yet</p>
                            <p className="text-muted-foreground text-xs mt-2 leading-relaxed">Join a study group from the dashboard to start collaborating.</p>
                        </div>
                    ) : (
                        joinedRooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() => {
                                    navigate(`/room/${room.id}`);
                                    onClose();
                                }}
                                className="w-full flex items-center px-4 py-4 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-2xl transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/10 transition-all duration-300 mr-4 border border-border group-hover:border-primary/20 shrink-0">
                                    <span className="text-xs font-black text-muted-foreground group-hover:text-primary uppercase">
                                        {room.name.substring(0, 2)}
                                    </span>
                                </div>
                                <span className="text-sm font-bold truncate relative z-10 group-hover:translate-x-1 transition-transform duration-300">{room.name}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
}

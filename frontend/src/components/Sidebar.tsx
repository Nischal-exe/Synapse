import { useNavigate } from 'react-router-dom';
import { X, Hash } from 'lucide-react';
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
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-card/95 backdrop-blur-2xl border-r border-border transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) lg:translate-x-0 lg:static lg:inset-0 shadow-2xl lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
        >
            <div className="h-full flex flex-col">
                <div className="h-20 flex items-center justify-between px-6 border-b border-border">
                    <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Communities</span>
                    <button onClick={onClose} className="lg:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                    {joinedRooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                                <Hash className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground text-sm font-medium">No joined rooms yet</p>
                            <p className="text-muted-foreground/60 text-xs mt-1">Join a community to get started</p>
                        </div>
                    ) : (
                        joinedRooms.map((room) => (
                            <button
                                key={room.id}
                                onClick={() => {
                                    navigate(`/room/${room.id}`);
                                    onClose();
                                }}
                                className="w-full flex items-center px-4 py-3.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-muted/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 group-hover:bg-muted transition-colors mr-3 border border-border group-hover:border-input">
                                    <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground uppercase shrink-0">
                                        {room.name.substring(0, 2)}
                                    </span>
                                </div>
                                <span className="text-sm font-medium truncate relative z-10">{room.name}</span>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
}

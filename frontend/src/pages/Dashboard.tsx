import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, CheckCircle, ArrowRight, Compass } from 'lucide-react';
import LoadingDots from '../components/LoadingDots';
import { getRooms, joinRoom, getSidebarData } from '../services/api';
import Sidebar from '../components/Sidebar.tsx';
import Header from '../components/Header';

interface Room {
    id: number;
    name: string;
    description: string;
    is_joined?: boolean;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [sidebarKey, setSidebarKey] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const [roomsData, sidebarData] = await Promise.all([
                    getRooms(),
                    getSidebarData()
                ]);

                const joinedIds = new Set(sidebarData.joined_rooms.map((r: { id: number }) => r.id));
                const enhancedRooms = roomsData.map((r: Room) => ({
                    ...r,
                    is_joined: joinedIds.has(r.id)
                }));

                setRooms(enhancedRooms);
            } catch (error) {
                console.error("Failed to fetch rooms:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRooms();
    }, []);

    const handleRoomClick = (roomId: number) => {
        navigate(`/room/${roomId}`);
    };

    const handleJoinRoom = async (e: React.MouseEvent, roomId: number) => {
        e.stopPropagation();
        try {
            const res = await joinRoom(roomId);
            setRooms(rooms.map(r => r.id === roomId ? { ...r, is_joined: res.joined } : r));
            if (res.joined) {
                navigate(`/room/${roomId}`);
            }
            setSidebarKey(prev => prev + 1); // Refresh sidebar
        } catch (error) {
            console.error("Failed to join room:", error);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden pt-28">
            <Header onMenuClick={() => setIsSidebarOpen(true)} />



            <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-2 relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-md z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <Sidebar
                    key={sidebarKey}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    <header className="mb-6 animate-fade-in text-left">
                        <div className="flex items-center justify-start gap-2 mb-2">
                            <div className="p-1 bg-primary rounded-full shadow-lg shadow-primary/20">
                                <Compass className="w-2.5 h-2.5 text-white" />
                            </div>
                            <span className="text-[8px] font-black text-foreground/40 uppercase tracking-[0.2em] font-sans">Discovery Hub</span>
                        </div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight mb-2">
                            Select your path to grow.
                        </h1>
                        <p className="text-[11px] sm:text-xs text-foreground/50 max-w-md leading-relaxed">
                            Shared learning, shaped by purpose.
                        </p>
                    </header>

                    {/* Rooms Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:gap-10">
                        {loading ? (
                            <div className="col-span-full py-24 flex flex-col items-center justify-center">
                                <LoadingDots />
                                <p className="mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-foreground/30 font-sans">Locating Collectives...</p>
                            </div>
                        ) : (
                            rooms.length === 0 ? (
                                <div className="col-span-full text-center py-24 glass-card rounded-[2.5rem]">
                                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/10">
                                        <PlusCircle className="w-6 h-6 text-primary/40" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Quiet for now</h3>
                                    <p className="text-foreground/40 text-[10px] font-bold uppercase tracking-widest font-sans">
                                        More collectives are forming.
                                    </p>
                                </div>
                            ) : (
                                rooms.map((room, idx) => (
                                    <div
                                        key={room.id}
                                        onClick={() => handleRoomClick(room.id)}
                                        className="glass-card p-6 group transition-all duration-500 cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.98] animate-slide-up rounded-[1.5rem] border-primary/10 hover:border-primary/30"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                                            <Compass className="w-24 h-24 text-primary" />
                                        </div>

                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                                                    {room.name}
                                                </h3>
                                                <button
                                                    onClick={(e) => handleJoinRoom(e, room.id)}
                                                    className={`w-9 h-9 rounded-full transition-all duration-500 flex items-center justify-center ${room.is_joined ? 'bg-primary text-white shadow-lg' : 'bg-primary/5 text-primary hover:bg-primary hover:text-white border border-primary/10'}`}
                                                >
                                                    {room.is_joined ? <CheckCircle className="w-3.5 h-3.5" /> : <PlusCircle className="w-3.5 h-3.5" />}
                                                </button>
                                            </div>
                                            <p className="text-foreground/50 text-[11px] font-sans leading-relaxed mb-6 line-clamp-3">
                                                {room.description}
                                            </p>
                                            <div className="mt-auto flex items-center text-[8px] font-black tracking-[0.2em] uppercase text-primary font-sans">
                                                Enter Room <ArrowRight className="w-2.5 h-2.5 ml-2 group-hover:translate-x-2 transition-transform duration-500" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

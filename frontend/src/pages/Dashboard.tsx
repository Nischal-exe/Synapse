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
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden pt-20">
            <Header onMenuClick={() => setIsSidebarOpen(true)} />

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] right-[0%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] left-[0%] w-[35%] h-[35%] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 flex flex-col lg:flex-row gap-12">
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
                    <header className="mb-20 animate-fade-in text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                            <div className="p-3 bg-primary rounded-full shadow-lg shadow-primary/20">
                                <Compass className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.3em] font-sans">Discovery Hub</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8">
                            Select your <br className="hidden md:block" /> path to grow.
                        </h1>
                        <p className="text-lg text-foreground/60 max-w-xl leading-relaxed">
                            Synchronize with communities built on shared knowledge and collective ambition.
                        </p>
                    </header>

                    {/* Rooms Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                        {loading ? (
                            <div className="col-span-full py-32 flex flex-col items-center justify-center">
                                <LoadingDots />
                                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 font-sans">Locating Collectives...</p>
                            </div>
                        ) : (
                            rooms.length === 0 ? (
                                <div className="col-span-full text-center py-32 glass-card rounded-[3rem]">
                                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/10">
                                        <PlusCircle className="w-8 h-8 text-primary/40" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-3">Quiet for now</h3>
                                    <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest font-sans">
                                        More collectives are forming.
                                    </p>
                                </div>
                            ) : (
                                rooms.map((room, idx) => (
                                    <div
                                        key={room.id}
                                        onClick={() => handleRoomClick(room.id)}
                                        className="glass-card p-10 group transition-all duration-500 cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.98] animate-slide-up rounded-[2.5rem] border-primary/10 hover:border-primary/30"
                                        style={{ animationDelay: `${idx * 100}ms` }}
                                    >
                                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                                            <Compass className="w-32 h-32 text-primary" />
                                        </div>

                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-8">
                                                <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                                                    {room.name}
                                                </h3>
                                                <button
                                                    onClick={(e) => handleJoinRoom(e, room.id)}
                                                    className={`w-12 h-12 rounded-full transition-all duration-500 flex items-center justify-center ${room.is_joined ? 'bg-primary text-white shadow-lg' : 'bg-primary/5 text-primary hover:bg-primary hover:text-white border border-primary/10'}`}
                                                >
                                                    {room.is_joined ? <CheckCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            <p className="text-foreground/50 text-sm font-sans leading-relaxed mb-10 line-clamp-3">
                                                {room.description || "A space dedicated to the pursuit of excellence and shared knowledge within our scholarly collective."}
                                            </p>
                                            <div className="mt-auto flex items-center text-[10px] font-black tracking-[0.2em] uppercase text-primary font-sans">
                                                Synchronize <ArrowRight className="w-3 h-3 ml-3 group-hover:translate-x-2 transition-transform duration-500" />
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

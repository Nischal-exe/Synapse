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
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden pt-24">
            <Header onMenuClick={() => setIsSidebarOpen(true)} />

            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[20%] right-[5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[20%] left-[5%] w-[35%] h-[35%] bg-indigo-500/10 rounded-full blur-[120px] animate-float" />
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Sidebar */}
                    <Sidebar
                        key={sidebarKey}
                        isOpen={isSidebarOpen}
                        onClose={() => setIsSidebarOpen(false)}
                    />

                    {/* Main Content */}
                    <main className="flex-1 min-w-0">
                        <header className="mb-12 animate-fade-in">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <Compass className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-sm font-bold text-primary uppercase tracking-widest">Explorer</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                                Select a <span className="text-gradient">Community</span>
                            </h1>
                            <p className="mt-4 text-xl text-muted-foreground max-w-2xl">
                                Discover study groups, share resources, and excel together with peers across different subjects.
                            </p>
                        </header>

                        {/* Rooms Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {loading ? (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center">
                                    <LoadingDots />
                                    <p className="mt-4 text-muted-foreground font-medium">Finding communities...</p>
                                </div>
                            ) : (
                                rooms.length === 0 ? (
                                    <div className="col-span-full text-center py-20 glass-card border-dashed">
                                        <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6">
                                            <PlusCircle className="w-10 h-10 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">No communities found</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto text-lg">
                                            We're still growing! Check back soon for new study groups.
                                        </p>
                                    </div>
                                ) : (
                                    rooms.map((room, idx) => (
                                        <div
                                            key={room.id}
                                            onClick={() => handleRoomClick(room.id)}
                                            className="glass-card p-8 group transition-all duration-500 cursor-pointer flex flex-col justify-between relative overflow-hidden active:scale-[0.98] animate-slide-up"
                                            style={{ animationDelay: `${idx * 100}ms` }}
                                        >
                                            <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-0 group-hover:opacity-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500">
                                                <Compass className="w-24 h-24 text-primary" />
                                            </div>

                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="h-12 px-4 bg-primary/10 rounded-xl flex items-center justify-center">
                                                        <h3 className="text-lg font-black text-primary tracking-tight">
                                                            {room.name}
                                                        </h3>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleJoinRoom(e, room.id)}
                                                        className={`p-3 rounded-2xl transition-all duration-300 ${room.is_joined ? 'text-white bg-primary shadow-lg shadow-primary/30' : 'text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border'}`}
                                                    >
                                                        {room.is_joined ? <CheckCircle className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
                                                    </button>
                                                </div>
                                                <p className="text-muted-foreground text-lg line-clamp-2 mb-8 leading-relaxed">
                                                    {room.description || "Join the high-quality discussions and resources in the " + room.name + " community."}
                                                </p>
                                                <div className="flex items-center text-sm font-bold text-primary group-hover:gap-2 transition-all duration-300">
                                                    ENTER ROOM <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
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
        </div>
    );
}

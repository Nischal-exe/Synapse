import { useState, useEffect } from 'react';

import { useNavigate } from 'react-router-dom';
import { PlusCircle, CheckCircle, ArrowRight } from 'lucide-react';
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
    // const { logout } = useAuth(); // Not used here anymore, handled by Header
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
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-muted selection:text-white transition-colors duration-300">
            <Header onMenuClick={() => setIsSidebarOpen(true)} />

            {/* Main Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-8">
                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
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
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                            Select a Community
                        </h1>
                    </div>

                    {/* Rooms Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                        {loading ? (
                            <div className="col-span-full">
                                <LoadingDots />
                            </div>
                        ) : (
                            rooms.length === 0 ? (
                                <div className="col-span-full text-center py-20 bg-muted/10 rounded-3xl border border-dashed border-border">
                                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
                                        <PlusCircle className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">No communities available</h3>
                                    <p className="text-muted-foreground max-w-xs mx-auto">Check back later or contact an administrator to create one.</p>
                                </div>
                            ) : (
                                rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        onClick={() => handleRoomClick(room.id)}
                                        className="bg-card/40 backdrop-blur-sm border border-border rounded-2xl p-6 hover:border-primary/20 transition-all cursor-pointer group hover:bg-card/60 flex flex-col justify-between shadow-lg hover:shadow-2xl relative overflow-hidden active:scale-[0.98] duration-300"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xl font-bold text-card-foreground group-hover:text-foreground transition-colors">
                                                    {room.name}
                                                </h3>
                                                <button
                                                    onClick={(e) => handleJoinRoom(e, room.id)}
                                                    className={`p-2 rounded-full transition-all ${room.is_joined ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                                                >
                                                    {room.is_joined ? <CheckCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                                                {room.description || "Join the conversation in " + room.name}
                                            </p>
                                            <div className="flex items-center text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-wider">
                                                Enter Room <ArrowRight className="w-3 h-3 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
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

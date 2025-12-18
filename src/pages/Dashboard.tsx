import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, PlusCircle, CheckCircle, Menu, ArrowRight } from 'lucide-react';
import LoadingDots from '../components/LoadingDots';
import logo from '../assets/logo.png';
import { getRooms, joinRoom, getSidebarData } from '../services/api';
import Sidebar from '../components/Sidebar';

interface Room {
    id: number;
    name: string;
    description: string;
    is_joined?: boolean;
}

export default function Dashboard() {
    const { logout } = useAuth();
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleRoomClick = (roomId: number) => {
        navigate(`/room/${roomId}`);
    };

    const handleJoinRoom = async (e: React.MouseEvent, roomId: number) => {
        e.stopPropagation();
        try {
            const res = await joinRoom(roomId);
            setRooms(rooms.map(r => r.id === roomId ? { ...r, is_joined: res.joined } : r));
            setSidebarKey(prev => prev + 1); // Refresh sidebar
        } catch (error) {
            console.error("Failed to join room:", error);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-gray-800 selection:text-white">
            {/* Navigation Bar */}
            <nav className="border-b border-gray-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="lg:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <img src={logo} alt="Synapse" className="h-8 md:h-10 w-auto object-contain brightness-0 invert" />
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleLogout}
                                className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Layout */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-8">
                {/* Overlay for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
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
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
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
                                <div className="col-span-full text-center py-20 bg-gray-900/10 rounded-3xl border border-dashed border-gray-800">
                                    <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-800">
                                        <PlusCircle className="w-8 h-8 text-gray-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-200 mb-2">No communities available</h3>
                                    <p className="text-gray-500 max-w-xs mx-auto">Check back later or contact an administrator to create one.</p>
                                </div>
                            ) : (
                                rooms.map((room) => (
                                    <div
                                        key={room.id}
                                        onClick={() => handleRoomClick(room.id)}
                                        className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-500 transition-all cursor-pointer group hover:bg-zinc-900/60 flex flex-col justify-between shadow-lg hover:shadow-zinc-900/40 relative overflow-hidden active:scale-[0.98]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-xl font-bold text-zinc-100 group-hover:text-white transition-colors">
                                                    {room.name}
                                                </h3>
                                                <button
                                                    onClick={(e) => handleJoinRoom(e, room.id)}
                                                    className={`p-2 rounded-full transition-all ${room.is_joined ? 'text-emerald-400 bg-emerald-400/10' : 'text-zinc-500 hover:text-white hover:bg-zinc-800'}`}
                                                >
                                                    {room.is_joined ? <CheckCircle className="w-5 h-5" /> : <PlusCircle className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            <p className="text-zinc-400 text-sm line-clamp-2 mb-4">
                                                {room.description || "Join the conversation in " + room.name}
                                            </p>
                                            <div className="flex items-center text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase tracking-wider">
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

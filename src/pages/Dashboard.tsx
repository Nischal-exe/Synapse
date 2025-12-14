import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, MessageSquare, ThumbsUp, Share2, MoreHorizontal, Plus } from 'lucide-react';
import logo from '../assets/logo.png';
import { getRooms, joinRoom } from '../services/api';

interface Room {
    id: number;
    name: string;
    description: string;
}

const MOCK_POSTS = [
    {
        id: 1,
        author: "Arjun Singh",
        avatar: "AS",
        time: "2h ago",
        title: "Best resources for JEE Advanced Physics?",
        content: "I'm struggling with Rotational Motion. Can anyone suggest some good problem books or video lectures that go in-depth? currently defining my strategy for the next 3 months.",
        likes: 45,
        comments: 12,
        topic: "JEE Advance"
    },
    {
        id: 2,
        author: "Neha Gupta",
        avatar: "NG",
        time: "4h ago",
        title: "CAT 2025 Study Group",
        content: "Starting a weekend study group for working professionals targeting CAT 2025. We'll focus on VARC and DILR initially. DM if interested!",
        likes: 28,
        comments: 8,
        topic: "CAT"
    },
    {
        id: 3,
        author: "Rahul Verma",
        avatar: "RV",
        time: "6h ago",
        title: "NIMCET Pattern Changes",
        content: "Has anyone analyzed the recent changes in the NIMCET exam pattern? I'm hearing mixed things about the weightage of mathematics.",
        likes: 32,
        comments: 15,
        topic: "NIMCET"
    }
];

export default function Dashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await getRooms();
                setRooms(data);
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

    const handleJoin = async (e: React.MouseEvent, roomId: number) => {
        e.stopPropagation();
        try {
            await joinRoom(roomId);
            alert("Joined room successfully!");
        } catch (error) {
            console.error("Failed to join room:", error);
            alert("Failed to join room.");
        }
    };

    const filteredPosts = selectedTopic
        ? MOCK_POSTS.filter(post => post.topic === selectedTopic)
        : MOCK_POSTS;

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-gray-800 selection:text-white">
            {/* Navigation Bar */}
            <nav className="border-b border-gray-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <img src={logo} alt="Synapse" className="h-10 w-auto object-contain brightness-0 invert" />
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

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-12">
                {/* Search Section */}
                <div className="text-center mb-16 space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        What do you want to learn today?
                    </h1>

                    <div className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Search for topics, doubts, or discussions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-800 text-white rounded-full py-4 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-transparent transition-all shadow-lg shadow-black/50 text-lg placeholder-gray-500"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    </div>

                    {/* Topic Tags */}
                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                        <button
                            onClick={() => setSelectedTopic(null)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTopic === null
                                ? 'bg-white text-black'
                                : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
                                }`}
                        >
                            All Topics
                        </button>
                        {loading ? (
                            <span className="text-gray-500">Loading rooms...</span>
                        ) : (
                            rooms.map((room) => (
                                <div key={room.id} className="relative group">
                                    <button
                                        onClick={() => setSelectedTopic(room.name)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all pr-8 ${selectedTopic === room.name
                                            ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                            : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800 hover:border-gray-700'
                                            }`}
                                    >
                                        {room.name}
                                    </button>
                                    <button
                                        onClick={(e) => handleJoin(e, room.id)}
                                        className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                        title="Join Room"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Feed Section - Hybrid Post/Thread Layout */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-200">
                            {selectedTopic ? `${selectedTopic} Discussions` : 'Trending Discussions'}
                        </h2>
                        <button className="text-sm text-gray-500 hover:text-white transition-colors">
                            Sort by: Latest
                        </button>
                    </div>

                    {filteredPosts.length === 0 ? (
                        <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800">
                            <p className="text-gray-500 text-lg">No posts found in this topic yet.</p>
                            <button className="mt-4 px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                                Start a Discussion
                            </button>
                        </div>
                    ) : (
                        filteredPosts.map((post) => (
                            <article key={post.id} className="bg-gray-900/30 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all group cursor-pointer">
                                <div className="flex items-start space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-sm font-bold text-gray-300 border border-gray-700">
                                        {post.avatar}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-100 group-hover:text-white transition-colors">
                                                    {post.title}
                                                </h3>
                                                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                                    <span>{post.author}</span>
                                                    <span>•</span>
                                                    <span>{post.time}</span>
                                                    <span>•</span>
                                                    <span className="text-gray-400 px-2 py-0.5 bg-gray-800 rounded-full border border-gray-700">
                                                        {post.topic}
                                                    </span>
                                                </div>
                                            </div>
                                            <button className="text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all">
                                                <MoreHorizontal className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <p className="text-gray-400 leading-relaxed mb-4 line-clamp-3">
                                            {post.content}
                                        </p>

                                        <div className="flex items-center space-x-6">
                                            <button className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors text-sm group/btn">
                                                <div className="p-2 rounded-full group-hover/btn:bg-gray-800 transition-colors">
                                                    <ThumbsUp className="w-4 h-4" />
                                                </div>
                                                <span>{post.likes}</span>
                                            </button>

                                            <button className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors text-sm group/btn">
                                                <div className="p-2 rounded-full group-hover/btn:bg-gray-800 transition-colors">
                                                    <MessageSquare className="w-4 h-4" />
                                                </div>
                                                <span>{post.comments}</span>
                                            </button>

                                            <button className="flex items-center space-x-2 text-gray-500 hover:text-white transition-colors text-sm group/btn ml-auto">
                                                <div className="p-2 rounded-full group-hover/btn:bg-gray-800 transition-colors">
                                                    <Share2 className="w-4 h-4" />
                                                </div>
                                                <span>Share</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LoadingDots from '../components/LoadingDots';
import PostItem from '../components/PostItem';
import RoomChat from '../components/RoomChat';
import { getPosts, getRooms, createPost } from '../services/api';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import Header from '../components/Header';


interface Post {
    id: number;
    title: string;
    content: string;
    created_at: string;
    owner_id: number;
    room_id: number;
    owner?: {
        username: string;
    };
}

interface Room {
    id: number;
    name: string;
    description: string;
}

export default function RoomDetails() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const [posts, setPosts] = useState<Post[]>([]);
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false); // For mobile chat toggle
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomId) return;
        try {
            await createPost({
                title: newPostTitle,
                content: newPostContent,
                room_id: Number(roomId)
            });
            setNewPostTitle('');
            setNewPostContent('');
            // Refresh posts
            const postsData = await getPosts(Number(roomId));
            setPosts(postsData);
        } catch (error) {
            console.error("Failed to create post", error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!roomId) return;
            setLoading(true);
            try {
                // Fetch posts for the room
                const postsData = await getPosts(Number(roomId));
                setPosts(postsData);

                // Fetch room details
                const roomsData = await getRooms();
                const foundRoom = roomsData.find((r: Room) => r.id === Number(roomId));
                setRoom(foundRoom || null);

            } catch (error) {
                console.error("Error fetching room details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roomId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center transition-colors duration-300">
                <LoadingDots />
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white flex flex-col items-center justify-center transition-colors duration-300">
                <h2 className="text-2xl font-bold mb-4">Room not found</h2>
                <button onClick={() => navigate('/dashboard')} className="text-blue-500 hover:underline">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col h-screen transition-colors duration-300">
            <Header onMenuClick={() => setIsSidebarOpen(true)} />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile sidebar overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
                )}

                <Sidebar key={isSidebarOpen ? 'open' : 'closed'} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {/* Background acccent */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-muted/50 to-transparent pointer-events-none" />

                    {/* Room Toolbar */}
                    <div className="border-b border-border bg-background/60 p-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl transition-colors duration-300">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => navigate('/dashboard')} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-foreground tracking-tight">{room.name}</h1>
                                <p className="text-xs text-muted-foreground line-clamp-1 font-medium">{room.description}</p>
                            </div>
                        </div>
                        {/* Mobile Chat Toggle */}
                        <button
                            className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-colors relative"
                            onClick={() => setIsChatOpen(!isChatOpen)}
                        >
                            <MessageSquare className="w-5 h-5" />
                            {/* Optional: Add notification dot here if needed */}
                        </button>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Posts Content */}
                        <div className={`flex-1 overflow-y-auto p-4 md:p-8 space-y-6 relative z-10 custom-scrollbar ${isChatOpen ? 'hidden lg:block' : 'block'}`}>
                            {/* Create Post Form */}
                            <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-6 mb-8 transition-all hover:border-input shadow-lg">
                                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                                    Ask a Question
                                </h3>
                                <form onSubmit={handleCreatePost} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="What's your question about?"
                                        className="w-full bg-background/50 border border-input rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all placeholder-muted-foreground font-medium"
                                        value={newPostTitle}
                                        onChange={(e) => setNewPostTitle(e.target.value)}
                                        required
                                    />
                                    <textarea
                                        placeholder="Describe your question in detail..."
                                        className="w-full bg-background/50 border border-input rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all h-32 resize-none placeholder-muted-foreground"
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        required
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="bg-primary text-primary-foreground font-bold py-2.5 px-6 rounded-xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                                        >
                                            Post Question
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {posts.length === 0 ? (
                                <div className="text-center py-20">
                                    <p className="text-muted-foreground">No posts in this room yet.</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <PostItem key={post.id} post={post} />
                                ))
                            )}
                        </div>

                        {/* Chat Sidebar (Desktop: Always visible, Mobile: Toggled) */}
                        <div className={`
                            lg:w-96 border-l border-border bg-background/50 backdrop-blur-sm lg:block
                            ${isChatOpen ? 'block w-full absolute inset-0 z-20 bg-background' : 'hidden'}
                            lg:relative lg:inset-auto lg:bg-transparent lg:z-auto
                        `}>
                            {roomId && <RoomChat roomId={Number(roomId)} />}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

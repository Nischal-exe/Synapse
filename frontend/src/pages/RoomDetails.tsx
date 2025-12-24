import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LoadingDots from '../components/LoadingDots';
import PostItem from '../components/PostItem';
import RoomChat from '../components/RoomChat';
import { getPosts, getRooms, createPost, getSidebarData, joinRoom } from '../services/api';
import { useToast } from '../context/ToastContext';
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
    const { showToast } = useToast();
    const [posts, setPosts] = useState<Post[]>([]);
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false); // For mobile chat toggle
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [isMember, setIsMember] = useState(false);

    const checkMembership = async () => {
        try {
            const data = await getSidebarData();
            const joined = data.joined_rooms.some((r: any) => r.id === Number(roomId));
            setIsMember(joined);
        } catch (err) {
            console.error("Failed to check membership", err);
        }
    };

    const handleJoin = async () => {
        if (!roomId) return;
        try {
            await joinRoom(Number(roomId));
            setIsMember(true);
            showToast('Successfully joined the room!', 'success');
        } catch (err) {
            console.error("Failed to join room", err);
            showToast('Failed to join room. Please try again.', 'error');
        }
    };

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
            showToast('Post created successfully!', 'success');
            // Refresh posts
            const postsData = await getPosts(Number(roomId));
            setPosts(postsData);
        } catch (error) {
            console.error("Failed to create post", error);
            showToast('Failed to create post. Please try again.', 'error');
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

                // Check membership
                await checkMembership();

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
            <div className="min-h-screen bg-background flex items-center justify-center">
                <LoadingDots />
            </div>
        );
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
                <h2 className="text-4xl font-semibold mb-6 italic">Collective not found</h2>
                <button onClick={() => navigate('/dashboard')} className="text-primary font-bold uppercase tracking-widest text-[10px] font-sans hover:underline underline-offset-8">
                    Return to Hub
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col h-screen overflow-hidden">
            <Header onMenuClick={() => setIsSidebarOpen(true)} />

            <div className="flex flex-1 overflow-hidden relative pt-20">
                {/* Mobile sidebar overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
                )}

                <Sidebar key={isSidebarOpen ? 'open' : 'closed'} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {/* Background accent */}
                    <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 pointer-events-none" />

                    {/* Room Toolbar */}
                    <div className="border-b border-primary/5 bg-background/80 p-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl shrink-0">
                        <div className="flex items-center space-x-6">
                            <button onClick={() => navigate('/dashboard')} className="p-3 text-foreground/40 hover:text-primary hover:bg-primary/5 rounded-full transition-all">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{room.name}</h1>
                                <p className="text-[9px] sm:text-[10px] text-foreground/40 uppercase tracking-[0.2em] font-black font-sans mt-0.5 truncate max-w-[180px] sm:max-w-[300px] md:max-w-none">{room.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {!isMember && (
                                <button
                                    onClick={handleJoin}
                                    className="btn-primary px-6 py-2.5 text-[10px] uppercase tracking-[0.2em]"
                                >
                                    Join Room
                                </button>
                            )}

                            {/* Mobile Chat Toggle */}
                            <button
                                className="lg:hidden p-3 text-foreground/40 hover:text-primary hover:bg-primary/5 rounded-full transition-all relative"
                                onClick={() => setIsChatOpen(!isChatOpen)}
                            >
                                <MessageSquare className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Posts Content */}
                        <div className={`flex-1 overflow-y-auto p-4 sm:p-6 md:p-12 space-y-10 relative z-10 custom-scrollbar ${isChatOpen ? 'hidden lg:block' : 'block'}`}>
                            {/* Create Post Form */}
                            <div className="glass-card bg-white/40 dark:bg-black/40 border-primary/10 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:border-primary/30 transition-all">
                                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-8 flex items-center">
                                    <span className="w-2 h-2 rounded-full bg-primary mr-4 animate-pulse"></span>
                                    Ask a question
                                </h3>
                                <form onSubmit={handleCreatePost} className="space-y-6">
                                    <input
                                        type="text"
                                        placeholder="Headline for your question..."
                                        className="w-full bg-primary/5 border border-primary/5 rounded-full px-6 py-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-sans text-sm"
                                        value={newPostTitle}
                                        onChange={(e) => setNewPostTitle(e.target.value)}
                                        required
                                    />
                                    <textarea
                                        placeholder="Detail your inquiry for the collective..."
                                        className="w-full bg-primary/5 border border-primary/5 rounded-[2rem] px-6 py-5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all h-32 resize-none font-sans text-sm"
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        required
                                    />
                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            className="btn-primary py-3 px-8 text-[10px] uppercase tracking-[0.2em]"
                                        >
                                            Post
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {posts.length === 0 ? (
                                <div className="text-center py-24">
                                    <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <MessageSquare className="w-6 h-6 text-primary/30" />
                                    </div>
                                    <p className="text-foreground/30 text-[10px] uppercase tracking-widest font-black font-sans">No comments yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-8 pb-12">
                                    {posts.map((post) => (
                                        <PostItem key={post.id} post={post} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Chat Sidebar (Desktop: Always visible, Mobile: Toggled) */}
                        <div className={`
                            lg:w-[26rem] border-l border-primary/5 bg-primary/[0.02] backdrop-blur-md lg:block
                            ${isChatOpen ? 'block w-full absolute inset-0 z-20 bg-background' : 'hidden'}
                            lg:relative lg:inset-auto lg:z-auto
                        `}>
                            {roomId && <RoomChat roomId={Number(roomId)} isMember={isMember} />}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LoadingDots from '../components/LoadingDots';
import PostItem from '../components/PostItem';
import RoomChat from '../components/RoomChat';
import { getPosts, getRooms, createPost, getSidebarData, joinRoom } from '../services/api';
import { ArrowLeft, MessageSquare, Search, Link as LinkIcon } from 'lucide-react';
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
    const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
    const [isMember, setIsMember] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

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
            // Optional: Refresh sidebar or other state
        } catch (err) {
            console.error("Failed to join room", err);
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomId) return;
        try {
            await createPost({
                title: newPostTitle,
                content: newPostContent,
                attachment_url: newAttachmentUrl.trim() || undefined,
                room_id: Number(roomId)
            });
            setNewPostTitle('');
            setNewPostContent('');
            setNewAttachmentUrl('');
            // Refresh posts
            const postsData = await getPosts(Number(roomId));
            setPosts(postsData);
        } catch (error) {
            console.error("Failed to create post", error);
        }
    };

    const handlePostDeleted = (postId: number) => {
        setPosts(posts.filter(p => p.id !== postId));
    };

    const handlePostUpdated = (postId: number, updatedPost: Post) => {
        setPosts(posts.map(p => p.id === postId ? { ...p, ...updatedPost } : p));
    };

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchData = async () => {
            if (!roomId) return;
            // Only show full page loader on initial room load, not search
            if (!room) setLoading(true);

            try {
                // Fetch posts for the room with search
                const postsData = await getPosts(Number(roomId), debouncedSearch);
                setPosts(postsData);

                // Fetch room details (only if not loaded)
                if (!room) {
                    const roomsData = await getRooms();
                    const foundRoom = roomsData.find((r: Room) => r.id === Number(roomId));
                    setRoom(foundRoom || null);
                    await checkMembership();
                }

            } catch (error) {
                console.error("Error fetching room details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [roomId, debouncedSearch]);

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

            <div className="flex flex-1 overflow-hidden relative pt-32">
                {/* Mobile sidebar overlay */}
                {isSidebarOpen && (
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
                )}

                <Sidebar key={isSidebarOpen ? 'open' : 'closed'} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">


                    {/* Room Toolbar */}
                    <div className="border-b border-primary/5 bg-background/80 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-xl shrink-0">
                        <div className="flex items-center space-x-3 sm:space-x-6">
                            <button onClick={() => navigate('/dashboard')} className="p-2 sm:p-3 text-foreground/40 hover:text-primary hover:bg-primary/5 rounded-full transition-all">
                                <ArrowLeft className="w-4 h-4 sm:w-5 h-5" />
                            </button>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight truncate max-w-[150px] xs:max-w-none">{room.name}</h1>
                                <p className="text-[8px] sm:text-[10px] text-foreground/40 uppercase tracking-[0.2em] font-black font-sans mt-0.5 truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">{room.description}</p>
                            </div>
                        </div>

                        {/* Search Bar - Hidden on small mobile, visible on tablet+ */}
                        <div className="flex-1 max-w-md mx-6 hidden md:block">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/20 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search discussions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-primary/5 border border-primary/5 rounded-full pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            {!isMember && (
                                <button
                                    onClick={handleJoin}
                                    className="btn-primary px-4 sm:px-6 py-2 sm:py-2.5 text-[8px] sm:text-[10px] uppercase tracking-[0.2em]"
                                >
                                    Join
                                </button>
                            )}

                            {/* Mobile Chat Toggle */}
                            <button
                                className="lg:hidden p-2 sm:p-3 text-foreground/40 hover:text-primary hover:bg-primary/5 rounded-full transition-all relative"
                                onClick={() => setIsChatOpen(!isChatOpen)}
                            >
                                <MessageSquare className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Posts Content */}
                        <div className={`flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12 space-y-8 lg:space-y-10 relative z-10 custom-scrollbar ${isChatOpen ? 'hidden lg:block' : 'block'}`}>
                            {/* Create Post Form */}
                            <div className="relative group/form mb-8 sm:mb-12">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-[2rem] sm:rounded-[2.5rem] blur opacity-25 group-hover/form:opacity-50 transition duration-1000 group-hover/form:duration-200"></div>
                                <div className="relative glass-card bg-white/60 dark:bg-black/60 border-primary/20 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(255,87,34,0.08)] transition-all duration-500">
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                        <h3 className="text-sm sm:text-lg font-bold text-foreground flex items-center">
                                            <div className="w-6 h-6 sm:w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 border border-primary/20">
                                                <span className="w-1.5 h-1.5 sm:w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                            </div>
                                            Ask a question
                                        </h3>
                                    </div>
                                    <form onSubmit={handleCreatePost} className="space-y-3 sm:space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Headline for your question..."
                                            className="w-full bg-primary/[0.03] border border-primary/10 rounded-full px-5 sm:px-6 py-2.5 sm:py-3 text-foreground font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all font-sans text-xs sm:text-sm"
                                            value={newPostTitle}
                                            onChange={(e) => setNewPostTitle(e.target.value)}
                                            required
                                        />
                                        <textarea
                                            placeholder="Detail your inquiry..."
                                            className="w-full bg-primary/[0.03] border border-primary/10 rounded-[1rem] sm:rounded-[1.5rem] px-5 sm:px-6 py-3 sm:py-4 text-foreground focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all h-20 sm:h-24 resize-none font-sans text-xs sm:text-sm leading-relaxed"
                                            value={newPostContent}
                                            onChange={(e) => setNewPostContent(e.target.value)}
                                            required
                                        />

                                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between pt-1">
                                            <div className="relative flex-1">
                                                <LinkIcon className="absolute left-5 sm:left-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/40" />
                                                <input
                                                    type="url"
                                                    placeholder="Link (optional)..."
                                                    value={newAttachmentUrl}
                                                    onChange={(e) => setNewAttachmentUrl(e.target.value)}
                                                    className="w-full bg-primary/[0.02] border border-primary/5 rounded-full pl-12 sm:pl-14 pr-4 py-2 sm:py-2.5 text-[10px] sm:text-xs focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-sans text-foreground/70 placeholder:text-foreground/20"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="bg-primary hover:bg-primary/90 text-white py-2.5 sm:py-3 px-6 sm:px-8 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transform hover:-translate-y-0.5 transition-all duration-300 active:scale-95 shrink-0"
                                            >
                                                BroadCast
                                            </button>
                                        </div>
                                    </form>
                                </div>
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
                                        <PostItem key={post.id} post={post} onDelete={handlePostDeleted} onUpdate={handlePostUpdated} />
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

import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
    getModeratorPosts,
    deletePostAsModerator,
    deleteUserByAdmin,
    getRooms,
    deleteRoom,
    createRoom
} from '../services/api';
import Header from '../components/Header';
import {
    Trash2,
    ShieldAlert,
    Clock,
    User as UserIcon,
    LayoutDashboard,
    Hash,
    Plus,
    ChevronLeft,
    ChevronRight,
    UserMinus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Post {
    id: number;
    title: string;
    content: string;
    created_at: string;
    owner: {
        username: string;
        full_name: string;
    };
    owner_id: number;
    room_id: number;
}

interface Room {
    id: number;
    name: string;
    description: string;
}

type TabType = 'posts' | 'rooms';

export default function ModeratorDashboard() {
    const { user, isAuthenticated } = useAuth();
    const [currentTab, setCurrentTab] = useState<TabType>('posts');

    // Posts State
    const [posts, setPosts] = useState<Post[]>([]);
    const [postPage, setPostPage] = useState(0);
    const postLimit = 10;

    // Rooms State
    const [rooms, setRooms] = useState<Room[]>([]);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomDesc, setNewRoomDesc] = useState('');

    // Common State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated && (user?.role === 'moderator' || user?.role === 'admin')) {
            loadTabData();
        } else {
            setLoading(false);
            setError("Unauthorized Access");
        }
    }, [isAuthenticated, user, currentTab, postPage]);

    const loadTabData = async () => {
        setLoading(true);
        try {
            if (currentTab === 'posts') {
                const data = await getModeratorPosts(postPage * postLimit, postLimit);
                setPosts(data);
            } else if (currentTab === 'rooms') {
                const data = await getRooms(0, 100); // Admin usually sees all rooms
                setRooms(data);
            }
            // User management is usually handled via posts or specific search, 
            // since backend doesn't have a GET all users for now.
        } catch (err) {
            console.error("Failed to fetch data", err);
            setError("Failed to load moderation data.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (window.confirm("Delete this post permanently?")) {
            try {
                await deletePostAsModerator(postId);
                setPosts(posts.filter(p => p.id !== postId));
            } catch (err) {
                alert("Failed to delete post.");
            }
        }
    };

    const handleBanUser = async (userId: number, username: string) => {
        if (window.confirm(`BAN user @${username}? This deletes their account and ALL content.`)) {
            try {
                await deleteUserByAdmin(userId);
                setPosts(posts.filter(p => p.owner_id !== userId));
            } catch (err) {
                alert("Failed to ban user.");
            }
        }
    };

    const handleDeleteRoom = async (roomId: number) => {
        if (window.confirm("Delete this room? All contents will be lost.")) {
            try {
                await deleteRoom(roomId);
                setRooms(rooms.filter(r => r.id !== roomId));
            } catch (err) {
                alert("Failed to delete room.");
            }
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createRoom({ name: newRoomName, description: newRoomDesc });
            setNewRoomName('');
            setNewRoomDesc('');
            setShowCreateRoom(false);
            loadTabData();
        } catch (err) {
            alert("Failed to create room.");
        }
    };

    if (!isAuthenticated || (user?.role !== 'moderator' && user?.role !== 'admin')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
                <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view the moderator dashboard.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-card border-r border-primary/5 flex flex-col p-6 space-y-2 hidden md:flex">
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <ShieldAlert className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest font-sans">Moderator Hub</span>
                    </div>

                    <button
                        onClick={() => setCurrentTab('posts')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${currentTab === 'posts' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 hover:bg-primary/5 hover:text-primary'}`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Post Queue
                    </button>
                    <button
                        onClick={() => setCurrentTab('rooms')}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${currentTab === 'rooms' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 hover:bg-primary/5 hover:text-primary'}`}
                    >
                        <Hash className="w-4 h-4" />
                        Rooms
                    </button>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-10">
                    <div className="max-w-5xl mx-auto">
                        <header className="mb-10">
                            <h1 className="text-3xl font-black tracking-tight text-foreground uppercase tracking-widest sm:text-4xl">
                                {currentTab === 'posts' && 'Moderation Queue'}
                                {currentTab === 'rooms' && 'Collective Hubs'}
                            </h1>
                            <p className="text-foreground/40 text-sm font-sans mt-2">
                                {currentTab === 'posts' && 'Review and manage content across all collectives.'}
                                {currentTab === 'rooms' && 'Create and curate discussion environments.'}
                            </p>
                        </header>

                        {error && (
                            <div className="p-4 mb-8 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl flex items-center gap-3 text-sm font-bold uppercase tracking-widest font-sans">
                                <ShieldAlert className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        {/* TAB: POSTS */}
                        {currentTab === 'posts' && (
                            <div className="space-y-6">
                                {loading && posts.length === 0 ? (
                                    <div className="flex justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    </div>
                                ) : posts.length === 0 ? (
                                    <div className="text-center py-20 bg-primary/5 border border-dashed border-primary/10 rounded-[2.5rem]">
                                        <p className="text-foreground/40 font-black uppercase tracking-[0.2em] font-sans">Clear Skies: No reports pending.</p>
                                    </div>
                                ) : (
                                    <>
                                        {posts.map(post => (
                                            <div key={post.id} className="relative group overflow-hidden">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500/10 to-primary/5 rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none"></div>
                                                <div className="relative glass-card bg-white/60 dark:bg-black/60 border-primary/10 rounded-[2rem] p-6 sm:p-8 hover:border-primary/20 shadow-sm transition-all duration-300">
                                                    <div className="flex justify-between items-start gap-4 mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-3 text-[10px] font-black uppercase tracking-widest text-foreground/30 font-sans">
                                                                <span className="px-2 py-0.5 bg-primary/5 text-primary rounded-md border border-primary/10">Room #{post.room_id}</span>
                                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                                                                <span className="flex items-center gap-1 text-foreground/60"><UserIcon className="w-3 h-3" /> @{post.owner.username}</span>
                                                            </div>
                                                            <h3 className="text-xl font-bold text-foreground mb-2">{post.title}</h3>
                                                            <p className="text-foreground/60 text-sm font-sans line-clamp-2 leading-relaxed">{post.content}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleBanUser(post.owner_id, post.owner.username)}
                                                                className="p-3 text-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                                                title="Ban User"
                                                            >
                                                                <UserMinus className="w-5 h-5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePost(post.id)}
                                                                className="p-3 text-foreground/20 hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                                                                title="Delete Post"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Pagination */}
                                        <div className="flex items-center justify-center gap-4 pt-6">
                                            <button
                                                disabled={postPage === 0}
                                                onClick={() => setPostPage(p => p - 1)}
                                                className="p-3 bg-card border border-primary/5 rounded-full text-foreground/40 hover:text-primary disabled:opacity-30 disabled:hover:text-foreground/40 transition-all font-sans"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <span className="text-xs font-black uppercase tracking-widest font-sans text-foreground/60">Page {postPage + 1}</span>
                                            <button
                                                disabled={posts.length < postLimit}
                                                onClick={() => setPostPage(p => p + 1)}
                                                className="p-3 bg-card border border-primary/5 rounded-full text-foreground/40 hover:text-primary disabled:opacity-30 disabled:hover:text-foreground/40 transition-all font-sans"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* TAB: ROOMS */}
                        {currentTab === 'rooms' && (
                            <div className="space-y-6">
                                <div className="flex justify-end mb-6">
                                    <button
                                        onClick={() => setShowCreateRoom(!showCreateRoom)}
                                        className="btn-primary flex items-center gap-2 text-[10px] uppercase font-black tracking-widest px-6 py-3"
                                    >
                                        <Plus className="w-4 h-4" /> Create Collective
                                    </button>
                                </div>

                                {showCreateRoom && (
                                    <div className="glass-card bg-primary/5 border-primary/10 rounded-[2rem] p-8 mb-8 animate-fade-in">
                                        <form onSubmit={handleCreateRoom} className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Subspace Name (e.g. JEE Advance)"
                                                className="w-full bg-background/50 border border-primary/10 rounded-full px-8 py-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                value={newRoomName}
                                                onChange={e => setNewRoomName(e.target.value)}
                                                required
                                            />
                                            <textarea
                                                placeholder="Vision and purpose..."
                                                className="w-full bg-background/50 border border-primary/10 rounded-[1.5rem] px-8 py-4 text-sm font-sans h-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                value={newRoomDesc}
                                                onChange={e => setNewRoomDesc(e.target.value)}
                                                required
                                            />
                                            <div className="flex justify-end gap-3 pt-2 font-sans font-black">
                                                <button type="button" onClick={() => setShowCreateRoom(false)} className="px-6 py-3 text-foreground/40 hover:text-foreground text-[10px] uppercase tracking-widest">Cancel</button>
                                                <button type="submit" className="px-10 py-3 bg-primary text-white rounded-full shadow-lg shadow-primary/20 text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Launch</button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {rooms.map(room => (
                                        <div key={room.id} className="glass-card bg-white/40 dark:bg-black/40 border border-primary/5 rounded-[1.8rem] p-6 hover:border-primary/20 transition-all duration-300 flex justify-between items-center group">
                                            <div>
                                                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{room.name}</h4>
                                                <p className="text-[10px] text-foreground/40 font-sans mt-0.5 uppercase tracking-wider line-clamp-1">{room.description}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteRoom(room.id)}
                                                className="p-3 text-foreground/10 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

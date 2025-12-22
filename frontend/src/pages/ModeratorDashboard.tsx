import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getModeratorPosts, deletePostAsModerator } from '../services/api';
import Header from '../components/Header';
import { Trash2, ShieldAlert, Clock, User as UserIcon } from 'lucide-react';
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
    room_id: number;
}

export default function ModeratorDashboard() {
    const { user, isAuthenticated } = useAuth();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated && (user?.role === 'moderator' || user?.role === 'admin')) {
            fetchPosts();
        } else {
            setLoading(false);
            setError("Unauthorized Access");
        }
    }, [isAuthenticated, user]);

    const fetchPosts = async () => {
        try {
            const data = await getModeratorPosts();
            setPosts(data);
        } catch (err) {
            console.error("Failed to fetch posts", err);
            setError("Failed to load moderation queue.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId: number) => {
        if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
            try {
                await deletePostAsModerator(postId);
                setPosts(posts.filter(p => p.id !== postId));
            } catch (err) {
                alert("Failed to delete post");
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen">Loading dashboard...</div>;

    // Authorization Check UI
    if (user?.role !== 'moderator' && user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
                <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
                <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view the moderator dashboard.</p>
                <p className="text-sm mt-4 text-gray-500">Current Role: {user?.role || "undefined"}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-red-500/10 rounded-xl">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Moderator Dashboard</h1>
                        <p className="text-muted-foreground">Manage content and community safety</p>
                    </div>
                </div>

                {error && <div className="p-4 mb-6 bg-destructive/10 text-destructive rounded-lg">{error}</div>}

                <div className="grid gap-6">
                    {posts.length === 0 ? (
                        <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed">
                            <p className="text-muted-foreground">No posts to moderate.</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="bg-card border border-border rounded-xl p-6 transition-all hover:shadow-lg">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs font-semibold">
                                                Room #{post.room_id}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <UserIcon className="w-3 h-3" />
                                                @{post.owner.username}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                                        <p className="text-muted-foreground line-clamp-3">{post.content}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                                        title="Delete Post"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { MessageSquare, Heart, Send } from 'lucide-react';
import { toggleLike, getLikes, getComments, createComment } from '../services/api';

interface Post {
    id: number;
    title: string;
    content: string;
    created_at: string;
    owner_id: number;
    owner?: {
        username: string;
    };
}

interface Comment {
    id: number;
    content: string;
    owner: {
        username: string;
    };
    created_at: string;
}

export default function PostItem({ post }: { post: Post }) {
    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        // Fetch likes
        getLikes(post.id).then(data => {
            setLikesCount(data.count);
            setIsLiked(data.is_liked);
        });
    }, [post.id]);

    const handleLike = async () => {
        const res = await toggleLike(post.id);
        setIsLiked(res.liked);
        setLikesCount(prev => res.liked ? prev + 1 : prev - 1);
    };

    const toggleComments = async () => {
        if (!showComments) {
            // Load comments
            const data = await getComments(post.id);
            setComments(data);
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const added = await createComment(post.id, newComment);
            setComments([...comments, added]);
            setNewComment('');
        } catch (error) {
            console.error("Failed to comment", error);
        }
    };

    return (
        <div className="glass-card bg-white/20 dark:bg-black/20 border-primary/5 rounded-[2rem] p-8 hover:border-primary/20 transition-all duration-500 group shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
            <h3 className="text-2xl font-bold text-foreground mb-4 leading-tight">{post.title}</h3>
            <p className="text-foreground/60 text-sm mb-8 whitespace-pre-wrap leading-loose font-sans">{post.content}</p>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-foreground/30 border-t border-primary/5 pt-6 mt-2 font-sans">
                <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] text-white">
                            {post.owner?.username?.substring(0, 1).toUpperCase() || 'U'}
                        </div>
                        <span className="text-foreground/40">{post.owner?.username || 'User'}</span>
                    </div>
                    <span className="opacity-30">•</span>
                    <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-2 transition-all duration-300 px-4 py-2 rounded-full border ${isLiked ? 'text-primary border-primary bg-primary/5' : 'text-foreground/30 border-primary/5 hover:border-primary/20 hover:text-primary hover:bg-primary/5'}`}
                    >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{likesCount}</span>
                    </button>
                    <button
                        onClick={toggleComments}
                        className="flex items-center space-x-2 transition-all duration-300 px-4 py-2 rounded-full border border-primary/5 text-foreground/30 hover:border-primary/20 hover:text-primary hover:bg-primary/5"
                    >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{comments.length > 0 ? comments.length : ''} Voice{comments.length !== 1 ? 's' : ''}</span>
                    </button>
                </div>
            </div>

            {showComments && (
                <div className="mt-8 pt-8 border-t border-primary/5 space-y-6 animate-slide-up">
                    {comments.length > 0 && (
                        <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar pr-4">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex space-x-4">
                                    <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-primary/40">
                                        {comment.owner?.username?.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div className="flex-1 bg-primary/5 rounded-[1.5rem] rounded-tl-none p-4 border border-primary/5">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-foreground/60 text-[10px] uppercase tracking-widest font-sans">{comment.owner?.username}</span>
                                            <span className="text-[10px] text-foreground/20 font-sans">{new Date(comment.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-foreground/70 text-sm leading-relaxed font-sans">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleAddComment} className="flex gap-4 items-center sticky bottom-0 bg-transparent pt-4">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white">
                            S
                        </div>
                        <div className="flex-1 relative group">
                            <input
                                type="text"
                                placeholder="Add your voice to the discussion..."
                                className="w-full bg-primary/5 border border-primary/5 rounded-full px-6 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder-foreground/20 font-sans"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-full hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                disabled={!newComment.trim()}
                            >
                                <Send className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

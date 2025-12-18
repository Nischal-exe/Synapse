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
        <div className="bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm border border-zinc-200 dark:border-white/5 rounded-2xl p-6 hover:border-zinc-300 dark:hover:border-white/10 hover:bg-white dark:hover:bg-zinc-900/60 transition-all duration-300 group shadow-lg hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50">
            <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-100 mb-3 leading-tight group-hover:text-black dark:group-hover:text-white transition-colors">{post.title}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-6 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            <div className="flex items-center justify-between text-xs font-medium text-zinc-500 border-t border-zinc-100 dark:border-white/5 pt-4 mt-2">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold">
                            {post.owner?.username?.substring(0, 1).toUpperCase() || 'U'}
                        </div>
                        <span className="text-zinc-500 dark:text-zinc-400">{post.owner?.username || 'User'}</span>
                    </div>
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={handleLike}
                        className={`flex items-center space-x-1.5 transition-all duration-200 px-3 py-1.5 rounded-full ${isLiked ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10' : 'hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5'}`}
                    >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{likesCount}</span>
                    </button>
                    <button
                        onClick={toggleComments}
                        className="flex items-center space-x-1.5 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 px-3 py-1.5 rounded-full transition-all duration-200"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span>{comments.length > 0 ? comments.length : ''} Comment{comments.length !== 1 ? 's' : ''}</span>
                    </button>
                </div>
            </div>

            {showComments && (
                <div className="mt-6 pt-6 border-t border-zinc-100 dark:border-white/5 space-y-5 animate-slide-up">
                    {comments.length > 0 && (
                        <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                                        {comment.owner?.username?.substring(0, 1).toUpperCase()}
                                    </div>
                                    <div className="flex-1 bg-zinc-50 dark:bg-white/5 rounded-2xl rounded-tl-none p-3 border border-zinc-100 dark:border-white/5">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">{comment.owner?.username}</span>
                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-600">{new Date(comment.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed">{comment.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleAddComment} className="flex gap-3 items-center sticky bottom-0 bg-transparent pt-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-900 flex items-center justify-center flex-shrink-0 text-xs font-bold text-zinc-500 dark:text-zinc-400">
                            Me
                        </div>
                        <div className="flex-1 relative group">
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 focus:ring-1 focus:ring-zinc-400/50 dark:focus:ring-zinc-500/50 transition-all placeholder-zinc-500 dark:placeholder-zinc-600"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                required
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black dark:bg-white text-white dark:text-black p-1.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

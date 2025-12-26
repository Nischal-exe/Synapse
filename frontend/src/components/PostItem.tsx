import { useState, useEffect } from 'react';
import { MessageSquare, Heart, Send, Pencil, Trash2, X, Check, Link as LinkIcon } from 'lucide-react';
import { toggleLike, getLikes, getComments, createComment, deletePost, updatePost, deleteComment, updateComment } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface Post {
    id: number;
    title: string;
    content: string;
    created_at: string;
    owner_id: number;
    room_id: number;
    attachment_url?: string;
    owner?: {
        username: string;
    };
}

interface Comment {
    id: number;
    content: string;
    owner_id: number;
    owner: {
        username: string;
    };
    created_at: string;
}

interface PostItemProps {
    post: Post;
    onDelete?: (postId: number) => void;
    onUpdate?: (postId: number, updatedPost: Post) => void;
}

export default function PostItem({ post, onDelete, onUpdate }: PostItemProps) {
    const { user } = useAuth();
    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    // Post Edit State
    const [isEditingPost, setIsEditingPost] = useState(false);
    const [editPostTitle, setEditPostTitle] = useState(post.title);
    const [editPostContent, setEditPostContent] = useState(post.content);

    // Comment Edit State (Track editing comment ID)
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editCommentContent, setEditCommentContent] = useState('');

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

    // Post Actions
    const handleDeletePost = async () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            try {
                await deletePost(post.id);
                if (onDelete) onDelete(post.id);
            } catch (error) {
                console.error("Failed to delete post", error);
            }
        }
    };

    const handleUpdatePost = async () => {
        try {
            const updated = await updatePost(post.id, { title: editPostTitle, content: editPostContent });
            if (onUpdate) {
                onUpdate(post.id, updated);
            }
            setIsEditingPost(false);
        } catch (error) {
            console.error("Failed to update post", error);
        }
    };

    // Comment Actions
    const handleDeleteComment = async (commentId: number) => {
        if (window.confirm("Delete this comment?")) {
            try {
                await deleteComment(commentId);
                setComments(comments.filter(c => c.id !== commentId));
            } catch (error) {
                console.error("Failed to delete comment", error);
            }
        }
    };

    const startEditComment = (comment: Comment) => {
        setEditingCommentId(comment.id);
        setEditCommentContent(comment.content);
    };

    const handleUpdateComment = async (commentId: number) => {
        try {
            const updated = await updateComment(commentId, editCommentContent);
            setComments(comments.map(c => c.id === commentId ? updated : c));
            setEditingCommentId(null);
        } catch (error) {
            console.error("Failed to update comment", error);
        }
    };

    const isPostOwner = user?.id === post.owner_id || user?.role === 'admin' || user?.role === 'moderator'; // Simplify for now

    return (
        <div className="group/post flex-1 relative group/content">
            {/* Premium Glow Effect on Hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-[2.5rem] blur opacity-0 group-hover/content:opacity-100 transition duration-500 pointer-events-none"></div>

            <div className="relative glass-card bg-white/60 dark:bg-black/60 border-primary/10 rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-10 hover:border-primary/30 hover:bg-white/80 dark:hover:bg-black/80 transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.05)] transform hover:-translate-y-1">
                {/* Post Header / Edit Mode */}
                {isEditingPost ? (
                    <div className="mb-6 space-y-4">
                        <input
                            type="text"
                            value={editPostTitle}
                            onChange={e => setEditPostTitle(e.target.value)}
                            className="w-full bg-background/50 border border-primary/20 rounded-xl px-4 py-2 text-lg sm:text-xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <textarea
                            value={editPostContent}
                            onChange={e => setEditPostContent(e.target.value)}
                            className="w-full bg-background/50 border border-primary/20 rounded-xl px-4 py-2 min-h-[100px] text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setIsEditingPost(false)} className="p-2 rounded-full hover:bg-red-500/10 text-red-500"><X className="w-4 h-4 sm:w-5 h-5" /></button>
                            <button type="button" onClick={handleUpdatePost} className="p-2 rounded-full hover:bg-green-500/10 text-green-500"><Check className="w-4 h-4 sm:w-5 h-5" /></button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-start mb-4 sm:mb-6">
                            <h3 className="text-xl sm:text-3xl font-extrabold text-foreground leading-[1.2] tracking-tight group-hover/post:text-primary transition-colors duration-300 pr-4 sm:pr-8">{post.title}</h3>
                            {isPostOwner && (
                                <div className="flex gap-1 sm:gap-2 opacity-0 group-hover/post:opacity-100 transition-opacity duration-300 shrink-0">
                                    <button onClick={() => setIsEditingPost(true)} className="p-2 sm:p-2.5 text-foreground/30 hover:text-primary hover:bg-primary/5 rounded-full transition-all">
                                        <Pencil className="w-3.5 h-3.5 sm:w-4 h-4" />
                                    </button>
                                    <button onClick={handleDeletePost} className="p-2 sm:p-2.5 text-foreground/30 hover:text-destructive hover:bg-destructive/5 rounded-full transition-all">
                                        <Trash2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="text-foreground/70 text-sm sm:text-lg mb-6 sm:mb-10 whitespace-pre-wrap leading-relaxed font-sans">{post.content}</p>

                        {post.attachment_url && (
                            <div className="mb-6 sm:mb-8">
                                <a
                                    href={post.attachment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary/5 text-primary rounded-full text-[9px] sm:text-[11px] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] hover:bg-primary/10 transition-all border border-primary/10 transform hover:scale-105 active:scale-95 shadow-sm"
                                >
                                    <LinkIcon className="w-3.5 h-3.5 sm:w-4 h-4" />
                                    <span>Resource</span>
                                </a>
                            </div>
                        )}
                    </>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6 text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-foreground/30 border-t border-primary/5 pt-6 sm:pt-8 mt-2 sm:mt-4 font-sans">
                    <div className="flex items-center space-x-3 sm:space-x-6">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-8 h-8 sm:w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] sm:text-xs text-primary font-black shadow-inner">
                                {post.owner?.username?.substring(0, 1).toUpperCase() || 'U'}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-foreground/60 font-black tracking-widest truncate max-w-[80px] sm:max-w-none">{post.owner?.username || 'User'}</span>
                                <span className="text-[8px] sm:text-[9px] font-medium opacity-50 lowercase">{new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <button
                            onClick={handleLike}
                            className={`flex items-center space-x-2 sm:space-x-3 transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border ${isLiked ? 'bg-primary/10 border-primary/20 text-primary' : 'border-primary/5 bg-primary/[0.02] text-foreground/40 hover:border-primary/20 hover:text-primary hover:bg-primary/5'} font-black group/like-btn`}
                        >
                            <Heart className={`w-3.5 h-3.5 sm:w-4 h-4 group-hover/like-btn:scale-110 transition-transform ${isLiked ? 'fill-current' : ''}`} />
                            <span className="text-[8px] sm:text-[10px]">{likesCount > 0 ? likesCount : ''} <span className="hidden xs:inline">Like{likesCount !== 1 ? 's' : ''}</span></span>
                        </button>
                        <button
                            onClick={toggleComments}
                            className="flex items-center space-x-2 sm:space-x-3 transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full border border-primary/5 bg-primary/[0.02] text-foreground/40 hover:border-primary/20 hover:text-primary hover:bg-primary/5 font-black group/comment-btn"
                        >
                            <MessageSquare className="w-3.5 h-3.5 sm:w-4 h-4 group-hover/comment-btn:scale-110 transition-transform" />
                            <span className="text-[8px] sm:text-[10px]">{comments.length > 0 ? comments.length : ''} <span className="hidden xs:inline">Comment{comments.length !== 1 ? 's' : ''}</span></span>
                        </button>
                    </div>
                </div>

                {showComments && (
                    <div className="mt-8 pt-8 border-t border-primary/5 space-y-6 animate-slide-up">
                        {comments.length > 0 && (
                            <div className="space-y-6 max-h-96 overflow-y-auto custom-scrollbar pr-4">
                                {comments.map(comment => {
                                    const isCommentOwner = user?.id === comment.owner_id || user?.role === 'admin' || user?.role === 'moderator';
                                    const isEditing = editingCommentId === comment.id;

                                    return (
                                        <div key={comment.id} className="flex space-x-4 group/comment">
                                            <div className="w-8 h-8 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-primary/40">
                                                {comment.owner?.username?.substring(0, 1).toUpperCase()}
                                            </div>
                                            <div className="flex-1 bg-primary/5 rounded-[1.5rem] rounded-tl-none p-4 border border-primary/5 relative">
                                                {isEditing ? (
                                                    <div className="space-y-2">
                                                        <textarea
                                                            value={editCommentContent}
                                                            onChange={e => setEditCommentContent(e.target.value)}
                                                            className="w-full bg-white/50 border border-primary/20 rounded-lg p-2 text-sm focus:outline-none"
                                                        />
                                                        <div className="flex gap-2 justify-end">
                                                            <button onClick={() => setEditingCommentId(null)} className="text-xs text-red-500 hover:underline">Cancel</button>
                                                            <button onClick={() => handleUpdateComment(comment.id)} className="text-xs text-green-500 hover:underline">Save</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-bold text-foreground/60 text-[10px] uppercase tracking-widest font-sans">{comment.owner?.username}</span>
                                                                <span className="text-[10px] text-foreground/20 font-sans">{new Date(comment.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            {isCommentOwner && (
                                                                <div className="flex gap-2 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                                                    <button onClick={() => startEditComment(comment)} className="text-foreground/20 hover:text-primary"><Pencil className="w-3 h-3" /></button>
                                                                    <button onClick={() => handleDeleteComment(comment.id)} className="text-foreground/20 hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-foreground/70 text-sm leading-relaxed font-sans">{comment.content}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <form onSubmit={handleAddComment} className="flex gap-4 items-center sticky bottom-0 bg-transparent pt-4">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white">
                                {user?.username?.[0].toUpperCase() || 'S'}
                            </div>
                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    placeholder="Add your comment to the discussion..."
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
        </div>
    );
}

import React, { useState, useEffect } from 'react';
import { getModeratorPosts, deletePost, getRooms, deleteRoom, createRoom, getAllComments, getAllMessages, deleteComment, deleteMessage } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import LoadingDots from '../components/LoadingDots';

// Data Types
interface Post {
    id: number;
    title: string;
    content: string;
    owner_id: number;
    created_at: string;
    room_id: number;
}

interface Room {
    id: number;
    name: string;
    description: string;
}

interface Comment {
    id: number;
    content: string;
    owner_id: number;
    post_id: number;
    post_title: string;
    created_at: string;
}

interface Message {
    id: number;
    content: string;
    user_id: number;
    room_id: number;
    room_name: string;
    created_at: string;
}

const ITEMS_PER_PAGE = 8;

const AdminDashboard: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'posts' | 'rooms' | 'comments' | 'messages'>('posts');
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [posts, setPosts] = useState<Post[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    // Form State (for creating rooms)
    const [showRoomModal, setShowRoomModal] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [newRoomDesc, setNewRoomDesc] = useState('');

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                // Redirect if not admin
                // navigate('/'); 
                // NOTE: For better UX, you might want to show a specialized 403 page
                // But for now, let's just allow rendering if the check passes, or handled by route protection
            }
            fetchData();
        }
    }, [user, authLoading, activeTab]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if (activeTab === 'posts') {
                const data = await getModeratorPosts();
                setPosts(data);
            } else if (activeTab === 'rooms') {
                const data = await getRooms();
                setRooms(data);
            } else if (activeTab === 'comments') {
                const data = await getAllComments();
                setComments(data);
            } else if (activeTab === 'messages') {
                const data = await getAllMessages();
                setMessages(data);
            }
        } catch (error) {
            console.error("Failed to fetch admin data", error);
            showToast("Failed to load data. Please check your permissions.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createRoom({ name: newRoomName, description: newRoomDesc });
            setShowRoomModal(false);
            setNewRoomName('');
            setNewRoomDesc('');
            showToast('Room created successfully!', 'success');
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Create room failed", error);
            showToast('Failed to create room. Please try again.', 'error');
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) return;

        try {
            if (activeTab === 'posts') {
                await deletePost(id);
                setPosts(posts.filter(p => p.id !== id));
                showToast('Post deleted successfully', 'success');
            } else if (activeTab === 'rooms') {
                await deleteRoom(id);
                setRooms(rooms.filter(r => r.id !== id));
                showToast('Room deleted successfully', 'success');
            } else if (activeTab === 'comments') {
                await deleteComment(id);
                setComments(comments.filter(c => c.id !== id));
                showToast('Comment deleted successfully', 'success');
            } else if (activeTab === 'messages') {
                await deleteMessage(id);
                setMessages(messages.filter(m => m.id !== id));
                showToast('Message deleted successfully', 'success');
            }
        } catch (error) {
            console.error("Delete failed", error);
            showToast('Failed to delete item. Please try again.', 'error');
        }
    };

    const getCurrentData = () => {
        switch (activeTab) {
            case 'posts': return posts;
            case 'rooms': return rooms;
            case 'comments': return comments;
            case 'messages': return messages;
            default: return [];
        }
    };

    const data = getCurrentData();
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const currentItems = data.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (authLoading) return <div className="min-h-screen bg-[#0f0f10] flex items-center justify-center"><LoadingDots /></div>;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen bg-[#0f0f10] text-gray-200 font-sans">
            {/* Sidebar - Hidden on mobile, shown on desktop */}
            <aside className="hidden lg:block lg:w-64 border-r border-gray-800 bg-[#161618] flex-shrink-0">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Admin Panel
                    </h1>
                </div>
                <nav className="p-4 space-y-2">
                    <button
                        onClick={() => { setActiveTab('posts'); setCurrentPage(1); }}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'posts'
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                            : 'hover:bg-gray-800 text-gray-400'
                            }`}
                    >
                        <span className="font-medium">Recent Posts</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('rooms'); setCurrentPage(1); }}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'rooms'
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                            : 'hover:bg-gray-800 text-gray-400'
                            }`}
                    >
                        <span className="font-medium">Rooms</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('comments'); setCurrentPage(1); }}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'comments'
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                            : 'hover:bg-gray-800 text-gray-400'
                            }`}
                    >
                        <span className="font-medium">Comments</span>
                    </button>
                    <button
                        onClick={() => { setActiveTab('messages'); setCurrentPage(1); }}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'messages'
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                            : 'hover:bg-gray-800 text-gray-400'
                            }`}
                    >
                        <span className="font-medium">Messages</span>
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                {/* Mobile Header with Title */}
                <div className="mb-6 lg:hidden">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                        Admin Panel
                    </h1>
                </div>

                {/* Mobile Tabs - Horizontal scroll on mobile */}
                <div className="lg:hidden mb-6 overflow-x-auto">
                    <div className="flex gap-2 min-w-max pb-2">
                        <button
                            onClick={() => { setActiveTab('posts'); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'posts'
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                : 'bg-gray-800 text-gray-400'
                                }`}
                        >
                            Posts
                        </button>
                        <button
                            onClick={() => { setActiveTab('rooms'); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'rooms'
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                : 'bg-gray-800 text-gray-400'
                                }`}
                        >
                            Rooms
                        </button>
                        <button
                            onClick={() => { setActiveTab('comments'); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'comments'
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                : 'bg-gray-800 text-gray-400'
                                }`}
                        >
                            Comments
                        </button>
                        <button
                            onClick={() => { setActiveTab('messages'); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'messages'
                                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                : 'bg-gray-800 text-gray-400'
                                }`}
                        >
                            Messages
                        </button>
                    </div>
                </div>

                {/* Header with Create Room Button */}
                <header className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-100">
                                {activeTab === 'posts' ? 'Recent Posts' :
                                    activeTab === 'rooms' ? 'Rooms' :
                                        activeTab === 'comments' ? 'Comments' : 'Messages'}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                Manage and moderate {activeTab}
                            </p>
                        </div>
                        {activeTab === 'rooms' && (
                            <button
                                onClick={() => setShowRoomModal(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium w-full sm:w-auto"
                            >
                                + Create Room
                            </button>
                        )}
                    </div>
                </header>

                {/* Content Table / List */}
                <div className="bg-[#161618] rounded-xl border border-gray-800 overflow-hidden shadow-2xl">
                    {isLoading ? (
                        <div className="p-12 flex justify-center text-gray-500">Loading data...</div>
                    ) : (
                        <>
                            {/* Mobile Card View */}
                            <div className="block lg:hidden p-4 space-y-4">
                                {currentItems.length > 0 ? (
                                    currentItems.map((item: any) => (
                                        <div key={item.id} className="bg-[#1c1c1f] rounded-lg p-6 border border-gray-800">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-xs font-mono text-gray-500">#{item.id}</span>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="px-3 py-1 bg-red-500/10 border border-red-500/50 text-red-500 rounded text-sm hover:bg-red-500 hover:text-white transition-all"
                                                    aria-label={`Delete ${activeTab === 'posts' ? 'post' : activeTab === 'rooms' ? 'room' : activeTab === 'comments' ? 'comment' : 'message'}`}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                            <h3 className="font-bold text-gray-200 mb-2 text-base">
                                                {activeTab === 'posts' ? item.title :
                                                    activeTab === 'rooms' ? item.name :
                                                        item.content?.substring(0, 80) + "..."}
                                            </h3>
                                            <p className="text-gray-400 text-sm mb-3">
                                                {activeTab === 'posts' ? item.content?.substring(0, 100) + "..." :
                                                    activeTab === 'rooms' ? item.description :
                                                        activeTab === 'comments' ? `Post: ${item.post_title}` :
                                                            `Room: ${item.room_name}`}
                                            </p>
                                            {(activeTab === 'posts' || activeTab === 'comments' || activeTab === 'messages') && (
                                                <p className="text-gray-500 text-xs">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-500">No items found.</div>
                                )}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-[#1c1c1f] text-xs uppercase text-gray-400 font-semibold border-b border-gray-800">
                                        <tr>
                                            <th className="px-6 py-4">ID</th>
                                            <th className="px-6 py-4">
                                                {activeTab === 'posts' ? 'Title' :
                                                    activeTab === 'rooms' ? 'Name' :
                                                        activeTab === 'comments' ? 'Comment' : 'Message'}
                                            </th>
                                            <th className="px-6 py-4">
                                                {activeTab === 'posts' ? 'Content Snippet' :
                                                    activeTab === 'rooms' ? 'Description' :
                                                        activeTab === 'comments' ? 'Post' : 'Room'}
                                            </th>
                                            <th className="px-6 py-4">
                                                {activeTab === 'posts' || activeTab === 'comments' || activeTab === 'messages' ? 'Date' : '-'}
                                            </th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {currentItems.length > 0 ? (
                                            currentItems.map((item: any) => (
                                                <tr key={item.id} className="hover:bg-gray-800/50 transition-colors group">
                                                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">#{item.id}</td>
                                                    <td className="px-6 py-4 font-medium text-gray-200">
                                                        {activeTab === 'posts' ? item.title :
                                                            activeTab === 'rooms' ? item.name :
                                                                item.content?.substring(0, 60) + "..."}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-400 truncate max-w-xs">
                                                        {activeTab === 'posts' ? item.content?.substring(0, 50) + "..." :
                                                            activeTab === 'rooms' ? item.description :
                                                                activeTab === 'comments' ? item.post_title :
                                                                    item.room_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                                        {(activeTab === 'posts' || activeTab === 'comments' || activeTab === 'messages') ?
                                                            new Date(item.created_at).toLocaleDateString() : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleDelete(item.id)}
                                                            className="px-3 py-1 bg-red-500/10 border border-red-500/50 text-red-500 rounded text-sm hover:bg-red-500 hover:text-white transition-all pointer-events-auto"
                                                            aria-label={`Delete ${activeTab === 'posts' ? 'post' : activeTab === 'rooms' ? 'room' : activeTab === 'comments' ? 'comment' : 'message'}`}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                    No items found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                {/* Pagination */}
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8">
                        {/* Mobile Pagination (Simple) */}
                        <div className="flex lg:hidden justify-between items-center px-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-[#161618] border border-gray-800 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors text-sm"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-500 font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-[#161618] border border-gray-800 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors text-sm"
                            >
                                Next
                            </button>
                        </div>

                        {/* Desktop Pagination (Detailed) */}
                        <div className="hidden lg:flex justify-center items-center space-x-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-lg bg-[#161618] border border-gray-800 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-[#161618] border border-gray-800 text-gray-400 hover:bg-gray-800'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 rounded-lg bg-[#161618] border border-gray-800 text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Create Room Modal */}
            {showRoomModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#1c1c1f] p-6 rounded-xl border border-gray-700 w-full max-w-md">
                        <h3 className="text-xl font-bold text-white mb-4">Create New Room</h3>
                        <form onSubmit={handleCreateRoom} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Room Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newRoomName}
                                    onChange={e => setNewRoomName(e.target.value)}
                                    className="w-full px-3 py-2 bg-[#161618] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    placeholder="e.g. Physics Discussion"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                                <textarea
                                    required
                                    value={newRoomDesc}
                                    onChange={e => setNewRoomDesc(e.target.value)}
                                    className="w-full px-3 py-2 bg-[#161618] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                    placeholder="Brief description..."
                                    rows={3}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowRoomModal(false)}
                                    className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                                >
                                    Create Room
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

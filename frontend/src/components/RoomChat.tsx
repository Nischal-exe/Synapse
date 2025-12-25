import { useState, useEffect, useRef } from 'react';
import api from '../services/api'; // Axios instance
import { Send, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface ChatMessage {
    id: number;
    content: string;
    created_at: string;
    user_id: number;
    owner: {
        username: string;
        id: number;
    };
}

interface RoomChatProps {
    roomId: number;
    isMember: boolean;
}

export default function RoomChat({ roomId, isMember }: RoomChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [rateLimitTimer, setRateLimitTimer] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasInitialScrolled = useRef(false);

    // WebSocket Reference
    const socketRef = useRef<WebSocket | null>(null);

    // Reset initial scroll when room changes
    useEffect(() => {
        hasInitialScrolled.current = false;
        setMessages([]); // Clear messages on room switch
    }, [roomId]);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Auto-scroll only on initial load or new messages (if near bottom)
    useEffect(() => {
        if (!hasInitialScrolled.current && messages.length > 0) {
            scrollToBottom();
            hasInitialScrolled.current = true;
        } else if (messages.length > 0) {
            // Optional: Smart auto-scroll if user is already at bottom
            scrollToBottom();
        }
    }, [messages]);

    // Initial Fetch (REST) + WebSocket Connection
    useEffect(() => {
        // 1. Fetch historical messages via REST
        const fetchHistory = async () => {
            try {
                const response = await api.get(`/rooms/${roomId}/messages`);
                setMessages(response.data);
            } catch (err) {
                console.error("Failed to fetch history", err);
            }
        };
        fetchHistory();

        // 2. Connect WebSocket
        const token = localStorage.getItem('token');
        if (!token || !isMember) return;

        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const isSecure = apiBase.startsWith('https');
        const wsProtocol = isSecure ? 'wss' : 'ws';
        // Remove protocol (http:// or https://) to get host
        const host = apiBase.replace(/^https?:\/\//, '').replace(/\/$/, '');

        const wsUrl = `${wsProtocol}://${host}/rooms/${roomId}/ws?token=${token}`;

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log("Connected to Chat WS");
            setError(null);
        };

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                // Check if message already exists (optimistic update handling)
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev;
                    return [...prev, data];
                });
            } catch (e) {
                console.error("WS Parse Error", e);
            }
        };

        socket.onclose = (e) => {
            console.log("Chat WS Closed", e.code, e.reason);
            // Don't show error if it's just a normal close or if we are not a member anymore (handled by effect cleanup)
            if (e.code === 1008) {
                setError(e.reason || "Access Denied");
            }
        };

        socket.onerror = (error) => {
            console.error("WS Error", error);
        };

        return () => {
            socket.close();
        };
    }, [roomId, isMember]);

    // Rate Limit Timer Countdowm
    useEffect(() => {
        if (rateLimitTimer === null) return;
        if (rateLimitTimer <= 0) {
            setRateLimitTimer(null);
            setError(null);
            return;
        }

        const timer = setInterval(() => {
            setRateLimitTimer((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);

        return () => clearInterval(timer);
    }, [rateLimitTimer]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isMember) {
            setError("Please join the room to participate in the chat.");
            return;
        }
        if (!newMessage.trim() || rateLimitTimer !== null) return;

        // Optimistic UI Update (optional, but makes it snappy)
        // We'll wait for server echo for simplicity unless lag is high

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ content: newMessage }));
            setNewMessage('');
            // Rate limit locally
            setRateLimitTimer(1);
        } else {
            setError("Connection lost. Reconnecting...");
        }
    };

    return (
        <div className="flex flex-col h-full bg-background/40 backdrop-blur-xl">
            {/* Header */}
            <div className="p-6 border-b border-primary/5 bg-primary/[0.03] backdrop-blur-md">
                <h3 className="text-sm font-bold text-foreground flex items-center">
                    <span className={`w-1.5 h-1.5 rounded-full mr-3 animate-pulse ${socketRef.current?.readyState === 1 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    Chat
                </h3>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-10">
                {messages.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-primary/5 border border-primary/5 flex items-center justify-center mb-4">
                            <Send className="w-4 h-4 text-primary/20" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 font-sans">No messages yet.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}
                        >
                            <div className="flex items-baseline space-x-2 mb-2 px-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest font-sans ${msg.user_id === user?.id ? 'text-primary' : 'text-foreground/40'}`}>
                                    {msg.owner.username}
                                </span>
                                <span className="text-[9px] text-foreground/20 font-sans">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div
                                className={`px-4 py-2.5 rounded-[1.2rem] max-w-[90%] break-words text-sm font-sans shadow-sm border ${msg.user_id === user?.id
                                    ? 'bg-primary text-white border-primary rounded-tr-none'
                                    : 'bg-primary/5 text-foreground/70 border-primary/5 rounded-tl-none'
                                    }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Rate Limit / Error Warning */}
            {
                error && !rateLimitTimer && (
                    <div className="mx-6 mb-4 px-4 py-3 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest font-sans flex items-center rounded-xl border border-destructive/20">
                        <AlertCircle className="w-3 h-3 mr-2" />
                        {error}
                    </div>
                )
            }

            {/* Input Area */}
            <div className="p-6 bg-primary/[0.03] border-t border-primary/5 mt-auto">
                <form onSubmit={handleSendMessage} className="relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={!isMember ? "Join room to chat..." : (rateLimitTimer ? `Please wait ${rateLimitTimer}s...` : "Type a message...")}
                        className={`w-full bg-background/50 border border-primary/10 rounded-full pl-6 pr-14 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-sans ${rateLimitTimer || !isMember ? 'cursor-not-allowed opacity-50' : ''}`}
                        disabled={rateLimitTimer !== null || !isMember}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || rateLimitTimer !== null}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full transition-all ${!newMessage.trim() || rateLimitTimer !== null
                            ? 'text-foreground/20'
                            : 'text-white bg-primary shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'
                            }`}
                    >
                        {rateLimitTimer ? (
                            <span className="text-[10px] font-black font-sans">{rateLimitTimer}</span>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>

                    {rateLimitTimer !== null && (
                        <div className="absolute -top-12 left-0 right-0 flex justify-center">
                            <div className="bg-background/90 backdrop-blur-md text-[9px] font-black uppercase tracking-widest text-primary/60 px-4 py-1.5 rounded-full border border-primary/10 flex items-center shadow-xl font-sans">
                                <Clock className="w-2.5 h-2.5 mr-2" />
                                Rhythm enforced: {rateLimitTimer} s
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

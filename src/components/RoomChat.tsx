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
}

export default function RoomChat({ roomId }: RoomChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rateLimitTimer, setRateLimitTimer] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Poll for messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await api.get(`/rooms/${roomId}/messages`);
                // Simple optimization: only update if length changes or last ID changes
                // For now, just setting it is fine, React handles diffing
                setMessages(response.data);
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds

        return () => clearInterval(interval);
    }, [roomId]);

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
        if (!newMessage.trim() || rateLimitTimer !== null) return;

        setLoading(true);
        setError(null);

        try {
            await api.post(`/rooms/${roomId}/messages`, {
                content: newMessage,
                room_id: roomId
            });
            setNewMessage('');
            // Optimistic update or immediate fetch could happen here
            const response = await api.get(`/rooms/${roomId}/messages`);
            setMessages(response.data);

            // Start local 30s timer as feedback (though backend enforces it too)
            // But if we hit 429, we'll use the backend's ttl if parsing allows, 
            // or just default to 30.
            // Let's just rely on error catching for 429 to be robust.
            // Actually, for better UX, let's start a timer on success too so user knows.
            setRateLimitTimer(30);

        } catch (err: any) {
            if (err.response && err.response.status === 429) {
                // Try to parse "Please wait X seconds"
                // Or just set to 30
                setError(err.response.data.detail || "Rate limit exceeded");
                setRateLimitTimer(30);
            } else {
                setError("Failed to send message");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background border-l border-border">
            {/* Header */}
            <div className="p-4 border-b border-border bg-card/50 backdrop-blur-md">
                <h3 className="font-bold text-foreground flex items-center">
                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    Live Chat
                </h3>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-10 opacity-70">
                        <p>No messages yet.</p>
                        <p>Be the first to say hi!</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col ${msg.user_id === user?.id ? 'items-end' : 'items-start'}`}
                        >
                            <div className="flex items-baseline space-x-2 mb-1">
                                <span className={`text-xs font-bold ${msg.user_id === user?.id ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {msg.owner.username}
                                </span>
                                <span className="text-[10px] text-muted-foreground/60">
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div
                                className={`px-4 py-2 rounded-2xl max-w-[85%] break-words text-sm shadow-sm ${msg.user_id === user?.id
                                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                                        : 'bg-muted text-foreground rounded-tl-none'
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
            {error && !rateLimitTimer && (
                <div className="px-4 py-2 bg-destructive/10 text-destructive text-xs font-semibold flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {error}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-card/50 border-t border-border mt-auto">
                <form onSubmit={handleSendMessage} className="relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={rateLimitTimer ? `Wait ${rateLimitTimer}s...` : "Type a message..."}
                        className={`w-full bg-muted/50 border border-input rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all ${rateLimitTimer ? 'cursor-not-allowed opacity-50' : ''}`}
                        disabled={rateLimitTimer !== null || loading}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || rateLimitTimer !== null || loading}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${!newMessage.trim() || rateLimitTimer !== null
                                ? 'text-muted-foreground/50 cursor-not-allowed'
                                : 'text-primary hover:bg-primary/10'
                            }`}
                    >
                        {rateLimitTimer ? (
                            <span className="text-xs font-bold w-5 text-center block">{rateLimitTimer}</span>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>

                    {rateLimitTimer !== null && (
                        <div className="absolute -top-8 left-0 right-0 flex justify-center">
                            <div className="bg-background/80 backdrop-blur text-xs font-medium text-muted-foreground px-3 py-1 rounded-full border border-border flex items-center shadow-sm">
                                <Clock className="w-3 h-3 mr-1.5" />
                                Slow mode active: {rateLimitTimer}s
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

import axios from 'axios';

const envUrl = import.meta.env.VITE_API_BASE_URL;
const apiBaseUrl = (envUrl && envUrl !== 'undefined' && envUrl !== '')
    ? envUrl
    : 'https://synapse-backend-elo0.onrender.com';

const api = axios.create({
    baseURL: apiBaseUrl,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Room APIs
export const getMe = async () => {
    const response = await api.get('/users/me');
    return response.data;
};

export const getRooms = async () => {
    const response = await api.get('/rooms/');
    return response.data;
};

// Post APIs
export const getPosts = async (roomId?: number) => {
    const params = roomId ? { room_id: roomId } : {};
    const response = await api.get('/posts/', { params });
    return response.data;
};

export const createPost = async (postData: { title: string; content: string; room_id: number }) => {
    const response = await api.post('/posts/', postData);
    return response.data;
};

export const updatePost = async (postId: number, postData: { title?: string; content?: string }) => {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
};

export const savePost = async (postId: number) => {
    const response = await api.post(`/users/saved/${postId}`);
    return response.data;
};

export const getSavedPosts = async () => {
    const response = await api.get('/users/saved');
    return response.data;
};

// Social APIs
export const toggleLike = async (postId: number) => {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
};

export const getLikes = async (postId: number) => {
    const response = await api.get(`/posts/${postId}/likes`);
    return response.data;
};

export const getComments = async (postId: number) => {
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
};

export const createComment = async (postId: number, content: string, parentId?: number) => {
    const response = await api.post(`/posts/${postId}/comments`, { content, post_id: postId, parent_id: parentId });
    return response.data;
};

// Activity & Sidebar APIs
export const getSidebarData = async () => {
    const response = await api.get('/users/me/sidebar');
    return response.data;
};

export const joinRoom = async (roomId: number) => {
    const response = await api.post(`/rooms/${roomId}/join`);
    return response.data;
};

// Admin & Moderator APIs
export const getModeratorPosts = async () => {
    const response = await api.get('/moderator/posts');
    return response.data;
};

export const deletePost = async (postId: number) => {
    const response = await api.delete(`/posts/${postId}`);
    return response.data;
};

export const deleteRoom = async (roomId: number) => {
    const response = await api.delete(`/rooms/${roomId}`);
    return response.data;
};

export const createRoom = async (roomData: { name: string; description: string }) => {
    const response = await api.post('/rooms/', roomData);
    return response.data;
};

export const deleteMessage = async (messageId: number) => {
    const response = await api.delete(`/rooms/messages/${messageId}`);
    return response.data;
};

export const deleteComment = async (commentId: number) => {
    const response = await api.delete(`/posts/comments/${commentId}`);
    return response.data;
};

// Helper functions to get all comments and messages for admin
export const getAllComments = async () => {
    // First get all posts, then get comments for each
    const posts = await getModeratorPosts();
    const allComments = [];

    for (const post of posts) {
        try {
            const comments = await getComments(post.id);
            // Add post info to each comment for context
            const commentsWithPostInfo = comments.map((comment: any) => ({
                ...comment,
                post_title: post.title,
                post_id: post.id
            }));
            allComments.push(...commentsWithPostInfo);
        } catch (error) {
            console.error(`Failed to fetch comments for post ${post.id}`, error);
        }
    }

    return allComments;
};

export const getAllMessages = async () => {
    // First get all rooms, then get messages for each
    const rooms = await getRooms();
    const allMessages = [];

    for (const room of rooms) {
        try {
            const response = await api.get(`/rooms/${room.id}/messages`);
            const messages = response.data;
            // Add room info to each message for context
            const messagesWithRoomInfo = messages.map((message: any) => ({
                ...message,
                room_name: room.name,
                room_id: room.id
            }));
            allMessages.push(...messagesWithRoomInfo);
        } catch (error) {
            console.error(`Failed to fetch messages for room ${room.id}`, error);
        }
    }

    return allMessages;
};

export default api;

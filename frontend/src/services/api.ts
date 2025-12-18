import axios from 'axios';

console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
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

export default api;

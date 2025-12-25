import axios from 'axios';

const envUrl = import.meta.env.VITE_API_BASE_URL;
const apiBaseUrl = (envUrl && envUrl !== 'undefined' && envUrl !== '')
    ? envUrl
    : 'http://localhost:8000';

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

export const deleteUser = async () => {
    const response = await api.delete('/users/me');
    return response.data;
};

export const getRooms = async () => {
    const response = await api.get('/rooms/');
    return response.data;
};

// Post APIs
export const getPosts = async (roomId?: number, search?: string) => {
    const params: any = {};
    if (roomId) params.room_id = roomId;
    if (search) params.search = search;

    const response = await api.get('/posts/', { params });
    return response.data;
};

export const createPost = async (postData: { title: string; content: string; room_id: number; attachment_url?: string }) => {
    const response = await api.post('/posts/', postData);
    return response.data;
};

export const updatePost = async (postId: number, postData: { title?: string; content?: string }) => {
    const response = await api.put(`/posts/${postId}`, postData);
    return response.data;
};



export const deletePost = async (postId: number) => {
    const response = await api.delete(`/posts/${postId}`);
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

export const updateComment = async (commentId: number, content: string) => {
    const response = await api.put(`/posts/comments/${commentId}`, { content });
    return response.data;
};

export const deleteComment = async (commentId: number) => {
    const response = await api.delete(`/posts/comments/${commentId}`);
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

// Moderator APIs
export const getModeratorPosts = async () => {
    // Assuming backend endpoint is /posts/moderator/queue or similar, but checking requirement it says /moderator/posts
    const response = await api.get('/moderator/posts');
    return response.data;
};

export const deletePostAsModerator = async (postId: number) => {
    const response = await api.delete(`/moderator/posts/${postId}`);
    return response.data;
};

export const deleteUserByAdmin = async (userId: number) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
};

export default api;

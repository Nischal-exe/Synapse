import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
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
export const getRooms = async () => {
    const response = await api.get('/rooms/');
    return response.data;
};

export const joinRoom = async (roomId: number) => {
    const response = await api.post(`/rooms/${roomId}/join`);
    return response.data;
};

export default api;

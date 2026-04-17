import axios from 'axios';

// Helper to strip trailing slash
const cleanUrl = (url) => url ? url.replace(/\/+$/, '') : '';

const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    url = cleanUrl(url);

    // Ensure it ends with /api
    if (!url.endsWith('/api')) {
        url += '/api';
    }
    return url;
};

const BASE_URL = getBaseUrl();
console.log(`%c [API Config] Base URL: ${BASE_URL}`, 'background: #222; color: #bada55; font-size: 14px');

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

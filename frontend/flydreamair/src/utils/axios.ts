// src/lib/axios.js (or wherever you configure Axios)
import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/',
    withCredentials: true, // !! IMPORTANT: This tells Axios to send cookies !!
});

// Optional: Add interceptors for error handling, etc.
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle errors globally if needed
        console.error('API call error:', error.response || error.message);
        return Promise.reject(error);
    }
);

export default apiClient;

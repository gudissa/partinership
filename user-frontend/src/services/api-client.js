import axios, { CanceledError } from "axios";

// Use Vite env var and strip trailing slash; fallback to localhost:5000
const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseUrl = rawBase.replace(/\/$/, "");

// Create Axios instance with better defaults
const apiClient = axios.create({
  baseURL: `${baseUrl}/api/v1`,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Request interceptor to add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      // You can dispatch a toast notification here if needed
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        isNetworkError: true,
      });
    }

    // Handle 401 Unauthorized - clear token and redirect to login
    if (error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optionally redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden
    if (error.response.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    // Handle 500 Server Error
    if (error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Log API base URL in development
if (import.meta.env.DEV) {
  console.log('🔗 API Client configured:', `${baseUrl}/api/v1`);
}

export default apiClient;
export { CanceledError, baseUrl };

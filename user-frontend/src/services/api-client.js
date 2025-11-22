import axios, { CanceledError } from "axios";

// Use Vite env var and strip trailing slash; fallback to localhost:5000
const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseUrl = rawBase.replace(/\/$/, "");

// Create Axios instance
const apiClient = axios.create({
  baseURL: `${baseUrl}/api/v1`,
});

// Interceptor to add token to headers
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Get token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
export { CanceledError, baseUrl };

import axios from "axios";

// Use Vite environment variable VITE_API_URL to allow changing API IP/host.
// Falls back to localhost:5000 if not set. Strip trailing slash if present.
const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseURL = rawBase.replace(/\/$/, "");
const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

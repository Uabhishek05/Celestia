import axios from "axios";

function resolveApiBaseUrl() {
  const configured = (import.meta.env.VITE_API_URL || "").trim();
  const fallback = "http://localhost:5000/api";

  if (!configured) {
    return fallback;
  }

  const normalized = configured.replace(/\/$/, "");
  return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
}

const api = axios.create({
  baseURL: resolveApiBaseUrl()
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("celestia-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

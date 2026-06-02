import axios from "axios";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function getRuntimeApiBaseUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:8000";
  }

  return `${window.location.protocol}//${window.location.hostname}:8000`;
}

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!configuredUrl) return getRuntimeApiBaseUrl();

  if (typeof window === "undefined") return normalizeBaseUrl(configuredUrl);

  try {
    const url = new URL(configuredUrl);
    if (LOCAL_HOSTS.has(url.hostname) && !LOCAL_HOSTS.has(window.location.hostname)) {
      url.hostname = window.location.hostname;
    }
    return normalizeBaseUrl(url.origin);
  } catch {
    return normalizeBaseUrl(configuredUrl);
  }
}

export const API_BASE_URL = resolveApiBaseUrl();

const TOKEN_KEY = "classEnroll.accessToken";
const USER_KEY = "classEnroll.user";

export const storage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearUser() {
    localStorage.removeItem(USER_KEY);
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function clearSession() {
  storage.clearToken();
  storage.clearUser();
}

export function persistSession(token, user) {
  storage.setToken(token);
  storage.setUser(user);
}

export function getErrorMessage(error) {
  const detail = error?.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => item?.msg || item?.message)
      .filter(Boolean)
      .join(", ");
  }

  if (typeof detail === "string") return detail;
  if (error?.message === "Network Error") {
    return `Không kết nối được backend. Hãy kiểm tra API đang chạy ở ${API_BASE_URL}.`;
  }
  return "Có lỗi xảy ra. Vui lòng thử lại.";
}

export const authApi = {
  async login(payload) {
    const { data } = await api.post("/api/auth/login", payload);
    return data;
  },
  async register(payload) {
    const { data } = await api.post("/api/auth/register", payload);
    return data;
  },
  async me() {
    const { data } = await api.get("/api/auth/me");
    return data;
  }
};

export const classesApi = {
  async list(params = {}) {
    const { data } = await api.get("/api/classes", { params });
    return data;
  },
  async get(id) {
    const { data } = await api.get(`/api/classes/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await api.post("/api/classes", payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/api/classes/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/api/classes/${id}`);
    return data;
  }
};

export const enrollmentsApi = {
  async create(payload) {
    const { data } = await api.post("/api/enrollments", payload);
    return data;
  },
  async mine() {
    const { data } = await api.get("/api/enrollments/me");
    return data;
  },
  async list(params = {}) {
    const { data } = await api.get("/api/enrollments", { params });
    return data;
  },
  async approve(id) {
    const { data } = await api.patch(`/api/enrollments/${id}/approve`);
    return data;
  },
  async reject(id) {
    const { data } = await api.patch(`/api/enrollments/${id}/reject`);
    return data;
  }
};

export const usersApi = {
  async students() {
    const { data } = await api.get("/api/users/students");
    return data;
  }
};

export default api;

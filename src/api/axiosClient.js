import axios from "axios";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function normalizeUrlOrigin(value) {
  const url = new URL(value);
  url.hostname = url.hostname.replace(/\.+$/, "");
  return normalizeBaseUrl(url.origin);
}

function getRuntimeApiBaseUrl() {
  if (typeof window === "undefined") return "http://localhost:8000";
  return `${window.location.protocol}//${window.location.hostname}:8000`;
}

function resolveApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (!configuredUrl) return getRuntimeApiBaseUrl();
  if (typeof window === "undefined") return normalizeBaseUrl(configuredUrl);

  try {
    const url = new URL(configuredUrl);
    url.hostname = url.hostname.replace(/\.+$/, "");
    if (LOCAL_HOSTS.has(url.hostname) && !LOCAL_HOSTS.has(window.location.hostname)) {
      url.hostname = window.location.hostname;
    }
    return normalizeUrlOrigin(url.origin);
  } catch {
    return normalizeBaseUrl(configuredUrl);
  }
}

export const API_BASE_URL = resolveApiBaseUrl();

const TOKEN_KEY = "edumatch.accessToken";
const USER_KEY = "edumatch.user";

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
  if (token) config.headers.Authorization = `Bearer ${token}`;
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

export const coursesApi = {
  async extract(file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/api/courses/extract-preview", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },
  async list(params = {}) {
    const { data } = await api.get("/api/courses", { params });
    return data;
  },
  async get(id) {
    const { data } = await api.get(`/api/courses/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await api.post("/api/courses", payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/api/courses/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/api/courses/${id}`);
    return data;
  }
};

export const courseResourcesApi = {
  async list(courseId) {
    const { data } = await api.get(`/api/courses/${courseId}/resources`);
    return data;
  },
  async get(resourceId) {
    const { data } = await api.get(`/api/resources/${resourceId}`);
    return data;
  },
  async upload(courseId, file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post(`/api/courses/${courseId}/resources`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },
  async process(resourceId) {
    const { data } = await api.post(`/api/resources/${resourceId}/process`);
    return data;
  },
  async remove(resourceId) {
    const { data } = await api.delete(`/api/resources/${resourceId}`);
    return data;
  }
};

export const studentProfilesApi = {
  async analyze(payload) {
    const { data } = await api.post("/api/student-profiles/analyze-intent", payload);
    return data;
  },
  async extract(file) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/api/student-profiles/extract-preview", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  },
  async me() {
    const { data } = await api.get("/api/student-profiles/me");
    return data;
  },
  async create(payload) {
    const { data } = await api.post("/api/student-profiles", payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/api/student-profiles/${id}`, payload);
    return data;
  }
};

export const recommendationsApi = {
  async mine() {
    const { data } = await api.get("/api/recommendations/me");
    return data;
  },
  async generate(payload = {}) {
    const { data } = await api.post("/api/recommendations/generate", payload);
    return data;
  },
  async trackEvent(payload) {
    const { data } = await api.post("/api/recommendations/events", payload);
    return data;
  }
};

export const adminApi = {
  async users() {
    const { data } = await api.get("/api/users");
    return data;
  },
  async processingLogs() {
    const { data } = await api.get("/api/processing-logs");
    return data;
  }
};

export default api;

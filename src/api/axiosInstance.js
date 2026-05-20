import axios from "axios";

// HTTPS ishlamasa HTTP ga fallback
const BASE_URL = 'http://45.138.159.253:9099';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request interceptor — token qo'shish
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — xatolarni tutish
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Server bilan aloqa yo'q (CORS, sertifikat, network)
      console.error('Server bilan aloqa yo\'q:', error.message);
      return Promise.reject(new Error('Server bilan aloqa yo\'q. Internet yoki server manzilini tekshiring.'));
    }

    const { status, data } = error.response;

    if (status === 401) {
      // Token eskirgan — chiqarish
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
      return Promise.reject(new Error('Sessiya tugadi. Qayta kiring.'));
    }

    if (status === 403) {
      return Promise.reject(new Error('Ruxsat yo\'q.'));
    }

    if (status === 404) {
      return Promise.reject(new Error('So\'ralgan ma\'lumot topilmadi.'));
    }

    if (status === 500) {
      return Promise.reject(new Error('Server ichki xatosi. Keyinroq urinib ko\'ring.'));
    }

    // Backend yuborgan xabarni olish
    const message =
      data?.message ||
      data?.error ||
      data?.detail ||
      `Xato: ${status}`;

    return Promise.reject(new Error(message));
  }
);

export default api;
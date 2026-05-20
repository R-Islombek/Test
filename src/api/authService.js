import api from './axiosInstance';

const authService = {
  login: async (credentials) => {
    if (!credentials?.email || !credentials?.password) {
      throw new Error('Email va parol majburiy');
    }

    const response = await api.post('/api/auth/login', {
      username: credentials.email.trim(),
      email: credentials.email.trim(),
      password: credentials.password
    });

    if (!response?.data) {
      throw new Error('Serverdan javob kelmadi');
    }

    const token =
      response.data?.token ||
      response.data?.jwt ||
      response.data?.accessToken ||
      response.data?.access_token;

    if (token) {
      localStorage.setItem('token', token);
    } else {
      console.warn('Token topilmadi. Server javobi:', response.data);
    }

    // Foydalanuvchi ma'lumotlarini saqlash
    const user = response.data?.user || response.data?.admin || response.data;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }

    return response.data;
  },

  register: async (userData) => {
    if (!userData?.email || !userData?.password || !userData?.fullName) {
      throw new Error("Barcha maydonlar to'ldirilishi shart");
    }

    const response = await api.post('/api/auth/register', {
      username: userData.email.trim().split('@')[0],
      email: userData.email.trim(),
      password: userData.password,
      fullName: userData.fullName.trim()
    });

    if (!response?.data) {
      throw new Error('Serverdan javob kelmadi');
    }

    return response.data;
  },

  getToken: () => localStorage.getItem('token'),

  getUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export default authService;
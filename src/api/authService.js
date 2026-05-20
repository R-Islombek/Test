import api from './axiosInstance';

const authService = {
  login: async (credentials) => {
    // Himoya: email mavjudligini tekshirish
    if (!credentials?.email || !credentials?.password) {
      throw new Error('Email va parol majburiy');
    }

    const response = await api.post('/api/auth/login', {
      username: credentials.email.trim(),
      email: credentials.email.trim(),
      password: credentials.password
    });

    // response.data mavjudligini tekshirish
    if (!response?.data) {
      throw new Error('Serverdan javob kelmadi');
    }

    const token =
      response.data?.token ||
      response.data?.jwt ||
      response.data?.accessToken;

    if (token) {
      localStorage.setItem('token', token);
    } else {
      console.warn('Token topilmadi:', response.data);
    }

    return response.data;
  },

  register: async (userData) => {
    // Himoya: barcha maydonlarni tekshirish
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

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export default authService;
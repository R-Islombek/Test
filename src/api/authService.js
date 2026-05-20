import api from './axiosInstance';

const authService = {
  login: async (credentials) => {
    // Muammoni yechish: Ham 'email', ham 'username' kalitlarini yuboramiz!
    // Shunda backend qaysi birini kutayotgan bo'lishidan qat'iy nazar 500 xatosi bermaydi.
    const response = await api.post('/api/auth/login', {
      username: credentials.email.trim(), // Agarda backend 'username' deb kutayotgan bo'lsa
      email: credentials.email.trim(),    // Agarda backend 'email' deb kutayotgan bo'lsa
      password: credentials.password
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // AuthResponse ichidan tokenni tekshirish
    const token = response.data?.token || response.data?.jwt || response.data?.accessToken;
    if (token) {
      localStorage.setItem('token', token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/api/auth/register', {
      username: userData.email.trim().split('@')[0], // Agar registerga username majburiy bo'lsa
      email: userData.email.trim(),
      password: userData.password,
      fullName: userData.fullName.trim()
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  },

  getToken: () => localStorage.getItem('token'),

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
};

export default authService;
import api from './axiosInstance';

const adminService = {
  // Barcha foydalanuvchilar ro'yxatini olish
  getAllUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  // Foydalanuvchini bloklash
  blockUser: async (userId) => {
    if (!userId) throw new Error('User ID majburiy');
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  },

  // Foydalanuvchi ma'lumotlarini tahrirlash
  updateUser: async (userId, updateData) => {
    if (!userId) throw new Error('User ID majburiy');
    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error("O'zgartirish ma'lumotlari bo'sh");
    }
    const response = await api.patch(`/api/admin/users/${userId}`, updateData);
    return response.data;
  }
};

export default adminService;
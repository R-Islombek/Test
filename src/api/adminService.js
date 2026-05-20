import api from './axiosInstance';

const adminService = {
  // Barcha foydalanuvchilar ro'yxatini olish
  getAllUsers: async () => {
    const response = await api.get("/api/admin/users");
    return response.data;
  },

  // Foydalanuvchini bloklash (Delete)
  blockUser: async (userId) => {
    const response = await api.delete(`/api/admin/users/${userId}`);
    return response.data;
  },

  // Foydalanuvchi ma'lumotlarini tahrirlash (Role, Status va h.k.)
  updateUser: async (userId, updateData) => {
    const response = await api.patch(`/api/admin/users/${userId}`, updateData);
    return response.data;
  }
};

export default adminService;
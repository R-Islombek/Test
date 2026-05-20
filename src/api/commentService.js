import api from "./axiosInstance"; // Agar faylingiz nomi axiosInstance bo'lsa
const commentService = {
  // Post ID bo'yicha barcha kommentariyalarni olish (GET /api/posts/{postId}/comments)
  getCommentsByPostId: async (postId) => {
    const response = await api.get(`/api/posts/${postId}/comments`);
    return response.data;
  },

  // Postga yangi comment yozish (POST /api/posts/{postId}/comments)
  createComment: async (postId, commentData) => {
    const response = await api.post(`/api/posts/${postId}/comments`, commentData);
    return response.data;
  }
};

export default commentService;
import api from './axiosInstance';

const postService = {
  // Barcha postlarni olish (Feed)
  getPosts: async () => {
    const response = await api.get("/api/posts");
    return response.data;
  },

  // Yangi post yaratish
  createPost: async (postData) => {
    const response = await api.post("/api/posts", postData);
    return response.data;
  },

  // Bitta postni ID bo'yicha olish
  getSinglePost: async (id) => {
    const response = await api.get(`/api/posts/${id}`);
    return response.data;
  }
};

export default postService;
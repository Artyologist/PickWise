import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
});

// Attach token to every request if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =========================
   CONTENT
========================= */
const getContent = async (id) => {
  const { data } = await apiClient.get(`/content/${id}`);
  return data;
};

const getContentDetails = async (id) => {
  const { data } = await apiClient.get(`/content/${id}/details`);
  return data;
};

const getSimilar = async (id) => {
  const { data } = await apiClient.get(`/content/${id}/similar`);
  return data;
};

const getUniverse = async (slug) => {
  const { data } = await apiClient.get(`/universe/${slug}`);
  return data;
};

/* =========================
   SEARCH
========================= */
const homeSearch = async (payload) => {
  const { data } = await apiClient.post("/search/home", payload);
  return data;
};

const search = async (payload) => {
  const { data } = await apiClient.post("/search", payload);
  return data;
};

const globalSearch = async (query) => {
  const { data } = await apiClient.get("/global-search", {
    params: { q: query },
  });
  return data;
};

/* =========================
   AUTH & USER
========================= */
const login = async (payload) => {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
};

const register = async (payload) => {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
};

const getMyProfile = async () => {
  const { data } = await apiClient.get("/users/me");
  return data;
};

const updateProfile = async (payload) => {
  const { data } = await apiClient.put("/users/me", payload);
  return data;
};

const getMyReviews = async () => {
  const { data } = await apiClient.get("/users/me/reviews");
  return data;
};

const getMyStats = async () => {
  const { data } = await apiClient.get("/users/me/stats");
  return data;
};

/* =========================
   UPCOMING
========================= */
const getUpcoming = async () => {
  const { data } = await apiClient.get("/upcoming");
  return data;
};

const getUpcomingProject = async (slug) => {
  const { data } = await apiClient.get(`/upcoming/${slug}`);
  return data;
};

/* =========================
   REVIEWS
========================= */
const getReviews = async (contentId) => {
  const { data } = await apiClient.get(`/reviews/${contentId}`);
  return data;
};

const postReview = async (contentId, payload) => {
  const { data } = await apiClient.post(`/reviews/${contentId}`, payload);
  return data;
};

/* =========================
   WATCHLIST
========================= */
const getWatchlist = async () => {
  const { data } = await apiClient.get('/watchlist');
  return data;
};

const updateWatchlist = async (contentId, payload) => {
  // payload: { status, rating, progress }
  const { data } = await apiClient.post(`/watchlist/${contentId}`, payload);
  return data;
};

const importContent = async (payload) => {
  const { data } = await apiClient.post(`/content/import`, payload);
  return data;
};

const removeFromWatchlist = async (contentId) => {
  const { data } = await apiClient.delete(`/watchlist/${contentId}`);
  return data;
};

/* =========================
   ADMIN
   ========================= */
const getAdminStats = async () => {
    const { data } = await apiClient.get('/admin/stats');
    return data;
};

const getAdminContent = async (page = 1) => {
    const { data } = await apiClient.get(`/admin/content?page=${page}`);
    return data;
};

const deleteAdminContent = async (id) => {
    const { data } = await apiClient.delete(`/admin/content/${id}`);
    return data;
};

export default {
  getContent,
  getContentDetails,
  getSimilar,
  getUniverse,
  homeSearch,
  search,
  globalSearch,
  login,
  register,
  getMyProfile,
  updateProfile,
  getMyReviews,
  getMyStats,
  getUpcoming,
  getUpcomingProject,
  getReviews,
  postReview,
  getWatchlist,
  updateWatchlist,
  removeFromWatchlist,
  importContent,
  getAdminStats,
  getAdminContent,
  deleteAdminContent
};

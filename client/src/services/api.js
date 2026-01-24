import axios from "axios";
const apiClient = axios.create({
  baseURL: "http://localhost:4000/api",
});

// ✅ Attach token to every request if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getContent = async (id) => {
  const { data } = await apiClient.get(`/content/${id}`);
  return data;
};

const getSimilar = async (id) => {
  const { data } = await apiClient.get(`/content/${id}/similar`);
  return data;
};

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

// 🏛️ REVIEWS
const getReviews = async (contentId) => {
  const { data } = await apiClient.get(`/reviews/${contentId}`);
  return data;
};

const postReview = async (contentId, payload) => {
  const { data } = await apiClient.post(`/reviews/${contentId}`, payload);
  return data;
};


export default {
  getContent,
  getSimilar,
  homeSearch,
  search,
  globalSearch,
  getReviews,
  postReview,
};


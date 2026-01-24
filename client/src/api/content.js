import axios from './axios'; // your existing axios instance

export const getContentDetail = (id) =>
  axios.get(`/content/${id}`);

export const getSimilarContent = (id) =>
  axios.get(`/content/${id}/similar`);

export const postReview = (contentId, data) =>
  axios.post(`/reviews/${contentId}`, data);

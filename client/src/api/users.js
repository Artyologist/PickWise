import axios from './axios';

// Authenticated user
export const getMyProfile = () =>
  axios.get('/users/me');

export const getMyReviews = () =>
  axios.get('/users/me/reviews');

export const getMyStats = () =>
  axios.get('/users/me/stats');

// Public profile
export const getPublicProfile = (userId) =>
  axios.get(`/users/${userId}/public`);

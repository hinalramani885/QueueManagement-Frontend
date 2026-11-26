// src/services/contentService.js – admin-editable information pages
import axiosInstance from '../utils/axiosInstance';

export const contentService = {
  get: (slug) => axiosInstance.get(`/content/${slug}`),
  save: (slug, page) => axiosInstance.put(`/content/${slug}`, page),
  remove: (slug) => axiosInstance.delete(`/content/${slug}`),
};

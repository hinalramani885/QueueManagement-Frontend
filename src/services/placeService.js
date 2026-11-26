// src/services/placeService.js
import axiosInstance from '../utils/axiosInstance';

export const placeService = {
  getAll: () => axiosInstance.get('/places'),
  getById: (id) => axiosInstance.get(`/places/${id}`),
  create: (placeData) => axiosInstance.post('/places', placeData),
  update: (id, placeData) => axiosInstance.put(`/places/${id}`, placeData),
  delete: (id) => axiosInstance.delete(`/places/${id}`),
  getByAdmin: (adminId) => axiosInstance.get(`/places/admin/${adminId}`),
  // Places of the logged-in admin, including places created by their providers (with creator details)
  getMyAdminPlaces: () => axiosInstance.get('/places/admin/my-places'),
  // Places the logged-in provider created or is assigned to
  getProviderPlaces: () => axiosInstance.get('/places/provider/my-places'),
  getNearby: (longitude, latitude, radius) =>
    axiosInstance.get(`/places/nearby?longitude=${longitude}&latitude=${latitude}&radius=${radius}`),
  getByType: (type) => axiosInstance.get(`/places/type/${type}`),


  getAllPaginated: (page = 0, size = 20, sort = 'name,asc') =>
    axiosInstance.get(`/places/paginated?page=${page}&size=${size}&sort=${sort}`),
};
import api from './axiosInstance'

export const getDashboardStats = () => api.get('/dashboard/stats')
export const getAdminStats     = () => api.get('/admin/stats')
export const getAllUsers        = () => api.get('/admin/users')

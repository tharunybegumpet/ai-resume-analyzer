import api from './axiosInstance'

export const analyzeResume   = (data)   => api.post('/analysis/analyze', data)
export const getAnalysisById = (id)     => api.get(`/analysis/${id}`)
export const getMyHistory    = (sortBy) => api.get('/analysis/history', { params: { sortBy } })
export const searchHistory   = (q)      => api.get('/analysis/history/search', { params: { q } })
export const deleteHistory   = (id)     => api.delete(`/analysis/history/${id}`)

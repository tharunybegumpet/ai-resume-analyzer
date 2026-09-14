import api from './axiosInstance'

export const saveJobDescription   = (data)      => api.post('/job-descriptions', data)
export const getMyJobDescriptions = ()           => api.get('/job-descriptions')
export const getJobDescById       = (id)         => api.get(`/job-descriptions/${id}`)
export const updateJobDesc        = (id, data)   => api.put(`/job-descriptions/${id}`, data)
export const deleteJobDesc        = (id)         => api.delete(`/job-descriptions/${id}`)

import api from './axiosInstance'

/**
 * Upload a PDF or DOCX resume.
 * @param {FormData} formData - must contain a "file" field
 * @param {Function} onUploadProgress - axios progress callback
 */
export const uploadResume = (formData, onUploadProgress) =>
  api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })

export const getMyResumes  = ()    => api.get('/resumes')
export const getResumeById = (id)  => api.get(`/resumes/${id}`)
export const deleteResume  = (id)  => api.delete(`/resumes/${id}`)

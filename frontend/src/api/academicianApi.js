import api from './axios'

export const getAcademicianProfile = () => api.get('/academicians/profile')
export const updateAcademicianProfile = (payload) => api.put('/academicians/profile', payload)
export const getAcademicianDashboard = () => api.get('/academicians/dashboard')
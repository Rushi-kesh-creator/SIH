import api from './axios'

export const getAcademicianProfile = () => api.get('/academicians/profile')
export const updateAcademicianProfile = (payload) => api.put('/academicians/profile', payload)
export const getAcademicianDashboard = () => api.get('/academicians/dashboard')

export const getAcademicPrograms = () =>
  api.get('/academicians/programs')

export const createAcademicProgram = (payload) =>
  api.post('/academicians/programs', payload)

export const updateAcademicProgram = (id, payload) =>
  api.put(`/academicians/programs/${id}`, payload)

export const deleteAcademicProgram = (id) =>
  api.delete(`/academicians/programs/${id}`)
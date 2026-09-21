import api from './axios'

export const analyzeResume = (resumeText, opportunityText) =>
	api.post('/ml/analyze', {
		resume_text: resumeText,
		opportunity_text: opportunityText,
	})

export const uploadStudentResume = (file) => {
	const formData = new FormData()
	formData.append('resume', file)
	return api.post('/students/profile/resume', formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	})
}

export const getStudentResumeUrl = () => api.get('/students/profile/resume-url')

export const getInternships = (params) => api.get('/internships', { params })
export const getInternship = (id) => api.get(`/internships/${id}`)
export const getJobs = (params) => api.get('/jobs', { params })
export const getJob = (id) => api.get(`/jobs/${id}`)
export const createApplication = (payload) => api.post('/applications', payload)
export const getApplications = () => api.get('/applications')
export const getApplication = (id) => api.get(`/applications/${id}`)
export const getRecommendedOpportunities = () => api.get('/students/recommended-opportunities')

export const getStudentDashboard = () => api.get('/students/dashboard')
export const getStudentProfile = () => api.get('/students/profile')
export const updateStudentProfile = (payload) => api.put('/students/profile', payload)

export const getStudentSkills = () =>
	api.get('/students/skills')

export const getResumeSkills = () =>
  api.get('/students/skills/resume')

export const addStudentSkill = (skillId) =>
	api.post('/students/skills', {
		skill_id: skillId,
	})

export const removeStudentSkill = (skillId) =>
	api.delete(`/students/skills/${skillId}`)

export const getAvailableSkills = () =>
	api.get('/students/skills/available')

export const getStudentCertifications = () =>
        api.get('/students/certifications')

export const addStudentCertification = (payload) =>
        api.post('/students/certifications', payload)

export const getStudentProjects = () =>
        api.get('/students/projects')

export const addStudentProject = (payload) =>
        api.post('/students/projects', payload)

export const getStudentNotifications = () =>
  api.get('/students/notifications')

export const markStudentNotificationRead = (notificationId) =>
  api.put(`/students/notifications/${notificationId}/read`)
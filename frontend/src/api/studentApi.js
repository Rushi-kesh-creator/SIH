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

// NOTE: Internships, jobs, skills, applications, certifications, and
// portfolio endpoints are not yet implemented on the backend. Add
// functions here as soon as those routes exist — do not stub them
// with fake network calls. Pages that need this data currently render
// a clearly-labeled "not connected yet" empty state (see EmptyState).

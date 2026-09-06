import api from './axios'

// Match the existing backend request contracts while preserving the public API.
export const registerUser = ({ full_name, email, password, role }) =>
	api.post('/auth/register', null, {
		params: { name: full_name, email, password, role },
	})

export const loginUser = ({ email, password }) => {
	const form = new URLSearchParams({ username: email, password })
	return api.post('/auth/login', form, {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	})
}

// Sanity-check endpoint that exists on the backend already.
export const getProtected = () => api.get('/protected')

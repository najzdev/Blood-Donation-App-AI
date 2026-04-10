import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({ baseURL: API_URL })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login:         (d)  => api.post('/auth/login', d),
  register:      (d)  => api.post('/auth/register', d),
  me:            ()   => api.get('/auth/me'),
  updateProfile: (d)  => api.put('/auth/profile', d),
}

export const donorsAPI = {
  getAll:    (params) => api.get('/donors', { params }),
  getById:   (id)     => api.get(`/donors/${id}`),
  create:    (d)      => api.post('/donors', d),
  update:    (id, d)  => api.put(`/donors/${id}`, d),
  delete:    (id)     => api.delete(`/donors/${id}`),
  donate:    (id)     => api.post(`/donors/${id}/donate`),
  getEligible: (bg)   => api.get(`/donors/eligible/${bg}`),
}

export const patientsAPI = {
  getAll:      (params) => api.get('/patients', { params }),
  getById:     (id)     => api.get(`/patients/${id}`),
  create:      (d)      => api.post('/patients', d),
  update:      (id, d)  => api.put(`/patients/${id}`, d),
  delete:      (id)     => api.delete(`/patients/${id}`),
  getCritical: ()       => api.get('/patients/filter/critical'),
}

export const requestsAPI = {
  getAll:       (params) => api.get('/requests', { params }),
  create:       (d)      => api.post('/requests', d),
  updateStatus: (id, d)  => api.put(`/requests/${id}/status`, d),
  delete:       (id)     => api.delete(`/requests/${id}`),
}

export const inventoryAPI = {
  getAll:     () => api.get('/inventory'),
  update:     (bg, d) => api.put(`/inventory/${bg}`, d),
  getSummary: () => api.get('/inventory/stats/summary'),
}

export const aiAPI = {
  analyzePatients: ()           => api.post('/ai/analyze-patients'),
  matchDonor:      (patientId)  => api.post(`/ai/match-donor/${patientId}`),
  chat:            (message, context) => api.post('/ai/chat', { message, context }),
  insights:        ()           => api.get('/ai/insights'),
}

export default api

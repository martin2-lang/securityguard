import axios from 'axios'

const API_BASE = '/api/vulnerabilities'
const TOKEN_KEY = 'sg_token'

const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' }
})

// Adjunta el JWT en cada petición
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Si el token expiró o es inválido, se cierra la sesión
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const isLogin = error.config?.url?.includes('/api/auth/login')
    if (error.response?.status === 401 && !isLogin) {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem('sg_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const login = (username, password) => api.post('/api/auth/login', { username, password })

export const getAllVulnerabilities = () => api.get(API_BASE)
export const createVulnerability = (data) => api.post(API_BASE, data)
export const updateVulnerability = (id, data) => api.put(`${API_BASE}/${id}`, data)
export const deleteVulnerability = (id) => api.delete(`${API_BASE}/${id}`)

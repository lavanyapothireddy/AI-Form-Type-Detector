import axios from 'axios'

// Uses REACT_APP_API_URL env variable in production (set on Render)
// Falls back to localhost for local development
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
})

// Add response interceptor for global error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.message ||
      'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default API

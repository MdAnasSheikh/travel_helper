import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

// In-memory CSRF token store
let csrfToken = null

// Fetch a fresh CSRF token from the server and cache it
async function fetchCsrfToken() {
  const res = await axios.get('/api/csrf-token', { withCredentials: true })
  csrfToken = res.data.csrfToken
  return csrfToken
}

// Attach x-csrf-token header to all state-changing requests
api.interceptors.request.use(async config => {
  const method = (config.method || 'get').toLowerCase()
  if (!['get', 'head', 'options'].includes(method)) {
    if (!csrfToken) {
      await fetchCsrfToken()
    }
    config.headers['x-csrf-token'] = csrfToken
  }
  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    // If the server rejects the CSRF token specifically, refresh it and retry once.
    // Only retry for CSRF-specific 403s (response body contains "csrf") to avoid
    // refreshing the token on unrelated authorization failures.
    const isCsrf403 =
      err.response?.status === 403 &&
      typeof err.response?.data?.error === 'string' &&
      err.response.data.error.toLowerCase().includes('csrf')
    if (isCsrf403 && !err.config?._csrfRetried) {
      err.config._csrfRetried = true
      await fetchCsrfToken()
      err.config.headers['x-csrf-token'] = csrfToken
      return api.request(err.config)
    }

    let message
    if (!err.response) {
      message = 'Backend server is not reachable. Start the server with: cd server && npm run dev'
    } else {
      message = err.response?.data?.error || err.response?.data?.message || err.message || 'Something went wrong'
    }
    const error = new Error(message)
    error.status = err.response?.status || null
    return Promise.reject(error)
  }
)

export default api

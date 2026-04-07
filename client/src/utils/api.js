import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.response.use(
  res => res,
  err => {
    let message
    if (!err.response) {
      message = 'Backend server is not reachable. Start the server with: cd server && npm run dev'
    } else {
      message = err.response?.data?.error || err.response?.data?.message || err.message || 'Something went wrong'
    }
    return Promise.reject(new Error(message))
  }
)

export default api

import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('❌ Error interceptado:')
    console.log('Status:', error.response?.status)
    console.log('Data:', error.response?.data)
    return Promise.reject(error)
  }
)

export const appointmentService = {
  getAll(params = {}) {
    return api.get('/appointments', { params })
  },
  getById(id) {
    return api.get(`/appointments/${id}`)
  },
  create(data) {
    return api.post('/appointments', data)
  },
  update(id, data) {
    return api.put(`/appointments/${id}`, data)
  },
  remove(id) {
    return api.delete(`/appointments/${id}`)
  },
  checkConflicts(params) {
    return api.get('/appointments/conflicts/check', { params })
  },
}
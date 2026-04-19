import { ref, computed } from 'vue'
import { appointmentService } from '../services/appointmentService'

const appointments  = ref([])
const pagination    = ref({})
const loading       = ref(false)
const error         = ref(null)

// Filtros activos
const filters = ref({
  search:   '',
  dateFrom: '',
  dateTo:   '',
  status:   '',
  page:     1,
  limit:    10,
})

export function useAppointments() {

  async function fetchAppointments() {
    loading.value = true
    error.value   = null
    try {
      // Limpia los filtros vacíos antes de enviar
      const params = Object.fromEntries(
        Object.entries(filters.value).filter(([, v]) => v !== '')
      )
      const { data } = await appointmentService.getAll(params)
      appointments.value = data.data
      pagination.value   = data.pagination
    } catch (err) {
      error.value = err.response?.data?.message || 'Error cargando citas'
    } finally {
      loading.value = false
    }
  }

  async function deleteAppointment(id) {
    await appointmentService.remove(id)
    await fetchAppointments() // recarga la lista
  }

  function setFilter(key, value) {
    filters.value[key] = value
    filters.value.page = 1 // vuelve a página 1 al filtrar
    fetchAppointments()
  }

  function setPage(page) {
    filters.value.page = page
    fetchAppointments()
  }

  return {
    appointments,
    pagination,
    loading,
    error,
    filters,
    fetchAppointments,
    deleteAppointment,
    setFilter,
    setPage,
  }
}
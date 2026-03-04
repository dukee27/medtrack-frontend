import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — token expired or invalid
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login')
      }
    }
    return Promise.reject(err)
  }
)

// ─── Auth ────────────────────────────────────────────
export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/users/register', data)

// ─── User ────────────────────────────────────────────
export const getProfile = () => api.get('/users')
export const updateProfile = (data) => api.patch('/users', data)
export const changePassword = (data) => api.post('/users/change-password', data)

// ─── Medications ─────────────────────────────────────
export const getMedications = (patientId) =>
  api.get(`/medication${patientId ? `?patientId=${patientId}` : ''}`)

export const getMedication = (id, patientId) =>
  api.get(`/medication/${id}${patientId ? `?patientId=${patientId}` : ''}`)

export const createMedication = (data, patientId) =>
  api.post(`/medication${patientId ? `?patientId=${patientId}` : ''}`, {
    ...data,
    quantity: Number(data.quantity),
  })

export const updateMedication = (id, data, patientId) =>
  api.patch(`/medication/${id}${patientId ? `?patientId=${patientId}` : ''}`, {
    ...data,
    quantity: data.quantity !== undefined ? Number(data.quantity) : undefined,
  })

export const getLowStock = (patientId) =>
  api.get(`/medication/reports/low-stock${patientId ? `?patientId=${patientId}` : ''}`)

export const getExpiring = (patientId) =>
  api.get(`/medication/reports/expiring${patientId ? `?patientId=${patientId}` : ''}`)

export const searchMedications = (filter, patientId) =>
  api.post(`/medication/search${patientId ? `?patientId=${patientId}` : ''}`, filter)

// ─── Soft Delete & Archive ───────────────────────────
export const archiveMedication = (id, reason = '', patientId = '') =>
  api.delete(`/medication/${id}?reason=${encodeURIComponent(reason)}${patientId ? `&patientId=${patientId}` : ''}`)

export const getArchivedMedications = (patientId = '') =>
  api.get(`/medication/archived${patientId ? `?patientId=${patientId}` : ''}`)

export const restoreMedication = (id, patientId = '') =>
  api.put(`/medication/${id}/restore${patientId ? `?patientId=${patientId}` : ''}`)

// ─── Smart Suggestions ───────────────────────────────
export const getMedicationSuggestions = (query, patientId = '') =>
  api.get(`/medication/suggestions?query=${encodeURIComponent(query)}${patientId ? `&patientId=${patientId}` : ''}`)

// ─── Schedules ───────────────────────────────────────
export const getSchedules = () => api.get('/schedule')
export const getSchedule = (id) => api.get(`/schedule/${id}`)
export const createSchedule = (data) => api.post('/schedule', data)
export const updateSchedule = (id, data) => api.patch(`/schedule/${id}`, data)

// ─── Schedules — Delete ───────────────────────────────
export const deleteSchedule = (id, reason = '') =>
  api.delete(`/schedule/${id}?reason=${encodeURIComponent(reason)}`)

// ─── Intake Times ─────────────────────────────────────
export const createIntakeTime = (data) => api.post('/intake-time', data)
export const updateIntakeTime = (id, data) => api.patch(`/intake-time/${id}`, data)
export const deleteIntakeTime = (id, reason = '') =>
  api.delete(`/intake-time/${id}?reason=${encodeURIComponent(reason)}`)

// ─── Dose Logging (Take Dose) ─────────────────────────
// POST /api/v1/medication/{id}/log — log a dose taken now, reduces quantity
export const logDoseTaken = (medicationId, patientId) =>
  api.post(`/medication/${medicationId}/log${patientId ? `?patientId=${patientId}` : ''}`, {
    status: 'TAKEN',
    takenAt: new Date().toISOString(),
  })

// GET /api/v1/medication/{id}/logs — get dose history for a medication
export const getDoseLogs = (medicationId, patientId) =>
  api.get(`/medication/${medicationId}/logs${patientId ? `?patientId=${patientId}` : ''}`)

// ─── Access Control ──────────────────────────────────
export const requestAccess = (data) => api.post('/access/request', data)
export const getPendingRequests = () => api.get('/access/requests')
export const getAccessiblePatients = () => api.get('/access/accessible-patients')
export const getActiveCaregivers = () => api.get('/access/caregivers')

// FIX: Was /review but backend uses /approve
export const approveAccessRequest = (id, data) => api.put(`/access/${id}/approve`, data)
export const rejectAccessRequest = (id) => api.put(`/access/${id}/reject`)

// Keep old name for compatibility
export const reviewAccessRequest = (id, data) => approveAccessRequest(id, data)

export const updateCaregiverPermissions = (accessId, permissionsSet) =>
  api.put(`/access/${accessId}/permissions`, { permissions: permissionsSet })

export const revokeAccess = (accessId, reason = 'Patient manually revoked access') =>
  api.delete(`/access/${accessId}?reason=${encodeURIComponent(reason)}`)

// ─── Activity Logs ────────────────────────────────────
export const getMyActivityLogs = () => api.get('/activity-logs')
export const getActivityByActor = (actorId) => api.get(`/activity-logs/by-actor/${actorId}`)
export const getPatientActivityLogs = (patientId) => api.get(`/activity-logs?patientId=${patientId}`)

// ─── Dashboard ───────────────────────────────────────
export const getDashboardData = (patientId = '') =>
  api.get(`/home/dashboard${patientId ? `?patientId=${patientId}` : ''}`)

// ─── Notifications ───────────────────────────────────
export const getNotifications = () => api.get('/notifications')
export const markNotificationAsRead = (id) => api.put(`/notifications/${id}/read`)
export const markAllNotificationsAsRead = () => api.put('/notifications/read-all')
export const getUnreadNotificationCount = () => api.get('/notifications/unread-count')

// ─── Organizations / Buckets ─────────────────────────
export const getMyOrganizations = () => api.get('/organizations')
export const createOrganization = (data) => api.post('/organizations', data)
export const getOrganizationMembers = (orgId) => api.get(`/organizations/${orgId}/members`)
export const addOrganizationMember = (orgId, data) => api.post(`/organizations/${orgId}/members`, data)
export const removeOrganizationMember = (orgId, memberId, reason = '') =>
  api.delete(`/organizations/${orgId}/members/${memberId}?reason=${encodeURIComponent(reason)}`)

export default api
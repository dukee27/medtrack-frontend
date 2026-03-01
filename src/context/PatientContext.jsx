import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getAccessiblePatients } from '../services/api'

const PatientContext = createContext(null)

export function PatientProvider({ children }) {
  // null = viewing own account; object = viewing a patient
  const [activePatient, setActivePatient] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('medtrack-active-patient')) } catch { return null }
  })
  const [accessiblePatients, setAccessiblePatients] = useState([])
  const [loadingPatients, setLoadingPatients] = useState(false)

  const fetchAccessiblePatients = useCallback(async () => {
    setLoadingPatients(true)
    try {
      const res = await getAccessiblePatients()
      setAccessiblePatients(res.data.data || [])
    } catch {
      setAccessiblePatients([])
    } finally {
      setLoadingPatients(false)
    }
  }, [])

  useEffect(() => {
    fetchAccessiblePatients()
  }, [fetchAccessiblePatients])

  const switchToPatient = (patientAccess) => {
    setActivePatient(patientAccess)
    sessionStorage.setItem('medtrack-active-patient', JSON.stringify(patientAccess))
  }

  const switchToSelf = () => {
    setActivePatient(null)
    sessionStorage.removeItem('medtrack-active-patient')
  }

  // Convenience: the patientId to pass to API calls (null = own account)
  const activePatientId = activePatient?.patientId ?? null

  // Check if caregiver has a specific permission for active patient
  const hasPermission = (permission) => {
    if (!activePatient) return true // own account = full access
    return activePatient.permissions?.includes(permission) ?? false
  }

  return (
    <PatientContext.Provider value={{
      activePatient,
      activePatientId,
      accessiblePatients,
      loadingPatients,
      switchToPatient,
      switchToSelf,
      hasPermission,
      refreshPatients: fetchAccessiblePatients,
    }}>
      {children}
    </PatientContext.Provider>
  )
}

export const usePatient = () => useContext(PatientContext)
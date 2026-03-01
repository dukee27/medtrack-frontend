import { useState, useEffect } from 'react'
import { getMedications, getSchedules, createSchedule, updateSchedule } from '../services/api'
import { Clock, ArrowUp, ArrowDown, UtensilsCrossed, Calendar, AlarmClock } from 'lucide-react'
import Modal from '../components/Modal'
import Button from '../components/Button'
import Input, { Select } from '../components/Input'
import Badge from '../components/Badge'
import toast from 'react-hot-toast'
import { usePatient } from '../context/PatientContext'

const FREQ_TYPES = ['DAILY', 'WEEKLY', 'EVERY_N_DAYS', 'AS_NEEDED']
const TIMING = ['BEFORE_MEAL', 'AFTER_MEAL', 'WITH_MEAL', 'ANYTIME']

const timingLabel = {
  BEFORE_MEAL: 'Before Meal', AFTER_MEAL: 'After Meal',
  WITH_MEAL: 'With Meal', ANYTIME: 'Anytime'
}

// Lucide icon components per timing type
const TimingIcon = ({ timing, size = 14, style }) => {
  const props = { size, style }
  switch (timing) {
    case 'BEFORE_MEAL': return <ArrowUp {...props} />
    case 'AFTER_MEAL':  return <ArrowDown {...props} />
    case 'WITH_MEAL':   return <UtensilsCrossed {...props} />
    case 'ANYTIME':     return <Clock {...props} />
    default:            return <Clock {...props} />
  }
}

const freqLabel = {
  DAILY: 'Daily', WEEKLY: 'Weekly', EVERY_N_DAYS: 'Every N Days', AS_NEEDED: 'As Needed'
}
const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const DAYS_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function ScheduleForm({ meds, initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    medicationId:  initial.medicationId  || '',
    frequencyType: initial.frequencyType || 'DAILY',
    dayOfWeek:     initial.dayOfWeek != null ? String(initial.dayOfWeek) : '',
    intervalDays:  initial.intervalDays  || '',
    timesPerDay:   initial.timesPerDay   || '',
    intakeTiming:  initial.intakeTiming  || 'ANYTIME',
  })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.medicationId) { toast.error('Please select a medication'); return }
    onSubmit({
      medicationId:  Number(form.medicationId),
      frequencyType: form.frequencyType,
      dayOfWeek:     form.dayOfWeek !== '' ? Number(form.dayOfWeek) : undefined,
      intervalDays:  form.intervalDays ? Number(form.intervalDays) : undefined,
      timesPerDay:   form.timesPerDay  ? Number(form.timesPerDay) : undefined,
      intakeTiming:  form.intakeTiming,
    })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Select label="Medication *" value={form.medicationId} onChange={set('medicationId')} required>
        <option value="">— Select a medication —</option>
        {meds.map(m => <option key={m.id} value={m.id}>{m.name} ({m.dosage})</option>)}
      </Select>

      <Select label="Frequency *" value={form.frequencyType} onChange={set('frequencyType')}>
        {FREQ_TYPES.map(f => <option key={f} value={f}>{freqLabel[f]}</option>)}
      </Select>

      {form.frequencyType === 'WEEKLY' && (
        <Select label="Day of Week" value={form.dayOfWeek} onChange={set('dayOfWeek')}>
          <option value="">— Select day —</option>
          {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
        </Select>
      )}

      {form.frequencyType === 'EVERY_N_DAYS' && (
        <Input label="Every how many days?" type="number" min="1" max="365"
          value={form.intervalDays} onChange={set('intervalDays')} placeholder="e.g. 2" />
      )}

      <Input label="Times per day" type="number" min="1" max="12"
        value={form.timesPerDay} onChange={set('timesPerDay')} placeholder="e.g. 2" />

      <Select label="Intake Timing" value={form.intakeTiming} onChange={set('intakeTiming')}>
        {TIMING.map(t => <option key={t} value={t}>{timingLabel[t]}</option>)}
      </Select>

      <Button type="submit" loading={loading} fullWidth size="lg">
        {initial.scheduleId ? 'Update Schedule' : 'Create Schedule'}
      </Button>
    </form>
  )
}

export default function Schedules() {
  const { activePatientId, activePatient, hasPermission } = usePatient();
  const [schedules, setSchedules] = useState([])
  const [meds, setMeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => Promise.all([getSchedules(), getMedications(activePatientId)])
    .then(([s, m]) => {
      setSchedules(s.data.data || [])
      setMeds(m.data.data || [])
    })
    .catch(() => toast.error('Failed to load schedules'))
    .finally(() => setLoading(false))

  useEffect(() => { load() }, [activePatientId])

  const medName = (id) => {
    const m = meds.find(m => m.id === id)
    return m ? `${m.name} (${m.dosage})` : `Medication #${id}`
  }

  const handleCreate = async (data) => {
    setSaving(true)
    try {
      await createSchedule(data)
      toast.success('Schedule created!')
      setShowAdd(false)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create schedule')
    } finally { setSaving(false) }
  }

  const handleUpdate = async (data) => {
    setSaving(true)
    try {
      await updateSchedule(editing.scheduleId, data)
      toast.success('Schedule updated!')
      setEditing(null)
      load()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to update schedule')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ padding: '40px', maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            {activePatient ? `${activePatient.patientFirstName || 'Patient'}'s Schedules` : 'Schedules'}
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 4 }}>
            Manage {activePatient ? 'their' : 'your'} medication timing and frequency
          </p>
        </div>
        {(!activePatient || hasPermission('MEDICATION_EDIT')) && (
          <Button onClick={() => setShowAdd(true)}>+ New Schedule</Button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        </div>
      ) : schedules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 72, color: 'var(--text-3)' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--bg-card)', border: '1.5px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <AlarmClock size={32} style={{ color: 'var(--text-3)', opacity: 0.5 }} />
          </div>
          <p style={{ fontSize: 18, fontFamily: 'var(--font-display)', color: 'var(--text-2)', marginBottom: 8 }}>No schedules yet</p>
          <p style={{ fontSize: 14, marginBottom: 24 }}>Set up a schedule to track when to take your medications</p>
          <Button onClick={() => setShowAdd(true)}>Create First Schedule</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {schedules.map((s, i) => (
            <div key={s.scheduleId} style={{
              background: 'var(--bg-card)', border: '1.5px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 20,
              animation: `fadeInUp 0.3s ease ${i * 0.05}s both`,
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: 'var(--shadow)',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow)' }}
            >
              {/* Icon */}
              <div style={{
                width: 50, height: 50, borderRadius: 12, flexShrink: 0,
                background: 'var(--accent-dim)', border: '1.5px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)',
              }}>
                <Clock size={22} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 6 }}>
                  {medName(s.medicationId)}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <Badge label={s.frequencyType} type={s.frequencyType} />
                  {s.timesPerDay && (
                    <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>
                      {s.timesPerDay}× per day
                    </span>
                  )}
                  {s.dayOfWeek != null && s.frequencyType === 'WEEKLY' && (
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                      · {DAYS_SHORT[s.dayOfWeek]}
                    </span>
                  )}
                  {s.intervalDays && (
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                      · every {s.intervalDays} days
                    </span>
                  )}
                  {s.intakeTiming && s.intakeTiming !== 'ANYTIME' && (
                    <span style={{
                      fontSize: 12, color: 'var(--text-3)',
                      background: 'var(--bg-card-2)', border: '1px solid var(--border)',
                      padding: '2px 8px', borderRadius: 12,
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                    }}>
                      <TimingIcon timing={s.intakeTiming} size={11} />
                      {timingLabel[s.intakeTiming]}
                    </span>
                  )}
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={() => setEditing(s)}>
                Edit
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Schedule">
        <ScheduleForm meds={meds} onSubmit={handleCreate} loading={saving} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Schedule">
        {editing && <ScheduleForm meds={meds} initial={editing} onSubmit={handleUpdate} loading={saving} />}
      </Modal>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
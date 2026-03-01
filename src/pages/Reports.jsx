import { useState, useEffect } from 'react'
import { getLowStock, getExpiring } from '../services/api'
import { AlertTriangle, Calendar, ShieldCheck, FileText, CheckCircle2, Download } from 'lucide-react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import toast from 'react-hot-toast'
import { usePatient } from '../context/PatientContext'

// PDF generation using jsPDF (client-side only, no server needed)
async function downloadPDF(lowStock, expiring) {
  try {
    // Dynamic import to avoid issues during SSR
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // ─── Cover / Header ───
    doc.setFillColor(45, 106, 79)      // accent green
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('MedTrack — Medication Report', 14, 20)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 32)

    doc.setTextColor(0, 0, 0)

    // ─── Summary boxes ───
    let y = 54
    doc.setFontSize(10)
    doc.setFillColor(245, 240, 232)
    doc.rect(14, y, (pageWidth - 28) / 2 - 4, 20, 'F')
    doc.setFont('helvetica', 'bold')
    doc.text(`Low Stock Alerts: ${lowStock.length}`, 18, y + 8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(184, 92, 0)
    doc.text(lowStock.length > 0 ? 'Action required — refill soon' : 'All medications well-stocked', 18, y + 16)

    doc.setTextColor(0, 0, 0)
    doc.setFillColor(245, 240, 232)
    doc.rect(pageWidth / 2 + 2, y, (pageWidth - 28) / 2 - 4, 20, 'F')
    doc.setFont('helvetica', 'bold')
    doc.text(`Expiring Soon: ${expiring.length}`, pageWidth / 2 + 6, y + 8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(192, 57, 43)
    doc.text(expiring.length > 0 ? 'Check expiry dates below' : 'No medications expiring soon', pageWidth / 2 + 6, y + 16)

    doc.setTextColor(0, 0, 0)
    y += 30

    // ─── Low Stock Table ───
    if (lowStock.length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(184, 92, 0)
      doc.text('Low Stock Medications', 14, y)
      doc.setTextColor(0, 0, 0)
      y += 6

      autoTable(doc, {
        startY: y,
        head: [['Medication', 'Brand', 'Type', 'Dosage', 'Qty Left', 'Doctor']],
        body: lowStock.map(m => [
          m.name,
          m.brandName || '—',
          m.type,
          m.dosage,
          `${m.quantityLeft} units`,
          m.doctorName || '—',
        ]),
        headStyles: {
          fillColor: [184, 92, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [255, 248, 240] },
        margin: { left: 14, right: 14 },
      })
      y = doc.lastAutoTable.finalY + 14
    }

    // ─── Expiring Table ───
    if (expiring.length > 0) {
      if (y > 220) { doc.addPage(); y = 20 }
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(192, 57, 43)
      doc.text('Expiring Soon', 14, y)
      doc.setTextColor(0, 0, 0)
      y += 6

      autoTable(doc, {
        startY: y,
        head: [['Medication', 'Brand', 'Type', 'Dosage', 'Expiry Date', 'Days Left']],
        body: expiring.map(m => {
          const daysLeft = m.expiryDate
            ? Math.ceil((new Date(m.expiryDate) - new Date()) / 86400000)
            : null
          return [
            m.name,
            m.brandName || '—',
            m.type,
            m.dosage,
            m.expiryDate || '—',
            daysLeft !== null ? `${daysLeft} days` : 'Expired',
          ]
        }),
        headStyles: {
          fillColor: [192, 57, 43],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [255, 245, 245] },
        margin: { left: 14, right: 14 },
      })
    }

    // ─── Footer ───
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`MedTrack Medication Report · Page ${i} of ${pageCount} · Generated ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.getHeight() - 8)
    }

    doc.save(`medtrack-report-${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('PDF report downloaded!')
  } catch (err) {
    console.error('PDF generation error:', err)
    toast.error('Failed to generate PDF. Please try again.')
  }
}

export default function Reports() {
  const { activePatientId, activePatient } = usePatient();
  const [lowStock, setLowStock] = useState([])
  const [expiring, setExpiring] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([getLowStock(activePatientId), getExpiring(activePatientId)])
      .then(([l, e]) => {
        setLowStock(l.data.data || [])
        setExpiring(e.data.data || [])
      })
      .catch(() => toast.error('Failed to load reports'))
      .finally(() => setLoading(false))
  }, [activePatientId])

  const handleDownloadPDF = async () => {
    setDownloading(true)
    await downloadPDF(lowStock, expiring)
    setDownloading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  const hasAlerts = lowStock.length > 0 || expiring.length > 0

  return (
    <div style={{ padding: '40px', maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text)' }}>
            {activePatient ? `${activePatient.patientFirstName || 'Patient'}'s Health Reports` : 'Health Reports'}
          </h1>
          <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 4 }}>
            Alerts and insights about {activePatient ? 'their' : 'your'} medications
          </p>
        </div>
          <Button
          onClick={handleDownloadPDF}
          loading={downloading}
          variant="secondary"
          style={{ gap: 8, display: 'flex', alignItems: 'center' }}
        >
          <FileText size={16} style={{ flexShrink: 0 }} /> Download PDF Report
        </Button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <SummaryCard
          icon={<AlertTriangle size={24} />}
          title="Low Stock"
          count={lowStock.length}
          color="var(--warning)"
          status={lowStock.length === 0 ? 'All good — no refills needed' : 'Refills needed'}
        />
        <SummaryCard
          icon={<Calendar size={24} />}
          title="Expiring Soon"
          count={expiring.length}
          color="var(--danger)"
          status={expiring.length === 0 ? 'No medications expiring soon' : 'Within 30 days'}
        />
        <SummaryCard
          icon={<ShieldCheck size={24} />}
          title="All Clear"
          count={hasAlerts ? 0 : 1}
          color="var(--success)"
          status={hasAlerts ? 'Action items need attention' : 'Everything looks good!'}
        />
      </div>

      {/* Empty state */}
      {!hasAlerts && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1.5px solid var(--success)',
          borderRadius: 'var(--radius)',
          padding: '40px 24px',
          textAlign: 'center',
          boxShadow: 'var(--shadow)',
        }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
            <CheckCircle2 size={64} color="var(--success)" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--success)', marginBottom: 8 }}>
            You're all caught up!
          </h2>
          <p style={{ color: 'var(--text-2)', fontSize: 15 }}>
            All medications are well-stocked and none are expiring soon.
          </p>
        </div>
      )}

      {/* Report sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {lowStock.length > 0 && (
          <ReportSection
            title="Low Stock Medications"
            subtitle={`${lowStock.length} medication${lowStock.length > 1 ? 's' : ''} need refilling`}
            icon={<AlertTriangle size={22} />}
            borderColor="var(--warning)"
            items={lowStock}
            columns={['Medication', 'Dosage', 'Type', 'Stock']}
            renderRow={med => [
              <div key="name">
                <div style={{ fontWeight: 600, fontSize: 15 }}>{med.name}</div>
                {med.brandName && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{med.brandName}</div>}
              </div>,
              <span key="dosage" style={{ fontSize: 14 }}>{med.dosage}</span>,
              <Badge key="type" label={med.type} type={med.type} />,
              <span key="qty" style={{
                fontWeight: 700, color: 'var(--warning)', fontSize: 14,
                background: 'var(--warning-dim)', padding: '3px 10px',
                borderRadius: 20, border: '1px solid var(--warning)',
                whiteSpace: 'nowrap',
              }}>{med.quantityLeft} left</span>,
            ]}
          />
        )}

        {expiring.length > 0 && (
          <ReportSection
            title="Expiring Within 30 Days"
            subtitle={`${expiring.length} medication${expiring.length > 1 ? 's' : ''} need checking`}
            icon={<Calendar size={22} />}
            borderColor="var(--danger)"
            items={expiring}
            columns={['Medication', 'Dosage', 'Type', 'Expires']}
            renderRow={med => {
              const daysLeft = med.expiryDate
                ? Math.ceil((new Date(med.expiryDate) - new Date()) / 86400000)
                : null
              return [
                <div key="name">
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{med.name}</div>
                  {med.brandName && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{med.brandName}</div>}
                </div>,
                <span key="dosage" style={{ fontSize: 14 }}>{med.dosage}</span>,
                <Badge key="type" label={med.type} type={med.type} />,
                <div key="expiry" style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{med.expiryDate}</div>
                  <span style={{
                    fontWeight: 700, color: 'var(--danger)', fontSize: 12,
                    background: 'var(--danger-dim)', padding: '2px 8px',
                    borderRadius: 12, border: '1px solid var(--danger)',
                  }}>
                    {daysLeft !== null ? `${daysLeft}d left` : 'Expired'}
                  </span>
                </div>,
              ]
            }}
          />
        )}
      </div>
    </div>
  )
}

function SummaryCard({ icon, title, count, color, status }) {
  return (
    <div style={{
      background: 'var(--bg-card)', border: '1.5px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '20px 22px',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{
          fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color,
        }}>{count}</span>
      </div>
      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{status}</div>
    </div>
  )
}

function ReportSection({ title, subtitle, icon, borderColor, items, columns, renderRow }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: `1.5px solid ${borderColor}`,
      borderLeft: `5px solid ${borderColor}`,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow)',
    }}>
      <div style={{
        padding: '18px 24px',
        borderBottom: `1px solid ${borderColor}33`,
        background: `color-mix(in srgb, ${borderColor} 5%, var(--bg-card))`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600, fontSize: 18,
            color: borderColor,
          }}>{title}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>{subtitle}</p>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
              {columns.map((col, i) => (
                <th key={i} style={{
                  padding: '11px 20px', textAlign: i === columns.length - 1 ? 'right' : 'left',
                  fontSize: 11, fontWeight: 700, color: 'var(--text-3)',
                  textTransform: 'uppercase', letterSpacing: '0.7px',
                  background: 'var(--bg-card-2)',
                }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, ri) => {
              const cells = renderRow(item)
              return (
                <tr key={item.id || ri} style={{
                  borderBottom: ri < items.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {cells.map((cell, ci) => (
                    <td key={ci} style={{
                      padding: '13px 20px',
                      textAlign: ci === cells.length - 1 ? 'right' : 'left',
                      verticalAlign: 'middle',
                    }}>{cell}</td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
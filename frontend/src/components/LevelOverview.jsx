import React from 'react'

export const norm = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()

const LEVELS = [
  { id: 'CRITICO', label: 'Crítico', color: '#ef4444' },
  { id: 'ALTO', label: 'Alto', color: '#f97316' },
  { id: 'MEDIO', label: 'Medio', color: '#eab308' },
  { id: 'BAJO', label: 'Bajo', color: '#22c55e' },
]

const card = { background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '1.5rem' }
const title = { fontSize: '.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '1.25rem' }

export default function LevelOverview({ vulns, onOpen }) {
  const counts = LEVELS.map(l => ({ ...l, n: vulns.filter(v => norm(v.level) === l.id).length }))
  const max = Math.max(1, ...counts.map(c => c.n))
  const urgent = vulns
    .filter(v => ['CRITICO', 'ALTO'].includes(norm(v.level)) && norm(v.status) !== 'MITIGADO')
    .sort((a, b) => (b.cvss || 0) - (a.cvss || 0)).slice(0, 5)

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 2rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.25rem' }}>
        <div style={card}>
          <h3 style={title}>Distribución por nivel <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '.8rem' }}>({vulns.length} en total)</span></h3>
          {counts.map(c => (
            <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 28px', alignItems: 'center', gap: 10, marginBottom: '.85rem', fontSize: '.8rem' }}>
              <span style={{ color: '#cbd5e1' }}>{c.label}</span>
              <div style={{ height: 8, background: '#0f172a', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${(c.n / max) * 100}%`, height: '100%', background: c.color, borderRadius: 4, transition: 'width .4s' }} />
              </div>
              <span style={{ fontFamily: 'JetBrains Mono', color: '#f1f5f9', textAlign: 'right' }}>{c.n}</span>
            </div>
          ))}
        </div>
        <div style={card}>
          <h3 style={title}>Críticas y altas pendientes</h3>
          {urgent.length === 0 && <p style={{ color: '#94a3b8', fontSize: '.85rem' }}>No hay vulnerabilidades críticas o altas pendientes.</p>}
          {urgent.map(v => (
            <button key={v.id} onClick={() => onOpen(v)} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, width: '100%', background: 'none', border: 'none', borderBottom: '1px solid #334155', padding: '.65rem 0', color: '#f1f5f9', fontSize: '.85rem', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
              <span>{v.title}</span>
              <span style={{ fontFamily: 'JetBrains Mono', color: LEVELS.find(l => l.id === norm(v.level))?.color }}>{v.cvss}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

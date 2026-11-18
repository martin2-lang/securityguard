import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

const EMPTY = { title: '', description: '', level: 'CRITICO', cvss: '', status: 'Pendiente', date: '', recommendation: '' }

export default function VulnModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = useState(EMPTY)

  useEffect(() => {
    if (initial) setForm({ ...initial, date: initial.date?.split('T')[0] || '' })
    else setForm({ ...EMPTY, date: new Date().toISOString().split('T')[0] })
  }, [initial, open])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.title.trim()) return alert('El título es obligatorio')
    onSave({ ...form, cvss: parseFloat(form.cvss) || 5.0 })
    onClose()
  }

  const labelStyle = { fontSize: '.72rem', color: '#cbd5e1', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4, display: 'block' }
  const groupStyle = { display: 'flex', flexDirection: 'column', marginBottom: '1rem' }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={e => e.target === e.currentTarget && onClose()}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)',
            backdropFilter: 'blur(4px)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            style={{
              background: '#1e293b', border: '1px solid #334155',
              borderRadius: 20, padding: '2rem',
              width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto'
            }}
            data-lenis-prevent
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                {initial ? 'Editar Vulnerabilidad' : 'Nueva Vulnerabilidad'}
              </h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Título</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: SQL Injection en login" />
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Descripción</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe la vulnerabilidad..." rows={3} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={groupStyle}>
                <label style={labelStyle}>Criticidad</label>
                <select value={form.level} onChange={e => set('level', e.target.value)}>
                  <option value="CRITICO">CRÍTICO</option>
                  <option value="ALTO">ALTO</option>
                  <option value="MEDIO">MEDIO</option>
                  <option value="BAJO">BAJO</option>
                </select>
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>CVSS (0–10)</label>
                <input type="number" value={form.cvss} onChange={e => set('cvss', e.target.value)} min={0} max={10} step={0.1} placeholder="9.8" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={groupStyle}>
                <label style={labelStyle}>Estado</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Mitigado">Mitigado</option>
                </select>
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Fecha</label>
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
            </div>

            <div style={groupStyle}>
              <label style={labelStyle}>Recomendación</label>
              <textarea value={form.recommendation} onChange={e => set('recommendation', e.target.value)} placeholder="Pasos para mitigar..." rows={3} />
            </div>

            <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '.5rem' }}>
              <button onClick={onClose} style={{
                background: 'transparent', color: '#cbd5e1',
                border: '1px solid #334155', padding: '.6rem 1.25rem',
                borderRadius: 8, cursor: 'pointer', fontSize: '.875rem', fontFamily: 'Space Grotesk'
              }}>
                Cancelar
              </button>
              <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                background: 'linear-gradient(135deg,#06b6d4,#0891b2)',
                color: '#fff', border: 'none', padding: '.6rem 1.5rem',
                borderRadius: 8, fontWeight: 600, fontSize: '.875rem',
                cursor: 'pointer', fontFamily: 'Space Grotesk'
              }}>
                Guardar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

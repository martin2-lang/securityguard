import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, AlertTriangle, Lock, Server, Database, Globe,
  Code2, Key, CheckCircle, Edit2, Trash2, Plus, Radio, FolderOpen, Ban, ShieldCheck, HardDrive, Search, ChevronLeft, ChevronRight, X
} from 'lucide-react'
import LevelOverview, { norm } from '../components/LevelOverview.jsx'
import Sidebar, { Topbar, SECTIONS } from '../components/Sidebar.jsx'
import VulnModal from '../components/VulnModal.jsx'
import ShinyText from '../components/react-bits/ShinyText.jsx'
import { getAllVulnerabilities, createVulnerability, updateVulnerability, deleteVulnerability } from '../services/api.js'

const ICONS = { key: Key, radio: Radio, db: Database, folder: FolderOpen, lock: Lock, globe: Globe, code: Code2, disk: HardDrive, ban: Ban, wall: ShieldCheck }
const Ico = ({ n, size = 22 }) => { const C = ICONS[n] || Shield; return <C size={size} strokeWidth={1.75} /> }

const SAMPLE_VULNS = [
  { id: '1', title: 'Credenciales por Defecto', description: 'Dispositivos con contraseñas de fábrica sin modificar.', level: 'CRITICO', cvss: 9.8, status: 'Pendiente', date: '2024-01-15', recommendation: 'Cambiar todas las contraseñas por defecto de inmediato.' },
  { id: '2', title: 'Protocolos en Texto Plano', description: 'Uso de Telnet y FTP exponiendo credenciales en tránsito.', level: 'CRITICO', cvss: 9.0, status: 'En Progreso', date: '2024-01-16', recommendation: 'Migrar a SSH y SFTP con cifrado fuerte.' },
  { id: '3', title: 'Base de Datos Expuesta', description: 'MongoDB accesible sin autenticación desde redes externas.', level: 'ALTO', cvss: 7.5, status: 'Pendiente', date: '2024-01-17', recommendation: 'Habilitar autenticación y restringir acceso por IP.' },
  { id: '4', title: 'Compartición de Archivos', description: 'Carpetas compartidas sin control de acceso adecuado.', level: 'ALTO', cvss: 6.8, status: 'Mitigado', date: '2024-01-18', recommendation: 'Aplicar permisos mínimos y auditar accesos.' },
  { id: '5', title: 'XSS en Panel Admin', description: 'Inyección de scripts en campos de búsqueda del panel.', level: 'MEDIO', cvss: 5.4, status: 'Pendiente', date: '2024-01-19', recommendation: 'Sanitizar y validar todas las entradas de usuario.' },
]

const getLevelBadge = (level) => {
  const styles = {
    CRITICO: { bg: 'rgba(239,68,68,.15)', color: '#fca5a5', border: 'rgba(239,68,68,.3)' },
    ALTO: { bg: 'rgba(249,115,22,.15)', color: '#fdba74', border: 'rgba(249,115,22,.3)' },
    MEDIO: { bg: 'rgba(234,179,8,.15)', color: '#fde68a', border: 'rgba(234,179,8,.3)' },
    BAJO: { bg: 'rgba(16,185,129,.15)', color: '#6ee7b7', border: 'rgba(16,185,129,.3)' },
  }
  const s = styles[level] || styles.BAJO
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      padding: '2px 10px', borderRadius: 20,
      fontSize: '.65rem', fontFamily: 'JetBrains Mono', fontWeight: 600
    }}>{level}</span>
  )
}

const getStatusBadge = (status) => {
  const styles = {
    'Pendiente': { bg: 'rgba(234,179,8,.12)', color: '#fde68a', border: 'rgba(234,179,8,.25)' },
    'En Progreso': { bg: 'rgba(239,68,68,.12)', color: '#fca5a5', border: 'rgba(239,68,68,.25)' },
    'Mitigado': { bg: 'rgba(16,185,129,.12)', color: '#6ee7b7', border: 'rgba(16,185,129,.25)' },
  }
  const s = styles[status] || styles.Pendiente
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      padding: '2px 10px', borderRadius: 20,
      fontSize: '.65rem', fontFamily: 'JetBrains Mono'
    }}>{status}</span>
  )
}

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }) }

export default function Dashboard({ onLogout }) {
  const [vulns, setVulns] = useState(SAMPLE_VULNS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editVuln, setEditVuln] = useState(null)
  const [backendOnline, setBackendOnline] = useState(false)
  const [notice, setNotice] = useState(null)
  const [active, setActive] = useState('panel')
  const [menuOpen, setMenuOpen] = useState(false)
  const [q, setQ] = useState('')
  const [fLevel, setFLevel] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState(null)
  const PAGE_SIZE = 6
  const filtered = vulns.filter(v => (!q || String(v.title).toLowerCase().includes(q.toLowerCase()))
    && (!fLevel || norm(v.level) === fLevel) && (!fStatus || norm(v.status) === norm(fStatus)))
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const curPage = Math.min(page, pages)
  const pageItems = filtered.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE)
  const pgBtn = { background: '#0f172a', border: '1px solid #334155', borderRadius: 6, color: '#f1f5f9', padding: 4, display: 'inline-flex', cursor: 'pointer' }
  const user = (() => { try { return JSON.parse(sessionStorage.getItem('sg_user')) } catch { return null } })()
  useEffect(() => { window.lenis ? window.lenis.scrollTo(0, { immediate: true }) : window.scrollTo(0, 0) }, [active])
  const isAdmin = (() => {
    try { return JSON.parse(sessionStorage.getItem('sg_user'))?.role === 'ADMIN' } catch { return false }
  })()
  const showNotice = (msg) => { setNotice(msg); setTimeout(() => setNotice(null), 4000) }
  const errorMsg = (err) => err?.response?.status === 403
    ? 'No tienes permiso para realizar esta acción.'
    : 'No se pudo completar la acción en el servidor.'

  // Try to load from backend
  useEffect(() => {
    getAllVulnerabilities()
      .then(res => { if (res.data?.length) { setVulns(res.data); setBackendOnline(true) } })
      .catch(() => setBackendOnline(false))
  }, [])

  const metrics = {
    total: vulns.length,
    critical: vulns.filter(v => v.level === 'CRITICO').length,
    cvssAvg: vulns.length ? (vulns.reduce((a, v) => a + v.cvss, 0) / vulns.length).toFixed(1) : '0.0',
    mitigated: vulns.filter(v => v.status === 'Mitigado').length + 4
  }

  const handleSave = async (data) => {
    if (backendOnline) {
      try {
        if (editVuln) {
          const res = await updateVulnerability(editVuln.id, data)
          setVulns(v => v.map(x => x.id === editVuln.id ? res.data : x))
        } else {
          const res = await createVulnerability(data)
          setVulns(v => [...v, res.data])
        }
      } catch (err) { showNotice(errorMsg(err)) }
      return
    }
    // Modo local (sin servidor): los cambios no se guardan
    if (editVuln) setVulns(v => v.map(x => x.id === editVuln.id ? { ...x, ...data } : x))
    else setVulns(v => [...v, { ...data, id: String(Date.now()) }])
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta vulnerabilidad?')) return
    if (backendOnline) {
      try { await deleteVulnerability(id) }
      catch (err) { showNotice(errorMsg(err)); return }
    }
    setVulns(v => v.filter(x => x.id !== id))
  }

  const openCreate = () => { setEditVuln(null); setModalOpen(true) }
  const openEdit = (v) => { setEditVuln(v); setModalOpen(true) }

  const sectionStyle = { padding: '5rem 2rem', maxWidth: 1280, margin: '0 auto' }
  const cardBase = {
    background: '#1e293b', border: '1px solid #334155',
    borderRadius: 16, padding: '1.5rem',
    transition: 'transform .3s, border-color .3s, box-shadow .3s'
  }

  return (
    <>
      <Sidebar active={active} onChange={setActive} open={menuOpen} onClose={() => setMenuOpen(false)} onLogout={onLogout} user={user} />
      {notice && (
        <div role="alert" style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100, background: '#7f1d1d', color: '#fecaca', border: '1px solid #ef4444', padding: '.75rem 1.25rem', borderRadius: 10, fontSize: '.85rem' }}>
          {notice}
        </div>
      )}
      {detail && (
        <div onClick={() => setDetail(null)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(0,0,0,.6)', display: 'grid', placeItems: 'center', padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} data-lenis-prevent style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '1.75rem', width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{detail.title}</h3>
              <button aria-label="Cerrar" onClick={() => setDetail(null)} style={{ ...pgBtn, height: 28 }}><X size={16} /></button>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
              {getLevelBadge(detail.level)} {getStatusBadge(detail.status)}
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '.75rem', color: '#94a3b8' }}>CVSS {detail.cvss ?? 'N/D'} · {detail.date?.split('T')[0] || 'sin fecha'}</span>
            </div>
            <p style={{ fontSize: '.7rem', color: '#94a3b8', fontFamily: 'JetBrains Mono', textTransform: 'uppercase' }}>Descripción</p>
            <p style={{ fontSize: '.9rem', color: '#e2e8f0', margin: '.25rem 0 1rem' }}>{detail.description || 'Sin descripción.'}</p>
            <p style={{ fontSize: '.7rem', color: '#94a3b8', fontFamily: 'JetBrains Mono', textTransform: 'uppercase' }}>Recomendación</p>
            <p style={{ fontSize: '.9rem', color: '#e2e8f0', marginTop: '.25rem' }}>{detail.recommendation || 'Sin recomendación.'}</p>
          </div>
        </div>
      )}
      <div className="sg-content">
      <Topbar title={SECTIONS.find(x => x.id === active)?.label} online={backendOnline} onMenu={() => setMenuOpen(true)} />
      <main>

                {active === 'panel' && (
<>
{/* ── HERO ── */}
        <div style={{
          minHeight: '90vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '4rem 2rem', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(6,182,212,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.04) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%,rgba(6,182,212,.08) 0%,transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(6,182,212,.08)', border: '1px solid rgba(6,182,212,.2)',
              borderRadius: 30, padding: '6px 16px', fontSize: '.75rem',
              fontFamily: 'JetBrains Mono', color: '#06b6d4', marginBottom: '2rem'
            }}>
              <span style={{ width: 6, height: 6, background: '#06b6d4', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Sistema de Gestión de Ciberseguridad
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .1 }}
              style={{ fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: '-.04em', marginBottom: '1.5rem' }}>
              Plan de Acción de<br />
              <ShinyText text="Seguridad Informática" color="#06b6d4" shineColor="#e0faff" speed={3} />
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .2 }}
              style={{ fontSize: '1.125rem', color: '#cbd5e1', maxWidth: 560, lineHeight: 1.7, marginBottom: '2.5rem' }}>
              Monitoreo integral de vulnerabilidades, hardening de sistemas y respuesta proactiva ante amenazas en tiempo real.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .3 }}
              style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => setActive('vulnerabilidades')}
                style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)', color: '#fff', border: 'none', padding: '.75rem 1.75rem', borderRadius: 10, fontWeight: 600, fontSize: '.875rem', cursor: 'pointer', fontFamily: 'Space Grotesk', boxShadow: '0 0 20px rgba(6,182,212,.3)', transition: 'transform .2s' }}>
                Ver Vulnerabilidades
              </button>
              {isAdmin && (
<button onClick={openCreate}
                style={{ background: 'transparent', color: '#f1f5f9', border: '1px solid #334155', padding: '.75rem 1.75rem', borderRadius: 10, fontSize: '.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'Space Grotesk', transition: 'border-color .2s' }}>
                + Nueva Vulnerabilidad
              </button>
)}
            </motion.div>

            {/* Metrics bar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: '#334155', border: '1px solid #334155', borderRadius: 16, overflow: 'hidden', marginTop: '4rem', maxWidth: 640, width: '100%' }}>
              {[
                { val: metrics.total, label: 'Total' },
                { val: metrics.critical, label: 'Críticas' },
                { val: metrics.cvssAvg, label: 'CVSS Prom.' },
                { val: metrics.mitigated, label: 'Protegidos' }
              ].map((m, i) => (
                <div key={i} style={{ background: '#1e293b', padding: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'JetBrains Mono', background: 'linear-gradient(135deg,#06b6d4,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{m.val}</div>
                  <div style={{ fontSize: '.7rem', color: '#cbd5e1', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.08em' }}>{m.label}</div>
                </div>
              ))}
            </motion.div>

            {!backendOnline && (
              <div style={{ marginTop: '1rem', fontSize: '.7rem', color: 'rgba(203,213,225,.4)', fontFamily: 'JetBrains Mono' }}>
                Sin conexión con el servidor — se muestran datos de ejemplo y los cambios no se guardan
              </div>
            )}
          </div>
        </div>

        <LevelOverview vulns={vulns} onOpen={setDetail} />
{/* ── METRICS ── */}
        <section id="metricas" style={{ padding: '5rem 2rem' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', background: 'linear-gradient(135deg,rgba(6,182,212,.04),rgba(249,115,22,.04))', border: '1px solid #334155', borderRadius: 20, padding: '3rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'inline-block', background: 'rgba(6,182,212,.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,.2)', borderRadius: 20, padding: '4px 14px', fontSize: '.7rem', fontFamily: 'JetBrains Mono', marginBottom: '1rem' }}>// metrics</div>
              <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 700 }}>Métricas de <span className="gradient-text">Seguridad</span></h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '1.5rem', textAlign: 'center' }}>
              {[
                { val: metrics.total, label: 'Vulnerabilidades', color: '#06b6d4', border: 'rgba(6,182,212,.4)' },
                { val: 23, label: 'Puertos Monitoreados', color: '#ef4444', border: 'rgba(239,68,68,.4)' },
                { val: metrics.mitigated, label: 'Servicios Protegidos', color: '#10b981', border: 'rgba(16,185,129,.4)' },
                { val: metrics.critical, label: 'Alertas Activas', color: '#f97316', border: 'rgba(249,115,22,.4)' },
              ].map((m, i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" custom={i} viewport={{ once: true }}
                  style={{ padding: '1.5rem', background: '#1e293b', borderRadius: 14, border: '1px solid #334155', borderTop: `2px solid ${m.border}` }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 700, fontFamily: 'JetBrains Mono', color: m.color, marginBottom: '.25rem' }}>{m.val}</div>
                  <div style={{ fontSize: '.72rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '.08em' }}>{m.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        </>
)}

        {active === 'vulnerabilidades' && (
<>
{/* ── VULNERABILIDADES ── */}
        <section id="vulnerabilidades" style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-block', background: 'rgba(6,182,212,.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,.2)', borderRadius: 20, padding: '4px 14px', fontSize: '.7rem', fontFamily: 'JetBrains Mono', marginBottom: '1rem' }}>// vulnerabilities</div>
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 700, letterSpacing: '-.03em' }}>Vulnerabilidades <span className="gradient-text">Detectadas</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem' }}>
            {[
              { icon: 'key', badge: 'CRITICO', title: 'Credenciales por Defecto', desc: 'Dispositivos y servicios con credenciales de fábrica sin modificar.', cvss: 9.8 },
              { icon: 'radio', badge: 'CRITICO', title: 'Protocolos en Texto Plano', desc: 'Uso de Telnet, FTP y HTTP sin cifrado en comunicaciones.', cvss: 9.0 },
              { icon: 'db', badge: 'ALTO', title: 'Base de Datos Expuesta', desc: 'MongoDB y MySQL accesibles sin autenticación desde exterior.', cvss: 7.5 },
              { icon: 'folder', badge: 'ALTO', title: 'Compartición de Archivos', desc: 'Carpetas compartidas sin control de acceso adecuado.', cvss: 6.8 },
            ].map((v, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" custom={i} viewport={{ once: true }}
                style={{ ...cardBase, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(6,182,212,.35)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(6,182,212,.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.boxShadow = '' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ width: 44, height: 44, background: v.badge === 'CRITICO' ? 'rgba(239,68,68,.12)' : 'rgba(249,115,22,.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}><Ico n={v.icon} /></div>
                  {getLevelBadge(v.badge)}
                </div>
                <h3 style={{ fontWeight: 600, marginBottom: '.5rem' }}>{v.title}</h3>
                <p style={{ color: '#cbd5e1', fontSize: '.8rem', lineHeight: 1.6, marginBottom: '1rem' }}>{v.desc}</p>
                <div style={{ height: 4, background: 'rgba(255,255,255,.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${v.cvss * 10}%`, background: v.cvss >= 8 ? 'linear-gradient(90deg,#ef4444,#f97316)' : 'linear-gradient(90deg,#f97316,#fbbf24)', borderRadius: 2 }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '.7rem', fontFamily: 'JetBrains Mono' }}>
                  <span style={{ color: '#cbd5e1' }}>CVSS</span><span style={{ color: '#f97316' }}>{v.cvss}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── CRUD TABLE ── */}
        <section id="gestion" style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-block', background: 'rgba(6,182,212,.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,.2)', borderRadius: 20, padding: '4px 14px', fontSize: '.7rem', fontFamily: 'JetBrains Mono', marginBottom: '1rem' }}>// database</div>
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 700 }}>Gestión de <span className="gradient-text">Vulnerabilidades</span></h2>
            <p style={{ color: '#cbd5e1', marginTop: '.75rem', fontSize: '.9rem' }}>CRUD completo — Spring Boot REST API + MongoDB</p>
          </div>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 20, overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontWeight: 600 }}>Registro de Vulnerabilidades <span style={{ fontSize: '.75rem', color: '#cbd5e1', fontFamily: 'JetBrains Mono' }}>({vulns.length})</span></h3>
              {isAdmin && (
<button onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg,#06b6d4,#0891b2)', color: '#fff', border: 'none', padding: '.5rem 1.25rem', borderRadius: 8, fontWeight: 600, fontSize: '.8rem', cursor: 'pointer', fontFamily: 'Space Grotesk' }}>
                <Plus size={14} /> Agregar
              </button>
)}
            </div>
            <div style={{ display: 'flex', gap: '.75rem', flexWrap: 'wrap', padding: '1rem 2rem', borderBottom: '1px solid #334155' }}>
              <div style={{ position: 'relative', flex: '1 1 220px' }}>
                <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                <input className="has-icon" value={q} onChange={e => { setQ(e.target.value); setPage(1) }} placeholder="Buscar por título..." style={{ width: '100%' }} />
              </div>
              <select value={fLevel} onChange={e => { setFLevel(e.target.value); setPage(1) }}>
                <option value="">Todos los niveles</option>
                {['CRITICO', 'ALTO', 'MEDIO', 'BAJO'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <select value={fStatus} onChange={e => { setFStatus(e.target.value); setPage(1) }}>
                <option value="">Todos los estados</option>
                {['Pendiente', 'En Progreso', 'Mitigado'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.8rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,.2)' }}>
                    {['Título', 'Nivel', 'CVSS', 'Estado', 'Fecha', 'Acciones'].map(h => (
                      <th key={h} style={{ padding: '.875rem 1.25rem', textAlign: 'left', color: '#cbd5e1', fontSize: '.7rem', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '.08em', borderBottom: '1px solid #334155' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((v) => (
                    <tr key={v.id} style={{ borderBottom: '1px solid rgba(51,65,85,.4)', transition: 'background .2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(6,182,212,.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td style={{ padding: '.875rem 1.25rem', fontWeight: 500 }}><button title="Ver detalle" onClick={() => setDetail(v)} style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', textAlign: 'left', padding: 0 }}>{v.title}</button></td>
                      <td style={{ padding: '.875rem 1.25rem' }}>{getLevelBadge(v.level)}</td>
                      <td style={{ padding: '.875rem 1.25rem', fontFamily: 'JetBrains Mono', color: v.cvss >= 7 ? '#ef4444' : v.cvss >= 4 ? '#f97316' : '#10b981' }}>{v.cvss}</td>
                      <td style={{ padding: '.875rem 1.25rem' }}>{getStatusBadge(v.status)}</td>
                      <td style={{ padding: '.875rem 1.25rem', color: '#cbd5e1', fontFamily: 'JetBrains Mono', fontSize: '.75rem' }}>{v.date?.split('T')[0]}</td>
                      <td style={{ padding: '.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '.5rem' }}>
                          {isAdmin && (
<button onClick={() => openEdit(v)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(6,182,212,.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,.2)', padding: '4px 12px', borderRadius: 6, fontSize: '.7rem', cursor: 'pointer', fontFamily: 'Space Grotesk' }}>
                            <Edit2 size={11} /> Editar
                          </button>
)}
                          {isAdmin && (
<button onClick={() => handleDelete(v.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(239,68,68,.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.2)', padding: '4px 12px', borderRadius: 6, fontSize: '.7rem', cursor: 'pointer', fontFamily: 'Space Grotesk' }}>
                            <Trash2 size={11} /> Eliminar
                          </button>
)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '.85rem' }}>No hay resultados con esos filtros.</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.875rem 2rem', borderTop: '1px solid #334155', fontSize: '.75rem', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>
              <span>{filtered.length} resultado{filtered.length === 1 ? '' : 's'}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button aria-label="Anterior" disabled={curPage <= 1} onClick={() => setPage(curPage - 1)} style={{ ...pgBtn, opacity: curPage <= 1 ? .4 : 1 }}><ChevronLeft size={14} /></button>
                <span>{curPage} / {pages}</span>
                <button aria-label="Siguiente" disabled={curPage >= pages} onClick={() => setPage(curPage + 1)} style={{ ...pgBtn, opacity: curPage >= pages ? .4 : 1 }}><ChevronRight size={14} /></button>
              </div>
            </div>
          </div>
        </section>

        </>
)}

        {active === 'categorias' && (
<>
{/* ── CATEGORIES ── */}
        <section id="categorias" style={{ ...sectionStyle, background: 'linear-gradient(180deg,transparent,rgba(30,41,59,.3),transparent)', maxWidth: 'unset' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <div style={{ display: 'inline-block', background: 'rgba(6,182,212,.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,.2)', borderRadius: 20, padding: '4px 14px', fontSize: '.7rem', fontFamily: 'JetBrains Mono', marginBottom: '1rem' }}>// categories</div>
              <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 700 }}>Matriz de <span className="gradient-text">Categorías</span></h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '1.25rem' }}>
              {[
                { icon: 'lock', IconComp: Lock, title: 'Seguridad de Acceso', desc: 'Gestión de identidades, MFA y control de privilegios mínimos.', decision: 'Implementar MFA obligatorio y revisar accesos privilegiados trimestralmente.' },
                { icon: 'globe', IconComp: Globe, title: 'Seguridad de Red', desc: 'Segmentación de redes, monitoreo de tráfico y filtrado NGFW.', decision: 'Cerrar puertos no esenciales y habilitar IDS/IPS con alertas en tiempo real.' },
                { icon: 'db', IconComp: Database, title: 'Seguridad de Base de Datos', desc: 'Cifrado en reposo/tránsito, auditoría de queries y RBAC.', decision: 'Activar TLS, auditoría completa y acceso solo desde red interna.' },
                { icon: 'code', IconComp: Code2, title: 'Seguridad de Código', desc: 'SAST/DAST, revisión de dependencias y pentesting automatizado.', decision: 'Integrar análisis en CI/CD y revisar dependencias con cada release.' },
              ].map((c, i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" custom={i} viewport={{ once: true }}
                  style={{ ...cardBase }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(249,115,22,.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#334155' }}>
                  <div style={{ width: 52, height: 52, background: 'rgba(6,182,212,.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: '1.25rem' }}><Ico n={c.icon} /></div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#06b6d4', marginBottom: '.75rem' }}>{c.title}</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '.825rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>{c.desc}</p>
                  <div style={{ background: 'rgba(249,115,22,.08)', border: '1px solid rgba(249,115,22,.2)', borderRadius: 10, padding: '.75rem 1rem' }}>
                    <div style={{ fontSize: '.65rem', fontFamily: 'JetBrains Mono', color: '#f97316', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>Decisión</div>
                    <div style={{ fontSize: '.8rem', color: '#fdba74', fontStyle: 'italic', lineHeight: 1.5 }}>"{c.decision}"</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        </>
)}

        {active === 'hardening' && (
<>
{/* ── HARDENING ── */}
        <section style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-block', background: 'rgba(6,182,212,.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,.2)', borderRadius: 20, padding: '4px 14px', fontSize: '.7rem', fontFamily: 'JetBrains Mono', marginBottom: '1rem' }}>// hardening</div>
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 700 }}>Estado de <span className="gradient-text">Hardening</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.5rem' }}>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" custom={0} viewport={{ once: true }}
              style={{ background: '#1a0a0a', border: '1px solid rgba(239,68,68,.25)', borderRadius: 16, padding: '2rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(239,68,68,.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.3)', padding: '4px 12px', borderRadius: 20, fontSize: '.7rem', fontFamily: 'JetBrains Mono', marginBottom: '1.5rem' }}>ANTES</span>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}><AlertTriangle size={30} color="#ef4444" strokeWidth={1.5} /></div>
              <h3 style={{ marginBottom: '1.25rem' }}>Estado Vulnerable</h3>
              {[['Puertos abiertos','23'],['Vulnerabilidades','12'],['CVSS promedio','9.8'],['Servicios sin SSL','8'],['Contraseñas débiles','15'],['Nivel de riesgo','CRÍTICO']].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '.5rem .75rem', background: 'rgba(0,0,0,.2)', borderRadius: 8, marginBottom: '.5rem', fontSize: '.8rem' }}>
                  <span style={{ color: '#cbd5e1' }}>{k}</span>
                  <span style={{ color: '#fca5a5', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" custom={1} viewport={{ once: true }}
              style={{ background: '#081a10', border: '1px solid rgba(16,185,129,.25)', borderRadius: 16, padding: '2rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,.15)', color: '#6ee7b7', border: '1px solid rgba(16,185,129,.3)', padding: '4px 12px', borderRadius: 20, fontSize: '.7rem', fontFamily: 'JetBrains Mono', marginBottom: '1.5rem' }}>DESPUÉS</span>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}><ShieldCheck size={30} color="#22c55e" strokeWidth={1.5} /></div>
              <h3 style={{ marginBottom: '1.25rem' }}>Estado Protegido</h3>
              {[['Puertos abiertos','3'],['Vulnerabilidades críticas','0'],['CVSS promedio','3.2'],['Servicios sin SSL','0'],['Contraseñas débiles','0'],['Nivel de riesgo','BAJO']].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '.5rem .75rem', background: 'rgba(0,0,0,.2)', borderRadius: 8, marginBottom: '.5rem', fontSize: '.8rem' }}>
                  <span style={{ color: '#cbd5e1' }}>{k}</span>
                  <span style={{ color: '#6ee7b7', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── ACTIONS ── */}
        <section style={sectionStyle}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ display: 'inline-block', background: 'rgba(6,182,212,.1)', color: '#06b6d4', border: '1px solid rgba(6,182,212,.2)', borderRadius: 20, padding: '4px 14px', fontSize: '.7rem', fontFamily: 'JetBrains Mono', marginBottom: '1rem' }}>// actions</div>
            <h2 style={{ fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 700 }}>Acciones <span className="gradient-text">Implementadas</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.25rem' }}>
            {[
              { icon: 'lock', title: 'Hardening SSH', desc: 'Puerto 2222, autenticación por clave pública, acceso root deshabilitado.' },
              { icon: 'lock', title: 'Configuración HTTPS', desc: 'Certificados SSL/TLS en todos los servicios con redirección HTTP→HTTPS.' },
              { icon: 'ban', title: 'Restricción de Puertos', desc: '20 puertos cerrados, segmentación con VLANs dedicadas por servicio.' },
              { icon: 'wall', title: 'Firewall Seguro', desc: 'Política deny-all, reglas granulares y logging completo de conexiones.' },
              { icon: 'disk', title: 'Protección Base de Datos', desc: 'Cifrado en reposo, IPs restringidas, auditoría de queries habilitada.' },
              { icon: 'key', title: 'Actualización de Credenciales', desc: 'Política robusta, rotación automática y MFA para administradores.' },
            ].map((a, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" custom={i} viewport={{ once: true }}
                style={{ ...cardBase, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,.3)'; e.currentTarget.style.background = 'rgba(16,185,129,.03)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.background = '#1e293b' }}>
                <div style={{ width: 42, height: 42, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}><Ico n={a.icon} /></div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '.9rem', fontWeight: 600, color: '#06b6d4', marginBottom: '.35rem' }}>{a.title}</h4>
                  <p style={{ fontSize: '.775rem', color: '#cbd5e1', lineHeight: 1.55 }}>{a.desc}</p>
                </div>
                <div style={{ width: 22, height: 22, background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#10b981', flexShrink: 0 }}>✓</div>
              </motion.div>
            ))}
          </div>
        </section>

        </>
)}

</main>
      </div>

      <VulnModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editVuln}
      />

      <style>{`
        @keyframes pulse { 0%,100%{box-shadow:0 0 0 0 rgba(6,182,212,.4)} 50%{box-shadow:0 0 0 6px rgba(6,182,212,0)} }
        .gradient-text { background:linear-gradient(135deg,#06b6d4 0%,#38bdf8 40%,#f97316 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
      `}</style>
    </>
  )
}

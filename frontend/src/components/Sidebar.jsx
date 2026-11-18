import React from 'react'
import { LayoutDashboard, ShieldAlert, Layers, Lock, LogOut, Menu, Shield, Wifi, WifiOff } from 'lucide-react'

export const SECTIONS = [
  { id: 'panel', label: 'Panel general', icon: LayoutDashboard },
  { id: 'vulnerabilidades', label: 'Vulnerabilidades', icon: ShieldAlert },
  { id: 'categorias', label: 'Categorías', icon: Layers },
  { id: 'hardening', label: 'Hardening', icon: Lock },
]

export default function Sidebar({ active, onChange, open, onClose, onLogout, user }) {
  return (
    <>
      <div className={`sg-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sg-sidebar ${open ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '1.25rem 1.25rem 1rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#06b6d4,#f97316)', display: 'grid', placeItems: 'center' }}>
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>SecurityGuard</div>
            <div style={{ fontSize: '.65rem', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>SOC Dashboard</div>
          </div>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '.75rem' }}>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button key={id} className={`sg-nav-item ${active === id ? 'active' : ''}`}
              onClick={() => { onChange(id); onClose() }}>
              <Icon size={18} strokeWidth={1.75} /> {label}
            </button>
          ))}
        </nav>
        <div style={{ marginTop: 'auto', padding: '1rem', borderTop: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '.75rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#1e293b', border: '1px solid #334155', display: 'grid', placeItems: 'center', fontWeight: 600, fontSize: '.8rem', color: '#06b6d4' }}>
              {(user?.username || '?').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '.85rem', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</div>
              <div style={{ fontSize: '.65rem', color: '#94a3b8', fontFamily: 'JetBrains Mono' }}>{user?.role}</div>
            </div>
          </div>
          <button className="sg-nav-item" onClick={onLogout}><LogOut size={18} strokeWidth={1.75} /> Cerrar sesión</button>
        </div>
      </aside>
    </>
  )
}

export function Topbar({ title, online, onMenu }) {
  const color = online ? '#22c55e' : '#f97316'
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 40, height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 1.5rem', background: 'rgba(11,17,32,.85)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #1e293b' }}>
      <button className="sg-menu-btn" onClick={onMenu} aria-label="Abrir menú"
        style={{ background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9', padding: 6, cursor: 'pointer' }}>
        <Menu size={18} />
      </button>
      <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc' }}>{title}</h2>
      <div style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.72rem', fontFamily: 'JetBrains Mono', color, border: `1px solid ${color}55`, background: `${color}14`, padding: '4px 10px', borderRadius: 20 }}>
        {online ? <Wifi size={13} /> : <WifiOff size={13} />}
        {online ? 'Servidor conectado' : 'Sin conexión'}
      </div>
    </header>
  )
}

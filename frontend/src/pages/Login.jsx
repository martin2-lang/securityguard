import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Lock, User, AlertTriangle, Eye, EyeOff } from 'lucide-react'

export default function Login({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(false)
    const ok = await onLogin(user, pass)
    if (ok !== true) {
      setError(ok === 'offline' ? 'offline' : 'credentials')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* BG grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(6,182,212,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.04) 1px,transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,182,212,.08) 0%, transparent 70%)'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '2.5rem',
          width: '100%',
          maxWidth: '400px',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, #06b6d4, #f97316)',
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Shield size={26} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              <span style={{ color: 'var(--cyan)' }}>Security</span>Guard
            </div>
            <div style={{ fontSize: '.7rem', color: 'var(--gray)', fontFamily: 'JetBrains Mono, monospace' }}>
              SOC Dashboard v1.0
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, textAlign: 'center', marginBottom: '.4rem' }}>
          Iniciar Sesión
        </h2>
        <p style={{ color: 'var(--gray)', fontSize: '.85rem', textAlign: 'center', marginBottom: '2rem' }}>
          Accede al panel de seguridad
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)',
                borderRadius: 8, padding: '.625rem 1rem',
                color: '#fca5a5', fontSize: '.8rem', display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <AlertTriangle size={14} />
              {error === 'offline' ? 'No se pudo conectar con el servidor (puerto 8080)' : 'Credenciales incorrectas'}
            </motion.div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            <label style={{ fontSize: '.72rem', color: 'var(--gray)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              Usuario
            </label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: 14, pointerEvents: 'none', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
              <input
                type="text"
                autoComplete="off"
                className="has-icon"
                value={user}
                onChange={e => setUser(e.target.value)}
                placeholder="admin"
                
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
            <label style={{ fontSize: '.72rem', color: 'var(--gray)', fontFamily: 'JetBrains Mono', textTransform: 'uppercase', letterSpacing: '.08em' }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, pointerEvents: 'none', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="new-password"
                value={pass}
                onChange={e => setPass(e.target.value)}
                placeholder="••••••••"
                className="has-icon has-eye"
              />
              <button type="button" aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'} onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
              color: '#fff', border: 'none', padding: '.75rem',
              borderRadius: 10, fontWeight: 600, fontSize: '.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Space Grotesk', marginTop: '.5rem',
              opacity: loading ? .7 : 1, boxShadow: '0 0 20px rgba(6,182,212,.3)'
            }}
          >
            {loading ? '⏳ Verificando...' : 'Acceder al Sistema'}
          </motion.button>
        </form>

      </motion.div>
    </div>
  )
}

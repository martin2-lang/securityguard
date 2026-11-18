import React, { useState, useEffect } from 'react'
import Lenis from 'lenis'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import { login } from './services/api.js'

export default function App() {
  // La sesión se recupera del token guardado (sobrevive a recargas de la página)
  const [isAuthenticated, setIsAuthenticated] = useState(!!sessionStorage.getItem('sg_token'))

  // Scroll suave (Lenis)
  useEffect(() => {
    const lenis = new Lenis()
    window.lenis = lenis
    let id
    const raf = (t) => { lenis.raf(t); id = requestAnimationFrame(raf) }
    id = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(id); lenis.destroy(); delete window.lenis }
  }, [])

  const handleLogin = async (user, pass) => {
    try {
      const { data } = await login(user, pass)
      sessionStorage.setItem('sg_token', data.token)
      sessionStorage.setItem('sg_user', JSON.stringify({ username: data.username, role: data.role }))
      setIsAuthenticated(true)
      return true
    } catch (err) {
      return err.response ? false : 'offline' // sin respuesta = backend apagado
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('sg_token')
    sessionStorage.removeItem('sg_user')
    setIsAuthenticated(false)
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated
          ? <Navigate to="/" replace />
          : <Login onLogin={handleLogin} />}
      />
      <Route
        path="/*"
        element={isAuthenticated
          ? <Dashboard onLogout={handleLogout} />
          : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}

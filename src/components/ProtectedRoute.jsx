import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session || !session.user) {
      setIsAuthenticated(false)
      setLoading(false)
      return
    }

    setIsAuthenticated(true)

    if (requireAdmin) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      setIsAdmin(profile?.role === 'admin')
    }

    setLoading(false)
  }

  // CRITICAL: Show nothing/loading while checking - never render children early
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f5',
        color: '#18181b',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  // Not logged in at all -> login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in but admin required and user is not admin -> student dashboard
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

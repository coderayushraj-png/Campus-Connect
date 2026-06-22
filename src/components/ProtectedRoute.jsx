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
    let isMounted = true;

    async function checkAuth() {
      if (isMounted) setLoading(true);

      // Secure server-side token verification instead of local getSession
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        if (isMounted) {
          setIsAuthenticated(false)
          setLoading(false)
        }
        return
      }

      if (isMounted) setIsAuthenticated(true)

      if (requireAdmin) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (isMounted) {
          setIsAdmin(!profileError && profile?.role === 'admin')
        }
      } else {
        if (isMounted) {
          setIsAdmin(false)
        }
      }

      if (isMounted) setLoading(false)
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        if (isMounted) {
          setIsAuthenticated(false)
          setIsAdmin(false)
        }
      }
    })

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    }
  }, [requireAdmin])

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

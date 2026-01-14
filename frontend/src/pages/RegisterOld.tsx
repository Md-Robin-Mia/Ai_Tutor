import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useAuthStore } from '../store/authStore'
import { AnimatedLink } from '../components/ui/animated-link'

export default function RegisterOld() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')
    
    try {
      const state = Math.random().toString(36).substring(2, 15)
      sessionStorage.setItem('google_oauth_state', state)
      const googleAuthUrl = `/api/auth/google?state=${state}`
      window.location.href = googleAuthUrl
    } catch (err: any) {
      console.error('Google login error:', err)
      setError('Failed to connect to Google. Please try again.')
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.role) {
      setError('Please select a role')
      setLoading(false)
      return
    }

    console.log('Submitting registration with data:', formData)
    console.log('Selected role:', formData.role)

    try {
      const response = await api.post('/auth/register', formData)
      const { token, user } = response.data
      
      console.log('Registration successful - Backend response:', { token, user })
      console.log('User role from backend:', user?.role)
      
      const userForStore = {
        ...user,
        id: user.id || user._id
      }
      
      console.log('User data for store:', userForStore)
      setAuth(token, userForStore)
      console.log('Auth data stored in store')
      
      const intendedDestination = localStorage.getItem('intendedDestination')
      localStorage.removeItem('intendedDestination')
      
      console.log('Intended destination:', intendedDestination)
      console.log('Will navigate based on role:', user?.role)
      
      if (intendedDestination) {
        console.log('Navigating to intended destination:', intendedDestination)
        navigate(intendedDestination)
      } else {
        console.log('Navigating based on role switch for:', user?.role)
        switch (user.role) {
          case 'student':
            console.log('Navigating to student dashboard')
            navigate('/student-dashboard')
            break
          case 'teacher':
            console.log('Navigating to teacher dashboard')
            navigate('/TeacherDashboard')
            break
          default:
            console.log('Navigating to learn page (default)')
            navigate('/learn')
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers
      })
      
      if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your internet connection and try again.')
        return
      }
      
      if (err.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please check if the backend is running.')
        return
      }
      
      // Show more detailed error message
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed'
      console.log('Setting error message:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      position: 'relative',
      minHeight: '100vh'
    }}>
      {/* Static Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full" style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.2))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          filter: 'blur(40px)'
        }}></div>
        <div className="absolute top-20 right-20 w-24 h-24 rounded-full" style={{
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(239, 68, 68, 0.2))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          filter: 'blur(35px)'
        }}></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full" style={{
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3), rgba(16, 185, 129, 0.2))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          filter: 'blur(45px)'
        }}></div>
        <div className="absolute bottom-32 right-16 w-28 h-28 rounded-full" style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.2))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          filter: 'blur(30px)'
        }}></div>
      </div>
      
      <div className="flex items-center justify-center w-full max-w-6xl mx-auto relative z-10 px-4">
        <div className="w-full max-w-lg lg:max-w-xl">
          <Card className="w-full glass-card-advanced" style={{
            background: 'rgba(25, 25, 46, 0.8)',
            backdropFilter: 'blur(35px) saturate(180%)',
            WebkitBackdropFilter: 'blur(35px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            borderRadius: '20px',
            boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(255, 255, 255, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            padding: '2rem'
          }}>
            <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold register-title" style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 25%, #a78bfa 50%, #c084fc 75%, #60a5fa 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              textShadow: '0 0 40px rgba(102, 126, 234, 0.3)'
            }}>Create Account</CardTitle>
            <CardDescription className="register-subtitle text-center" style={{
              color: '#CBD5E1',
              fontSize: '0.95rem',
              fontWeight: '500',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Join our learning community today.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <div className="p-3 text-sm rounded-md border fade-in" style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#f87171'
                }}>
                  {error}
                </div>
              )}
              
              <button 
                type="button"
                className="register-button-google w-full flex items-center justify-center gap-2 py-3 glass-button-secondary" 
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                }}
                disabled={googleLoading}
                onClick={handleGoogleLogin}
              >
              {googleLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting to Google...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

              <div className="register-divider" style={{
                position: 'relative',
                margin: '24px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  zIndex: 0
                }}></div>
                <span style={{
                  background: 'rgba(25, 25, 46, 0.8)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  color: '#F8FAFC',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  position: 'relative',
                  zIndex: 1,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                }}>Or continue with email</span>
              </div>
            
              <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-2">
                <label className="register-input-label" style={{
                  color: '#F8FAFC',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '8px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}>Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="register-input modern-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#F8FAFC',
                    padding: '16px',
                    borderRadius: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="register-input-label" style={{
                  color: '#F8FAFC',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '8px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}>Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="register-input modern-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#F8FAFC',
                    padding: '16px',
                    borderRadius: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="register-input-label" style={{
                  color: '#F8FAFC',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '8px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}>Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="register-input modern-input"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#F8FAFC',
                    padding: '16px',
                    borderRadius: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '0.95rem'
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="register-input-label" style={{
                  color: '#F8FAFC',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  display: 'block',
                  marginBottom: '8px',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                }}>Role</label>
                <select
                  className="register-select modern-input"
                  value={formData.role}
                  onChange={(e) => {
                    console.log('Role changed to:', e.target.value)
                    setFormData({ ...formData, role: e.target.value })
                  }}
                  required
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#F8FAFC',
                    padding: '16px',
                    borderRadius: '12px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
                    width: '100%',
                    boxSizing: 'border-box',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="" style={{ background: '#1e293b', color: '#94a3b8' }}>Select a role</option>
                  <option value="student" style={{ background: '#1e293b', color: '#f8fafc' }}>Student</option>
                  <option value="teacher" style={{ background: '#1e293b', color: '#f8fafc' }}>Teacher</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="register-button-primary w-full py-3 glass-button-primary" 
                style={{
                  background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 16px 64px rgba(0, 0, 0, 0.3), 0 0 20px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
                disabled={loading}
              >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : 'Sign Up'}
            </button>

              <p className="text-center text-sm" style={{
                color: '#CBD5E1',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                Already have an account?{' '}
                <AnimatedLink to="/login" animation="slide" className="ml-1" style={{
                  color: '#60a5fa',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}>
                  Sign in
                </AnimatedLink>
              </p>
              </form>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}

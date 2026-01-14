import { useState } from 'react'
import api from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { AnimatedLink } from '../components/ui/animated-link'
import { Spinner } from '../components/ui/spinner'
import '../styles/dashboard-theme.css'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await api.post('/auth/forgot-password', { email })
      
      if (response.status === 200) {
        setMessage('Password reset instructions have been sent to your email.')
        setEmail('')
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Don't reveal if user exists or not for security
        setMessage('If an account with this email exists, password reset instructions have been sent.')
        setEmail('')
      } else {
        setError(err.response?.data?.message || 'Network error. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-glass-container" style={{
      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 25%, rgba(240, 147, 251, 0.05) 50%, rgba(74, 222, 128, 0.05) 75%, rgba(251, 191, 36, 0.05) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Static Decorative Elements */}
      <div className="login-floating-orb login-orb-1" style={{
        position: 'absolute',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        width: '150px',
        height: '150px',
        top: '5%',
        left: '3%'
      }}></div>
      <div className="login-floating-orb login-orb-2" style={{
        position: 'absolute',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        width: '100px',
        height: '100px',
        top: '15%',
        right: '8%'
      }}></div>
      <div className="login-floating-orb login-orb-3" style={{
        position: 'absolute',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        width: '180px',
        height: '180px',
        bottom: '10%',
        left: '5%'
      }}></div>
      <div className="login-floating-orb login-orb-4" style={{
        position: 'absolute',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        width: '120px',
        height: '120px',
        bottom: '20%',
        right: '3%'
      }}></div>

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <Card className="w-full max-w-md glass-card-advanced" style={{
          background: 'rgba(25, 25, 46, 0.8)',
          backdropFilter: 'blur(35px) saturate(180%)',
          WebkitBackdropFilter: 'blur(35px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '20px',
          boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold" style={{
            background: 'linear-gradient(135deg, #667EEA 0%, #764BA2 50%, #F093FB 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontWeight: '800',
            letterSpacing: '-0.02em',
            textShadow: '0 0 40px rgba(102, 126, 234, 0.3)'
          }}>Forgot Password</CardTitle>
          <CardDescription className="text-center" style={{
            color: '#CBD5E1',
            fontWeight: '500',
            lineHeight: '1.6'
          }}>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="login-error fade-in" style={{
                background: 'rgba(248, 113, 113, 0.1)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                color: '#fca5a5',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '0.875rem',
                boxShadow: '0 4px 16px rgba(248, 113, 113, 0.1)'
              }}>
                {error}
              </div>
            )}
            {message && (
              <div className="login-success fade-in" style={{
                background: 'rgba(16, 185, 129, 0.1)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                color: '#86efac',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '0.875rem',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)'
              }}>
                {message}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="login-input-label" style={{
                color: '#F8FAFC',
                fontWeight: '600',
                fontSize: '0.875rem',
                marginBottom: '4px',
                display: 'block'
              }}>Email</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="login-input modern-input"
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
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full glass-button-primary" 
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
                boxShadow: '0 16px 64px rgba(0, 0, 0, 0.3), 0 0 20px rgba(102, 126, 234, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <Spinner size="sm" variant="default" className="mr-2" />
                  Sending...
                </span>
              ) : 'Send Reset Link'}
            </Button>

            <p className="text-center text-sm" style={{ color: '#94A3B8' }}>
              Remember your password?{' '}
              <AnimatedLink to="/login" animation="slide" className="ml-1" style={{
                color: '#667EEA',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}>
                Sign in
              </AnimatedLink>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}

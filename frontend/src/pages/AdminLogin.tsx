import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { useAuthStore } from '../store/authStore'
import { AlertCircle, Shield, Lock, Eye, EyeOff, Sparkles, Zap, Crown } from 'lucide-react'

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState('')
  const [hoveredButton, setHoveredButton] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/auth/login', formData)
      const { token, user } = response.data
      
      // Verify user is admin
      if (user.role !== 'admin') {
        setError('Access denied. Admin privileges required.')
        return
      }
      
      const userForStore = {
        ...user,
        id: user.id || user._id
      }
      
      setAuth(token, userForStore)
      navigate('/admin-dashboard')
    } catch (err: any) {
      console.error('Admin login error:', err)
      
      if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection.')
        return
      }
      
      if (err.code === 'ECONNREFUSED') {
        setError('Cannot connect to server. Please try again later.')
        return
      }
      
      const errorMessage = err.response?.data?.message || err.message || 'Login failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      position: 'relative'
    }}>
      
      {/* Enhanced Security-themed background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-30" style={{
          background: 'linear-gradient(135deg, #dc2626, #991b1b)',
          filter: 'blur(40px)',
          animation: 'pulse 4s ease-in-out infinite'
        }}></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full opacity-30" style={{
          background: 'linear-gradient(135deg, #dc2626, #7f1d1d)',
          filter: 'blur(50px)',
          animation: 'pulse 4s ease-in-out infinite 2s'
        }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-15" style={{
          background: 'radial-gradient(circle, #dc2626 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'pulse 6s ease-in-out infinite'
        }}></div>
        
        {/* Floating sparkles */}
        <div className="absolute top-1/4 left-1/4" style={{ animation: 'float 6s ease-in-out infinite' }}>
          <Sparkles className="w-8 h-8 text-red-400 opacity-60" />
        </div>
        <div className="absolute top-3/4 right-1/4" style={{ animation: 'float 8s ease-in-out infinite 2s' }}>
          <Zap className="w-6 h-6 text-red-300 opacity-50" />
        </div>
        <div className="absolute bottom-1/4 left-1/3" style={{ animation: 'float 7s ease-in-out infinite 1s' }}>
          <Crown className="w-7 h-7 text-red-400 opacity-40" />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Admin Login Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 relative" style={{
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.8), rgba(153, 27, 27, 0.6))',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 40px rgba(220, 38, 38, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            WebkitBackdropFilter: 'blur(20px)',
            animation: 'pulse 3s ease-in-out infinite',
            transform: 'scale(1)',
            transition: 'all 0.3s ease'
          }}>
            <Shield className="w-10 h-10 text-white" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-400">Secure administrator access</p>
        </div>

        <Card className="w-full transform transition-all duration-500 hover:scale-105" style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(30px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '24px',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          WebkitBackdropFilter: 'blur(30px) saturate(180%)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Animated border effect */}
          <div className="absolute inset-0 rounded-[24px] opacity-50" style={{
            background: 'linear-gradient(45deg, transparent, rgba(220, 38, 38, 0.3), transparent)',
            animation: 'sparkle 3s linear infinite',
            backgroundSize: '200% 200%'
          }}></div>
          <CardHeader className="space-y-1 relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
            </div>
            <CardTitle className="text-2xl font-semibold text-white text-center" style={{
              textShadow: '0 2px 10px rgba(220, 38, 38, 0.5)',
              letterSpacing: '0.5px'
            }}>
              Administrator Login
            </CardTitle>
            <div className="flex items-center justify-center mt-2">
              <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
            </div>
            <CardDescription className="text-gray-400 text-center mt-3" style={{
              fontSize: '0.9rem',
              opacity: 0.8
            }}>
              Enter your admin credentials to access the control panel
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 relative z-10">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg border transform transition-all duration-300 animate-pulse" style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f87171',
                WebkitBackdropFilter: 'blur(15px)',
                boxShadow: '0 8px 32px rgba(220, 38, 38, 0.2)'
              }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Admin Email
                </label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused('')}
                  required
                  className="w-full transform transition-all duration-300"
                  style={{
                    background: isFocused === 'email' 
                      ? 'rgba(255, 255, 255, 0.12)' 
                      : 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(15px)',
                    border: isFocused === 'email'
                      ? '2px solid rgba(220, 38, 38, 0.5)'
                      : '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#f8fafc',
                    padding: '14px 18px',
                    borderRadius: '14px',
                    transition: 'all 0.3s ease',
                    WebkitBackdropFilter: 'blur(15px)',
                    boxShadow: isFocused === 'email'
                      ? '0 8px 32px rgba(220, 38, 38, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                      : '0 4px 16px rgba(0, 0, 0, 0.1)',
                    transform: isFocused === 'email' ? 'translateY(-2px)' : 'translateY(0)'
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your admin password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    onFocus={() => setIsFocused('password')}
                    onBlur={() => setIsFocused('')}
                    required
                    className="w-full pr-12 transform transition-all duration-300"
                    style={{
                      background: isFocused === 'password' 
                        ? 'rgba(255, 255, 255, 0.12)' 
                        : 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(15px)',
                      border: isFocused === 'password'
                        ? '2px solid rgba(220, 38, 38, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#f8fafc',
                      padding: '14px 18px',
                      borderRadius: '14px',
                      transition: 'all 0.3s ease',
                      WebkitBackdropFilter: 'blur(15px)',
                      boxShadow: isFocused === 'password'
                        ? '0 8px 32px rgba(220, 38, 38, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        : '0 4px 16px rgba(0, 0, 0, 0.1)',
                      transform: isFocused === 'password' ? 'translateY(-2px)' : 'translateY(0)'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-400 transition-all duration-300 hover:scale-110"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '6px',
                      cursor: 'pointer',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-4 font-semibold rounded-xl transition-all duration-500 transform hover:scale-105 relative overflow-hidden group"
                disabled={loading}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                style={{
                  background: loading 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : hoveredButton
                    ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.9), rgba(153, 27, 27, 0.9))'
                    : 'linear-gradient(135deg, rgba(220, 38, 38, 0.8), rgba(153, 27, 27, 0.8))',
                  backdropFilter: loading ? 'blur(15px)' : 'none',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  boxShadow: loading 
                    ? 'none' 
                    : hoveredButton
                    ? '0 15px 40px rgba(220, 38, 38, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2)'
                    : '0 12px 32px rgba(220, 38, 38, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  transform: loading ? 'none' : hoveredButton ? 'translateY(-2px)' : 'translateY(0)',
                  opacity: loading ? 0.7 : 1,
                  WebkitBackdropFilter: loading ? 'blur(15px)' : 'none',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Button shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)',
                  transform: 'translateX(-100%)',
                  animation: hoveredButton ? 'shimmer 2s infinite' : 'none'
                }}></div>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  'Access Admin Panel'
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 rounded-lg transform transition-all duration-300 hover:scale-102" style={{
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
            }}>
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Shield className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                </div>
                <div className="text-xs text-gray-400">
                  <p className="font-semibold text-red-400 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Security Notice
                  </p>
                  <p>This portal is restricted to authorized administrators only. All access attempts are logged and monitored.</p>
                </div>
              </div>
            </div>

            {/* Back to regular login */}
            <div className="text-center pt-4 border-t border-gray-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
              </div>
              <p className="text-sm text-gray-400 relative">
                Not an admin?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="text-red-400 hover:text-red-300 font-medium transition-all duration-300 hover:scale-105 inline-flex items-center gap-1"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Sparkles className="w-3 h-3" />
                  Return to login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>
          </div>
          <p className="text-xs text-gray-500 relative">
            © 2026 AI Tutor Admin Panel. All rights reserved.
          </p>
          <div className="mt-2 flex items-center justify-center gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">System Online</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-red-400" />
              <span className="text-xs text-gray-500">Secured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

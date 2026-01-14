import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useState, useEffect } from 'react'
import '../styles/dashboard-theme.css'

export default function WelcomeTopBar() {
  const { token, user } = useAuthStore()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignup = () => {
    navigate('/register')
  }

  const handleDashboard = () => {
    if (user?.role === 'student') {
      navigate('/student-dashboard')
    } else if (user?.role === 'teacher') {
      navigate('/TeacherDashboard')
    } else if (user?.role === 'admin') {
      navigate('/admin-dashboard')
    } else {
      navigate('/student-dashboard')
    }
  }

  return (
    <header className={`welcome-topbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="welcome-topbar-content">
        {/* Logo */}
        <div className="welcome-topbar-logo">
          <Link to="/" className="logo-link">
            <div className="logo-icon">
              <svg width="32" height="32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
            </div>
            <span className="logo-text">AI Tutor</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="welcome-topbar-nav">
          <Link to="/features" className="nav-link">Features</Link>
          <Link to="/courses" className="nav-link">Courses</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/pricing" className="nav-link">Pricing</Link>
        </nav>

        {/* Action Buttons */}
        <div className="welcome-topbar-actions">
          {token ? (
            <div className="user-menu">
              <button className="user-avatar" onClick={handleDashboard}>
                <span className="avatar-text">
                  {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </button>
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item">Profile</Link>
                <Link to="/settings" className="dropdown-item">Settings</Link>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item logout-btn"
                  onClick={() => {
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    window.location.reload()
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn-glass" onClick={handleLogin}>
                Login
              </button>
              <button className="btn-primary" onClick={handleSignup}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

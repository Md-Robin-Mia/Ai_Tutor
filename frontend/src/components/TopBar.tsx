import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { useAuthStore } from '../store/authStore'
import { Menu, X, Home, BookOpen, Brain, BarChart3, Users, GraduationCap, LogOut, User, Settings, Flame } from 'lucide-react'

interface TopBarProps {
  showNavigation?: boolean
  showUserActions?: boolean
  showFeatures?: boolean
}

export default function TopBar({ showNavigation = true, showUserActions = true, showFeatures = true }: TopBarProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { token, user, logout } = useAuthStore()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node) && 
          profileButtonRef.current && !profileButtonRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show dropdown on hover
  const handleProfileMouseEnter = () => {
    setShowProfileDropdown(true)
  }

  const handleProfileMouseLeave = () => {
    setShowProfileDropdown(false)
  }

  const isActiveRoute = (path: string) => {
    return location.pathname === path
  }

  const handleProtectedFeature = (e: React.MouseEvent, path: string) => {
    if (token) {
      navigate(path)
    } else {
      localStorage.setItem('intendedDestination', path)
      navigate('/login')
    }
  }

  const navigationItems = [
    { path: '/student-dashboard', label: 'Dashboard', icon: Home },
    { path: '/daily-challenge', label: 'Challenges', icon: Flame },
    { path: '/youtube-summarizer', label: 'YouTube', icon: BookOpen },
    { path: '/ai-tutor-chat', label: 'Tutor', icon: Brain },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/groups', label: 'Groups', icon: Users },
    { path: '/courses', label: 'Courses', icon: GraduationCap },
  ]

  return (
    <>
      <header className={`modern-topbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'modern-topbar-scrolled' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              {token ? (
                <Link 
                  to="/student-dashboard"
                  className="modern-logo flex items-center space-x-3 group"
                >
                  <div className="modern-logo-icon">
                    <GraduationCap className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <span className="modern-logo-text">AI Tutor</span>
                </Link>
              ) : (
                <Link 
                  to="/"
                  className="modern-logo flex items-center space-x-3 group"
                >
                  <div className="modern-logo-icon">
                    <GraduationCap className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <span className="modern-logo-text">AI Tutor</span>
                </Link>
              )}
            </div>

            {/* Desktop Navigation */}
            {showNavigation && token && (
              <nav className="hidden md:flex items-center space-x-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`modern-nav-item ${isActiveRoute(item.path) ? 'modern-nav-active' : ''}`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            )}

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {token ? (
                <div className="flex items-center space-x-3">
                  {/* User Profile */}
                  <div 
                    className="relative" 
                    ref={profileDropdownRef}
                    onMouseEnter={handleProfileMouseEnter}
                    onMouseLeave={handleProfileMouseLeave}
                    style={{ zIndex: 40 }}
                  >
                    <button
                      ref={profileButtonRef}
                      onClick={() => {
                        if (!showProfileDropdown) {
                          navigate('/profile')
                          setShowProfileDropdown(false)
                        } else {
                          setShowProfileDropdown(false)
                        }
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault()
                        setShowProfileDropdown(!showProfileDropdown)
                      }}
                      className="modern-user-button"
                    >
                      <div className="modern-avatar">
                        <span className="modern-avatar-text">
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div className="modern-user-info hidden sm:block">
                        <div className="modern-user-name">{user?.name || 'User'}</div>
                      </div>
                    </button>

                    {/* Profile Dropdown */}
                    {showProfileDropdown && (
                      <div className="modern-dropdown">
                        <div className="modern-dropdown-header">
                          <div className="modern-dropdown-avatar">
                            <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                          </div>
                          <div>
                            <div className="modern-dropdown-name">{user?.name || 'User'}</div>
                          </div>
                        </div>
                        <div className="modern-dropdown-divider" />
                        <div className="modern-dropdown-content">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate('/profile')
                              setShowProfileDropdown(false)
                            }}
                            className="modern-dropdown-item"
                          >
                            <User className="w-4 h-4" />
                            <span>Profile</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate('/settings')
                              setShowProfileDropdown(false)
                            }}
                            className="modern-dropdown-item"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              logout()
                              navigate('/')
                              setShowProfileDropdown(false)
                            }}
                            className="modern-dropdown-logout"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Direct Logout Button */}
                  <button
                    onClick={() => {
                      logout()
                      navigate('/')
                    }}
                    className="modern-logout-button"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link to="/login">
                  <Button className="modern-signin-button">
                    Sign In
                  </Button>
                </Link>
              )}

              {/* Mobile menu button */}
              {showNavigation && (
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="modern-mobile-menu-button md:hidden"
                >
                  {showMobileMenu ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div className="modern-mobile-overlay">
          <div className="modern-mobile-menu">
            <div className="modern-mobile-header">
              <div className="modern-logo flex items-center space-x-3">
                <div className="modern-logo-icon">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="modern-logo-text">AI Tutor</span>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="modern-mobile-close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="modern-mobile-nav">
              {token && navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`modern-mobile-nav-item ${isActiveRoute(item.path) ? 'modern-mobile-nav-active' : ''}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {token && (
              <div className="modern-mobile-user">
                <div className="modern-mobile-avatar">
                  <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
                <div className="modern-mobile-user-info">
                  <div className="modern-mobile-user-name">{user?.name || 'User'}</div>
                </div>
              </div>
            )}

            <div className="modern-mobile-actions">
              {token ? (
                <button
                  onClick={() => {
                    logout()
                    navigate('/')
                    setShowMobileMenu(false)
                  }}
                  className="modern-mobile-logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link to="/login" onClick={() => setShowMobileMenu(false)} className="block">
                  <Button className="modern-mobile-signin">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    console.log('AuthCallback component mounted')
    console.log('Current URL:', window.location.href)
    
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const userStr = urlParams.get('user')

    console.log('AuthCallback - Full URL:', window.location.href)
    console.log('AuthCallback - Token:', token)
    console.log('AuthCallback - UserStr:', userStr)

    if (token && userStr) {
      try {
        console.log('Parsing user data...')
        const user = JSON.parse(decodeURIComponent(userStr))
        console.log('AuthCallback - Parsed User:', user)
        
        // Check auth store before setting
        const { token: currentToken, user: currentUser } = useAuthStore.getState()
        console.log('AuthCallback - Before setAuth - Token:', currentToken, 'User:', currentUser)
        
        console.log('Setting auth in store...')
        setAuth(token, user)
        
        // Check auth store after setting
        const { token: newToken, user: newUser } = useAuthStore.getState()
        console.log('AuthCallback - After setAuth - Token:', newToken, 'User:', newUser)
        
        // Navigate to dashboard based on role
        console.log('Navigating based on role:', user.role)
        switch (user.role) {
          case 'student':
            console.log('Navigating to student dashboard')
            navigate('/student-dashboard')
            break
          case 'teacher':
            console.log('Navigating to teacher dashboard')
            navigate('/teacher-dashboard')
            break
          case 'parent':
            console.log('Navigating to parent dashboard')
            navigate('/parent-dashboard')
            break
          default:
            console.log('Navigating to learn page (default)')
            navigate('/learn')
        }
      } catch (error) {
        console.error('Failed to parse user data:', error)
        navigate('/login')
      }
    } else {
      console.log('No token or user found, redirecting to login')
      navigate('/login')
    }
  }, [navigate, setAuth])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}

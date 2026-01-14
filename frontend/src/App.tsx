import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useAuthStore } from './store/authStore'
import TopBar from './components/TopBar'
import ModernFooter from './components/ModernFooter'
import Login from './pages/Login'
import AdminLogin from './pages/AdminLogin'
import SignInPage from './pages/SignInPage'
import RegisterChoice from './pages/RegisterChoice'
import StudentRegister from './pages/StudentRegister'
import TeacherRegister from './pages/TeacherRegister'
import ForgotPassword from './pages/ForgotPassword'
import WelcomePage from './pages/WelcomePage'
import AITutorChat from './pages/AITutorChat'
import AuthCallback from './pages/AuthCallback'
import StudentDashboard from './pages/StudentDashboard'
import TeacherDashboard from './pages/TeacherDashboard'
import AdminDashboard from './pages/AdminDashboard'
import CourseViewer from './pages/CourseViewer'
import LeaderboardPage from './pages/LeaderboardPage'
import StudyGroupsPage from './pages/StudyGroupsPage'
import CoursePage from './pages/CoursePage'
import RevisionPage from './pages/RevisionPage'
import AIRevisionPage from './pages/AIRevisionPage'
import YoutubeSummarizer from './pages/YoutubeSummarizer'
import AnalyticsPage from './pages/AnalyticsPage'
import ProfilePage from './pages/ProfilePage'
import DailyChallengePage from './pages/DailyChallengePage'

const queryClient = new QueryClient()

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore()
  console.log('PrivateRoute - Token:', token)
  console.log('PrivateRoute - Current path:', window.location.pathname)
  
  if (token) {
    return <>{children}</>
  } else {
    console.log('Redirecting to login...')
    return <Navigate to="/login" />
  }
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore()
  console.log('=== AdminRoute Debug ===')
  console.log('AdminRoute - Token:', token)
  console.log('AdminRoute - User:', user)
  console.log('AdminRoute - User Role:', user?.role)
  console.log('AdminRoute - User object:', JSON.stringify(user, null, 2))
  
  if (!token) {
    console.log('No token, redirecting to login...')
    return <Navigate to="/login" />
  }
  
  if (!user) {
    console.log('No user data, redirecting to login...')
    return <Navigate to="/login" />
  }
  
  if (user.role !== 'admin') {
    console.log('User is not admin, redirecting to appropriate dashboard...')
    console.log('Expected role: admin, Got role:', user.role)
    // Show alert for non-admin users trying to access admin area
    alert(`Access Denied: Admin area is restricted to administrators only. Your role is: ${user.role}. Redirecting to your dashboard...`)
    
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'student':
        return <Navigate to="/student-dashboard" />
      case 'teacher':
        return <Navigate to="/TeacherDashboard" />
      default:
        return <Navigate to="/student-dashboard" />
    }
  }
  
  console.log('Admin access granted!')
  return <>{children}</>
}

function TeacherRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore()
  console.log('=== TeacherRoute Debug ===')
  console.log('Token exists:', !!token)
  console.log('User exists:', !!user)
  console.log('User data:', user)
  console.log('User role:', user?.role)
  console.log('Role check (user.role !== "teacher"):', user?.role !== 'teacher')
  console.log('========================')
  
  if (!token) {
    console.log('No token, redirecting to login...')
    return <Navigate to="/login" />
  }
  
  if (!user) {
    console.log('No user data, redirecting to login...')
    return <Navigate to="/login" />
  }
  
  if (user.role !== 'teacher') {
    console.log('User is not teacher, redirecting to appropriate dashboard...')
    // Show alert for non-teacher users trying to access teacher area
    alert(`Access Denied: Teacher area is restricted to teachers only. Your role is: ${user.role}. Redirecting to your dashboard...`)
    
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'student':
        return <Navigate to="/student-dashboard" />
      case 'admin':
        return <Navigate to="/admin-dashboard" />
      default:
        return <Navigate to="/student-dashboard" />
    }
  }
  
  return <>{children}</>
}

function StudentRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuthStore()
  console.log('StudentRoute - Token:', token)
  console.log('StudentRoute - User:', user)
  console.log('StudentRoute - User Role:', user?.role)
  
  if (!token) {
    console.log('No token, redirecting to login...')
    return <Navigate to="/login" />
  }
  
  if (!user) {
    console.log('No user data, redirecting to login...')
    return <Navigate to="/login" />
  }
  
  if (user.role !== 'student') {
    console.log('User is not student, redirecting to appropriate dashboard...')
    // Show alert for non-student users trying to access student area
    alert(`Access Denied: Student area is restricted to students only. Redirecting to your dashboard...`)
    
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'teacher':
        return <Navigate to="/TeacherDashboard" />
      case 'admin':
        return <Navigate to="/admin-dashboard" />
      default:
        return <Navigate to="/student-dashboard" />
    }
  }
  
  return <>{children}</>
}

function AppContent() {
  const { token } = useAuthStore()
  const location = useLocation()
  
  // Check if current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-dashboard')
  
  // Check if current route is a teacher route
  const isTeacherRoute = location.pathname.startsWith('/teacher') || location.pathname.startsWith('/Teacher')
  
  // Check if current route is the welcome page (only show footer on welcome page)
  const shouldShowFooter = location.pathname === '/'
  
  return (
    <div className="min-h-screen flex flex-col">
      {token && !isAdminRoute && !isTeacherRoute && <TopBar />}
      <div className="flex-grow">
        <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/ai-tutor-chat" element={<PrivateRoute><AITutorChat /></PrivateRoute>} />
        <Route path="/features/ai-tutor" element={<PrivateRoute><AITutorChat /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/register" element={<RegisterChoice />} />
        <Route path="/student-register" element={<StudentRegister />} />
        <Route path="/teacher-register" element={<TeacherRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        <Route path="/teacher-debug" element={<TeacherDashboard />} />
        <Route path="/student-dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="/TeacherDashboard" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        
        <Route path="/student" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="/teacher" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
        <Route path="/Teacher" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
        
        <Route path="/course/:courseId" element={<PrivateRoute><CourseViewer /></PrivateRoute>} />
        <Route path="/courses/:courseId" element={<PrivateRoute><CourseViewer /></PrivateRoute>} />
        
                <Route path="/leaderboard" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
        <Route path="/groups" element={<PrivateRoute><StudyGroupsPage /></PrivateRoute>} />
        <Route path="/courses" element={<PrivateRoute><CoursePage /></PrivateRoute>} />
        <Route path="/revision" element={<PrivateRoute><RevisionPage /></PrivateRoute>} />
        <Route path="/ai-revision" element={<PrivateRoute><AIRevisionPage /></PrivateRoute>} />
        <Route path="/youtube-summarizer" element={<PrivateRoute><YoutubeSummarizer /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/daily-challenge" element={<PrivateRoute><DailyChallengePage /></PrivateRoute>} />
        <Route path="/features/youtube-summarizer" element={<PrivateRoute><YoutubeSummarizer /></PrivateRoute>} />
        <Route path="/features/analytics" element={<PrivateRoute><AnalyticsPage /></PrivateRoute>} />
      </Routes>
      </div>
      
      {/* Modern Footer - Show only on welcome page */}
      {shouldShowFooter && (
        <div className="relative z-50">
          <ModernFooter />
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  )
}

export default App

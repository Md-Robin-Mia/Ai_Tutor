import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Calendar,
  Target,
  BarChart3,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertTriangle,
  LogOut,
  Settings,
  Bell,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Star,
  Eye,
  EyeOff,
  FolderOpen,
  Wallet,
  Brain
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import CreateCourseModal from '../components/CreateCourseModal'
import CategoryManager from '../components/CategoryManager'
import TeacherEarningsDashboard from '../components/TeacherEarningsDashboard'
import EditCourseModal from '../components/EditCourseModal'
import CourseViewModal from '../components/CourseViewModal'
import { io, Socket } from 'socket.io-client'

interface StudentPerformance {
  name: string
  progress: number
  accuracy: number
  weakAreas: string[]
  lastActive: string
  currentActivity: string
  isOnline: boolean
  timeSpentToday: number
  quizAttemptsToday: number
}

interface RealTimeStudentActivity {
  studentId: string
  name: string
  activity: string
  timestamp: string
  type: 'login' | 'logout' | 'quiz_start' | 'quiz_complete' | 'lesson_start' | 'lesson_complete' | 'study_session'
  data?: {
    quizTitle?: string
    score?: number
    totalQuestions?: number
    lessonTitle?: string
    progress?: number
    minutes?: number
    duration?: string
    [key: string]: any
  }
}

interface Assignment {
  title: string
  dueDate: string
  submissions: number
  pendingSubmissions: number
}

interface Course {
  _id: string
  title: string
  description: string
  category: { name: string }
  level: string
  price: number
  isFree: boolean
  published: boolean
  approvedByAdmin: boolean
  enrolledCount: number
  rating: { average: number; count: number }
  totalLessons: number
  duration: number
  thumbnail: string
  createdAt: string
}

interface TeacherDashboardData {
  classOverview: {
    totalStudents: number
    averagePerformance: number
    activeLearnersToday: number
    onlineNow: number
    totalStudyTimeToday: number
    quizzesCompletedToday: number
  }
  studentPerformance: StudentPerformance[]
  assignments: Assignment[]
  analytics: {
    topicWisePerformance: Record<string, number>
    quizScoreDistribution: Record<string, number>
  }
  realTimeActivity: RealTimeStudentActivity[]
}

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { token, logoutWithRedirect } = useAuthStore()
  const [dashboardData, setDashboardData] = useState<TeacherDashboardData | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [viewingCourseId, setViewingCourseId] = useState<string | null>(null)
  const [wsConnection, setWsConnection] = useState<Socket | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false)
  const [selectedCourseForQuiz, setSelectedCourseForQuiz] = useState<Course | null>(null)
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    description: '',
    difficulty: 'Easy',
    points: 100,
    timeLimit: 15,
    category: 'Programming',
    courseId: '',
    questions: [] as any[]
  })

  // Helper function to get relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = now.getTime() - time.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return time.toLocaleDateString()
  }

  console.log('TeacherDashboard render - loading:', loading, 'dashboardData:', !!dashboardData)

  const handleLogout = () => {
    if (wsConnection) {
      wsConnection.close()
    }
    logoutWithRedirect(navigate)
  }

  // Initialize Socket.IO connection for real-time updates
  const initializeSocket = () => {
    try {
      console.log('Initializing socket connection...')
      const socket = io('http://localhost:3004', {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      })
      
      socket.on('connect', () => {
        console.log('Socket.IO connected for real-time updates')
        setWsConnection(socket)
      })
      
      socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error)
        console.log('Socket connection details:', {
          url: 'http://localhost:3004',
          hasToken: !!token,
          tokenLength: token?.length || 0
        })
      })
      
      socket.on('real_time_update', (data) => {
        console.log('Real-time update received:', data)
        
        switch (data.type) {
          case 'student_activity':
            handleStudentActivity(data.payload)
            break
          case 'performance_update':
            handlePerformanceUpdate(data.payload)
            break
          case 'assignment_submission':
            handleAssignmentSubmission(data.payload)
            break
          case 'class_stats_update':
            handleClassStatsUpdate(data.payload)
            break
          case 'initial_student_data':
            handleInitialStudentData(data.payload)
            break
          case 'student_enrollment':
            handleStudentEnrollment(data.payload)
            break
        }
        
        setLastUpdate(new Date())
      })
      
      socket.on('disconnect', () => {
        console.log('Socket.IO disconnected')
        setWsConnection(null)
        // Attempt to reconnect after 5 seconds
        setTimeout(initializeSocket, 5000)
      })
      
      socket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error)
      })
      
    } catch (error) {
      console.error('Failed to initialize Socket.IO:', error)
    }
  }

  const handleStudentActivity = (activity: any) => {
    setDashboardData(prev => {
      if (!prev) return prev
      
      // Convert payload to expected format
      const formattedActivity: RealTimeStudentActivity = {
        studentId: activity.studentId,
        name: activity.name,
        activity: activity.activity,
        timestamp: activity.timestamp,
        type: activity.activityType
      }
      
      // Add new activity to the beginning of the array
      const updatedActivity = [formattedActivity, ...prev.realTimeActivity.slice(0, 9)]
      
      // Update student performance if needed, or add new student
      let updatedStudents = prev.studentPerformance.map(student => {
        if (student.name === activity.name) {
          return {
            ...student,
            lastActive: activity.timestamp,
            currentActivity: activity.activity,
            isOnline: activity.activityType !== 'logout',
            // Update additional data if provided
            ...(activity.data && {
              timeSpentToday: activity.data.minutes ? student.timeSpentToday + activity.data.minutes : student.timeSpentToday,
              quizAttemptsToday: activity.activityType === 'quiz_start' ? student.quizAttemptsToday + 1 : student.quizAttemptsToday
            })
          }
        }
        return student
      })
      
      // Add new student if not already in the list
      const studentExists = updatedStudents.some(student => student.name === activity.name)
      if (!studentExists && activity.activityType !== 'logout') {
        const newStudent: StudentPerformance = {
          name: activity.name,
          progress: 0,
          accuracy: 0,
          weakAreas: [],
          lastActive: activity.timestamp,
          currentActivity: activity.activity,
          isOnline: activity.activityType !== 'logout',
          timeSpentToday: 0,
          quizAttemptsToday: 0
        }
        updatedStudents = [newStudent, ...updatedStudents]
      }
      
      // Update class overview
      const updatedClassOverview = {
        ...prev.classOverview,
        onlineNow: updatedStudents.filter(s => s.isOnline).length,
        totalStudents: Math.max(prev.classOverview.totalStudents, updatedStudents.length)
      }
      
      return {
        ...prev,
        classOverview: updatedClassOverview,
        realTimeActivity: updatedActivity,
        studentPerformance: updatedStudents
      }
    })
  }

  const handlePerformanceUpdate = (update: { studentName: string; progress?: number; accuracy?: number }) => {
    setDashboardData(prev => {
      if (!prev) return prev
      
      let updatedStudents = prev.studentPerformance.map(student => {
        if (student.name === update.studentName) {
          return {
            ...student,
            ...(update.progress !== undefined && { progress: update.progress }),
            ...(update.accuracy !== undefined && { accuracy: update.accuracy })
          }
        }
        return student
      })
      
      // Add new student if not already in the list
      const studentExists = updatedStudents.some(student => student.name === update.studentName)
      if (!studentExists) {
        const newStudent: StudentPerformance = {
          name: update.studentName,
          progress: update.progress || 0,
          accuracy: update.accuracy || 0,
          weakAreas: [],
          lastActive: new Date().toISOString(),
          currentActivity: 'Performance updated',
          isOnline: true,
          timeSpentToday: 0,
          quizAttemptsToday: 0
        }
        updatedStudents = [newStudent, ...updatedStudents]
      }
      
      // Update class overview
      const updatedClassOverview = {
        ...prev.classOverview,
        totalStudents: Math.max(prev.classOverview.totalStudents, updatedStudents.length)
      }
      
      return {
        ...prev,
        classOverview: updatedClassOverview,
        studentPerformance: updatedStudents
      }
    })
  }

  const handleInitialStudentData = (data: { activeStudents: any[], onlineCount: number }) => {
    setDashboardData(prev => {
      if (!prev) return prev
      
      // Update online count
      const updatedClassOverview = {
        ...prev.classOverview,
        onlineNow: data.onlineCount
      }
      
      // Add active students to real-time activity
      const newActivities = data.activeStudents.map(student => ({
        studentId: student.studentId,
        name: student.name,
        activity: student.activity,
        timestamp: student.timestamp,
        type: student.activityType
      }))
      
      // Add new students to performance list if they don't exist
      let updatedStudents = [...prev.studentPerformance]
      data.activeStudents.forEach(activeStudent => {
        const studentExists = updatedStudents.some(student => student.name === activeStudent.name)
        if (!studentExists) {
          const newStudent: StudentPerformance = {
            name: activeStudent.name,
            progress: 0,
            accuracy: 0,
            weakAreas: [],
            lastActive: activeStudent.timestamp,
            currentActivity: activeStudent.activity,
            isOnline: true,
            timeSpentToday: 0,
            quizAttemptsToday: 0
          }
          updatedStudents = [newStudent, ...updatedStudents]
        } else {
          // Update existing student's online status
          updatedStudents = updatedStudents.map(student => 
            student.name === activeStudent.name 
              ? { ...student, isOnline: true, currentActivity: activeStudent.activity, lastActive: activeStudent.timestamp }
              : student
          )
        }
      })
      
      // Update total student count
      updatedClassOverview.totalStudents = Math.max(updatedClassOverview.totalStudents, updatedStudents.length)
      
      return {
        ...prev,
        classOverview: updatedClassOverview,
        realTimeActivity: [...newActivities, ...prev.realTimeActivity.slice(0, 10 - newActivities.length)],
        studentPerformance: updatedStudents
      }
    })
  }

  const handleAssignmentSubmission = (submission: { assignmentTitle: string; studentName: string }) => {
    setDashboardData(prev => {
      if (!prev) return prev
      
      const updatedAssignments = prev.assignments.map(assignment => {
        if (assignment.title === submission.assignmentTitle) {
          return {
            ...assignment,
            submissions: assignment.submissions + 1,
            pendingSubmissions: Math.max(0, assignment.pendingSubmissions - 1)
          }
        }
        return assignment
      })
      
      return {
        ...prev,
        assignments: updatedAssignments
      }
    })
  }

  const handleStudentEnrollment = (enrollment: {
    studentId: string;
    studentName: string;
    courseId: string;
    courseTitle: string;
    teacherId: string;
    enrolledAt: string;
  }) => {
    setDashboardData(prev => {
      if (!prev) return prev
      
      // Update total student count
      const updatedClassOverview = {
        ...prev.classOverview,
        totalStudents: prev.classOverview.totalStudents + 1
      }
      
      // Add new student to performance list if not already present
      const studentExists = prev.studentPerformance.some(student => student.name === enrollment.studentName)
      let updatedStudents = prev.studentPerformance
      
      if (!studentExists) {
        const newStudent: StudentPerformance = {
          name: enrollment.studentName,
          progress: 0,
          accuracy: 0,
          weakAreas: [],
          lastActive: enrollment.enrolledAt,
          currentActivity: `Enrolled in ${enrollment.courseTitle}`,
          isOnline: true,
          timeSpentToday: 0,
          quizAttemptsToday: 0
        }
        updatedStudents = [newStudent, ...updatedStudents]
      }
      
      // Add enrollment activity to real-time feed
      const newActivity: RealTimeStudentActivity = {
        studentId: enrollment.studentId,
        name: enrollment.studentName,
        activity: `Enrolled in ${enrollment.courseTitle}`,
        timestamp: enrollment.enrolledAt,
        type: 'lesson_start',
        data: {
          courseTitle: enrollment.courseTitle,
          courseId: enrollment.courseId
        }
      }
      
      return {
        ...prev,
        classOverview: updatedClassOverview,
        studentPerformance: updatedStudents,
        realTimeActivity: [newActivity, ...prev.realTimeActivity.slice(0, 9)]
      }
    })
  }

  const handleClassStatsUpdate = (stats: { onlineNow: number; totalStudyTimeToday: number; quizzesCompletedToday: number }) => {
    setDashboardData(prev => {
      if (!prev) return prev
      
      return {
        ...prev,
        classOverview: {
          ...prev.classOverview,
          ...stats
        }
      }
    })
  }

  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...')
      const response = await api.get('/teacher/courses')
      console.log('Courses received:', response.data)
      console.log('Number of courses:', response.data.courses?.length || 0)
      setCourses(response.data.courses || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      console.error('Error response:', error.response?.data)
    }
  }

  const handleCourseCreated = (newCourse: Course) => {
    console.log('Course created successfully:', newCourse)
    setCourses(prev => [newCourse, ...prev])
  }

  const handleCreateCourseClick = () => {
    setShowCreateModal(true)
  }

  const handleViewCourse = (courseId: string) => {
    setViewingCourseId(courseId)
    setShowViewModal(true)
  }

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course)
    setShowEditModal(true)
  }

  // Quiz creation functions
  const addQuestion = () => {
    setNewQuiz(prev => ({
      ...prev,
      questions: [...prev.questions, {
        question: '',
        options: ['', '', '', ''],
        correct: ''
      }]
    }))
  }

  const updateQuestion = (index: number, field: string, value: any) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }))
  }

  const removeQuestion = (index: number) => {
    setNewQuiz(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const saveQuiz = () => {
    if (!newQuiz.title || !newQuiz.description || newQuiz.questions.length === 0 || !newQuiz.courseId) {
      alert('Please fill in all required fields, select a course, and add at least one question')
      return
    }

    // Here you would typically save to backend
    const quizData = {
      ...newQuiz,
      teacherId: token, // Current teacher ID
      teacherName: 'Current Teacher', // Would get from auth
      createdAt: new Date().toISOString()
    }

    console.log('Quiz created for course:', quizData)
    alert(`Quiz created successfully for course: ${selectedCourseForQuiz?.title}`)
    
    // Reset form
    setIsCreatingQuiz(false)
    setSelectedCourseForQuiz(null)
    setNewQuiz({
      title: '',
      description: '',
      difficulty: 'Easy',
      points: 100,
      timeLimit: 15,
      category: 'Programming',
      courseId: '',
      questions: []
    })
  }

  const startQuizCreation = (course: Course) => {
    setSelectedCourseForQuiz(course)
    setNewQuiz(prev => ({
      ...prev,
      courseId: course._id,
      category: course.category.name
    }))
    setIsCreatingQuiz(true)
  }

  const handleEditFromView = (course: Course) => {
    setShowViewModal(false)
    setSelectedCourse(course)
    setShowEditModal(true)
  }

  const handleCourseUpdated = (updatedCourse: Course) => {
    setCourses(prev => prev.map(course => 
      course._id === updatedCourse._id ? updatedCourse : course
    ))
    setShowEditModal(false)
    setSelectedCourse(null)
  }

  const handlePublishCourse = async (course: Course) => {
    try {
      console.log('Publishing course:', course._id)
      const token = localStorage.getItem('token')
      console.log('Token exists:', !!token)
      
      const response = await api.patch(`/teacher/courses/${course._id}/publish`, {
        published: true
      })
      
      console.log('Publish response:', response.status, response.data)
      
      if (response.status === 200) {
        const updatedCourse = response.data.course
        setCourses(prev => {
          const newCourses = [...prev]
          const courseIndex = newCourses.findIndex(c => c._id === course._id)
          if (courseIndex !== -1) {
            newCourses[courseIndex] = updatedCourse
          }
          return newCourses
        })
        alert('Course published successfully! It will be visible to students after admin approval.')
      }
    } catch (error: any) {
      console.error('Failed to publish course:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      alert(error.response?.data?.message || 'Failed to publish course. Please try again.')
    }
  }

  const handleUnpublishCourse = async (course: Course) => {
    try {
      console.log('Unpublishing course:', course._id)
      const token = localStorage.getItem('token')
      console.log('Token exists:', !!token)
      
      const response = await api.patch(`/teacher/courses/${course._id}/publish`, {
        published: false
      })
      
      console.log('Unpublish response:', response.status, response.data)
      
      if (response.status === 200) {
        const updatedCourse = response.data.course
        setCourses(prev => {
          const newCourses = [...prev]
          const courseIndex = newCourses.findIndex(c => c._id === course._id)
          if (courseIndex !== -1) {
            newCourses[courseIndex] = updatedCourse
          }
          return newCourses
        })
        alert('Course unpublished successfully. It is no longer visible to students.')
      }
    } catch (error: any) {
      console.error('Failed to unpublish course:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      alert(error.response?.data?.message || 'Failed to unpublish course. Please try again.')
    }
  }

  useEffect(() => {
    console.log('TeacherDashboard useEffect - starting data fetch')
    const fetchData = async () => {
      try {
        console.log('Fetching dashboard data...')
        const response = await api.get('/teacher/dashboard')
        console.log('Dashboard data received:', response.data)
        setDashboardData(response.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        // Initialize with demo data for better UX
        console.log('Setting demo data for better UX')
        setDashboardData({
          classOverview: {
            totalStudents: 0,
            averagePerformance: 0,
            activeLearnersToday: 0,
            onlineNow: 0,
            totalStudyTimeToday: 0,
            quizzesCompletedToday: 0
          },
          studentPerformance: [],
          assignments: [
            {
              title: "Welcome Assignment",
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
              submissions: 0,
              pendingSubmissions: 0
            }
          ],
          analytics: {
            topicWisePerformance: {
              "Mathematics": 0,
              "Science": 0,
              "English": 0,
              "History": 0
            },
            quizScoreDistribution: {
              '90-100': 0,
              '80-89': 0,
              '70-79': 0,
              '60-69': 0,
              'below-70': 0
            }
          },
          realTimeActivity: []
        })
      } finally {
        setLoading(false)
      }
      
      // Fetch courses
      await fetchCourses()
    }

    fetchData()
    
    // Initialize Socket.IO for real-time updates
    initializeSocket()

    // Cleanup function
    return () => {
      if (wsConnection) {
        wsConnection.close()
      }
    }
  }, [])

  // Fetch assignment data separately
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await api.get('/assignments/teacher')
        console.log('Assignment data received:', response.data)
        if (dashboardData) {
          setDashboardData(prev => prev ? {
            ...prev,
            assignments: response.data.assignments || []
          } : null)
        }
      } catch (error) {
        console.error('Failed to fetch assignments:', error)
      }
    }

    if (dashboardData) {
      fetchAssignments()
    }
  }, [dashboardData])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-white">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg">Failed to load dashboard data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900">
      {/* Teacher Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
                <p className="text-green-300 text-sm">Manage your classes and students</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-lg">
                <span className="text-green-400 text-sm font-medium">Active Class</span>
              </div>
              <div className="px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                <span className="text-blue-400 text-sm font-medium">Teacher Access</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Total Students Enrolled</p>
                <p className="text-3xl font-bold text-white mt-2">{dashboardData.classOverview.totalStudents}</p>
                <p className="text-green-400 text-xs mt-1">Students in your courses</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Online Now</p>
                <p className="text-3xl font-bold text-white mt-2">{dashboardData.classOverview.onlineNow}</p>
                <p className="text-green-400 text-xs mt-1">Currently active</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Average Performance</p>
                <p className="text-3xl font-bold text-white mt-2">{dashboardData.classOverview.averagePerformance}%</p>
                <p className="text-green-400 text-xs mt-1">Class average score</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Study Time Today</p>
                <p className="text-3xl font-bold text-white mt-2">{Math.round(dashboardData.classOverview.totalStudyTimeToday / 60)}h</p>
                <p className="text-green-400 text-xs mt-1">{dashboardData.classOverview.totalStudyTimeToday} minutes total</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">Quizzes Today</p>
                <p className="text-3xl font-bold text-white mt-2">{dashboardData.classOverview.quizzesCompletedToday}</p>
                <p className="text-green-400 text-xs mt-1">Daily quizzes completed</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="space-y-6">
          <div className="flex justify-center mb-6">
            <TabsList className="bg-white/10 backdrop-blur-xl border border-white/20 p-1 rounded-x2 inline-flex max-w-3xl">
              <TabsTrigger value="students" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-green-300 rounded-lg px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                Students
              </TabsTrigger>
              <TabsTrigger value="courses" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-green-300 rounded-lg px-4 py-2">
                <BookOpen className="w-4 h-4 mr-2" />
                Courses
              </TabsTrigger>
              <TabsTrigger value="categories" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-green-300 rounded-lg px-4 py-2">
                <FolderOpen className="w-4 h-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="assignments" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-green-300 rounded-lg px-4 py-2">
                <Calendar className="w-4 h-4 mr-2" />
                Assignments
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-green-300 rounded-lg px-4 py-2">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="earnings" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-green-300 rounded-lg px-4 py-2">
                <Wallet className="w-4 h-4 mr-2" />
                Earnings
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            {/* Student Performance Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-400" />
                      Student Performance
                    </h3>
                    <p className="text-green-300 text-sm mt-1">Track individual student progress and identify areas for improvement</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Live updates</span>
                    <span className="text-gray-400 text-xs">Last updated: {lastUpdate.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-green-300 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-green-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-green-300 uppercase tracking-wider">
                        Current Activity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-green-300 uppercase tracking-wider">
                        Progress
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-green-300 uppercase tracking-wider">
                        Accuracy
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-green-300 uppercase tracking-wider">
                        Today's Activity
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-green-300 uppercase tracking-wider">
                        Weak Areas
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {dashboardData.studentPerformance.length > 0 ? (
                      dashboardData.studentPerformance.map((student, index) => (
                        <tr key={index} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-white">{student.name}</div>
                              {student.isOnline && (
                                <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.isOnline 
                                ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-400/30'
                            }`}>
                              {student.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">{student.currentActivity}</div>
                            <div className="text-xs text-gray-500">
                              {student.lastActive ? new Date(student.lastActive).toLocaleTimeString() : 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="w-16 bg-white/20 rounded-full h-2">
                                <div 
                                  className="bg-blue-500 h-2 rounded-full" 
                                  style={{ width: `${student.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-green-300">{student.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.accuracy >= 80 
                                ? 'bg-green-500/20 text-green-400 border border-green-400/30'
                                : 'bg-red-500/20 text-red-400 border border-red-400/30'
                            }`}>
                              {student.accuracy}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {student.timeSpentToday}min
                            </div>
                            <div className="text-xs text-gray-500">
                              {student.quizAttemptsToday} quizzes
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.weakAreas.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {student.weakAreas.map((area, idx) => (
                                  <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-400/30">
                                    {area}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-400/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                On Track
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Users className="w-16 h-16 text-gray-400 mb-4" />
                            <h4 className="text-lg font-medium text-white mb-2">No students enrolled yet</h4>
                            <p className="text-gray-400">When students enroll in your courses, they will appear here</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Real-time Activity Feed Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-yellow-400" />
                      Live Activity Feed
                    </h3>
                    <p className="text-green-300 text-sm mt-1">Real-time student activities</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-sm">Live</span>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                {dashboardData.realTimeActivity.length > 0 ? (
                  dashboardData.realTimeActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="flex items-center space-x-3">
                        {/* Activity Icon */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'login' || activity.type === 'quiz_complete' || activity.type === 'lesson_complete' 
                            ? 'bg-green-500/20' 
                            : activity.type === 'logout' 
                            ? 'bg-red-500/20' 
                            : activity.type === 'quiz_start'
                            ? 'bg-blue-500/20'
                            : activity.type === 'lesson_start'
                            ? 'bg-purple-500/20'
                            : 'bg-yellow-500/20'
                        }`}>
                          {activity.type === 'login' && <CheckCircle className="w-4 h-4 text-green-400" />}
                          {activity.type === 'logout' && <LogOut className="w-4 h-4 text-red-400" />}
                          {activity.type === 'quiz_start' && <Target className="w-4 h-4 text-blue-400" />}
                          {activity.type === 'quiz_complete' && <Award className="w-4 h-4 text-green-400" />}
                          {activity.type === 'lesson_start' && <BookOpen className="w-4 h-4 text-purple-400" />}
                          {activity.type === 'lesson_complete' && <CheckCircle className="w-4 h-4 text-green-400" />}
                          {activity.type === 'study_session' && <Clock className="w-4 h-4 text-yellow-400" />}
                          {!['login', 'logout', 'quiz_start', 'quiz_complete', 'lesson_start', 'lesson_complete', 'study_session'].includes(activity.type) && 
                            <Users className="w-4 h-4 text-gray-400" />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-white">{activity.name}</div>
                            <div className={`w-2 h-2 rounded-full ${
                              activity.type === 'login' || activity.type === 'quiz_complete' || activity.type === 'lesson_complete' 
                                ? 'bg-green-400' 
                                : activity.type === 'logout' 
                                ? 'bg-red-400' 
                                : 'bg-blue-400'
                            }`}></div>
                          </div>
                          <div className="text-xs text-gray-300 mt-1">{activity.activity}</div>
                          
                          {/* Additional activity data */}
                          {activity.data && (
                            <div className="mt-2 text-xs text-gray-400">
                              {activity.data.quizTitle && (
                                <div className="flex items-center space-x-2">
                                  <span>Quiz:</span>
                                  <span className="text-blue-400">{activity.data.quizTitle}</span>
                                  {activity.data.score !== undefined && (
                                    <span className="text-green-400">({activity.data.score}/{activity.data.totalQuestions})</span>
                                  )}
                                </div>
                              )}
                              {activity.data.lessonTitle && (
                                <div className="flex items-center space-x-2">
                                  <span>Lesson:</span>
                                  <span className="text-purple-400">{activity.data.lessonTitle}</span>
                                  {activity.data.progress !== undefined && (
                                    <span className="text-green-400">({activity.data.progress}% complete)</span>
                                  )}
                                </div>
                              )}
                              {activity.data.minutes && (
                                <div className="flex items-center space-x-2">
                                  <span>Duration:</span>
                                  <span className="text-yellow-400">{activity.data.minutes} minutes</span>
                                </div>
                              )}
                              {activity.data.subject && (
                                <div className="flex items-center space-x-2">
                                  <span>Subject:</span>
                                  <span className="text-blue-300">{activity.data.subject}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {getRelativeTime(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">No recent activity</h4>
                    <p className="text-gray-400">Student activity will appear here in real-time</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            {/* Course Management Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
                      Course Management
                    </h3>
                    <p className="text-green-300 text-sm mt-1">Create and manage your courses</p>
                  </div>
                  <Button 
                    onClick={handleCreateCourseClick}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">No courses yet</h4>
                    <p className="text-gray-400 mb-6">Create your first course to get started</p>
                    <Button 
                      onClick={handleCreateCourseClick}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Course
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                      <div key={course._id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition-all duration-300 hover:scale-105">
                        {/* Course Thumbnail */}
                        <div className="relative h-48 bg-gradient-to-br from-purple-600 to-blue-600">
                          {course.thumbnail ? (
                            <img 
                              src={`http://localhost:3003${course.thumbnail}`} 
                              alt={course.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Fallback to gradient if image fails to load
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-16 h-16 text-white/50" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-2">
                            {course.published ? (
                              <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                                Published
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-400/30">
                                Draft
                              </Badge>
                            )}
                            {course.approvedByAdmin && (
                              <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                                Approved
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <h4 className="text-lg font-semibold text-white mb-2">{course.title}</h4>
                          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Category</span>
                            <span className="text-white">{course.category.name}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Level</span>
                            <span className="text-white">{course.level}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Price</span>
                            <span className="text-white">
                              {course.isFree ? 'Free' : `$${course.price}`}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Students</span>
                            <span className="text-white">{course.enrolledCount}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Rating</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="text-white">{course.rating.average.toFixed(1)}</span>
                              <span className="text-gray-400">({course.rating.count})</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-6">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleEditCourse(course)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleViewCourse(course._id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-purple-600"
                            onClick={() => startQuizCreation(course)}
                          >
                            <Brain className="w-4 h-4 mr-1" />
                            Quiz
                          </Button>
                          {!course.published ? (
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                              onClick={() => handlePublishCourse(course)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Publish
                            </Button>
                          ) : (
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                              onClick={() => handleUnpublishCourse(course)}
                            >
                              <EyeOff className="w-4 h-4 mr-1" />
                              Unpublish
                            </Button>
                          )}
                        </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Creation UI */}
            {isCreatingQuiz && (
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white flex items-center">
                        <Brain className="w-5 h-5 mr-2 text-purple-400" />
                        Create Quiz for: {selectedCourseForQuiz?.title}
                      </h3>
                      <p className="text-green-300 text-sm mt-1">Create a quiz for this specific course</p>
                    </div>
                    <Button 
                      onClick={() => {
                        setIsCreatingQuiz(false)
                        setSelectedCourseForQuiz(null)
                      }}
                      className="bg-transparent border border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Course Info */}
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">{selectedCourseForQuiz?.title}</p>
                        <p className="text-white/60 text-sm">Category: {selectedCourseForQuiz?.category.name} | Level: {selectedCourseForQuiz?.level}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quiz Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Quiz Title</label>
                      <input
                        type="text"
                        value={newQuiz.title}
                        onChange={(e) => setNewQuiz(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                        placeholder="Enter quiz title"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Category (inherited from course)</label>
                      <input
                        type="text"
                        value={newQuiz.category}
                        disabled
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/60"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newQuiz.description}
                      onChange={(e) => setNewQuiz(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 h-20"
                      placeholder="Enter quiz description"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Difficulty</label>
                      <select
                        value={newQuiz.difficulty}
                        onChange={(e) => setNewQuiz(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="Easy" className="bg-gray-800">Easy</option>
                        <option value="Medium" className="bg-gray-800">Medium</option>
                        <option value="Hard" className="bg-gray-800">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Points</label>
                      <input
                        type="number"
                        value={newQuiz.points}
                        onChange={(e) => setNewQuiz(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Time Limit (min)</label>
                      <input
                        type="number"
                        value={newQuiz.timeLimit}
                        onChange={(e) => setNewQuiz(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>

                  {/* Questions Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-white">Questions</h4>
                      <Button 
                        onClick={addQuestion}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        + Add Question
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {newQuiz.questions.map((question, qIndex) => (
                        <div key={qIndex} className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-white font-medium">Question {qIndex + 1}</h5>
                            <Button 
                              onClick={() => removeQuestion(qIndex)}
                              variant="outline"
                              className="border-red-400/20 text-red-400 hover:text-red-300"
                            >
                              Remove
                            </Button>
                          </div>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-white/80 text-sm font-medium mb-2">Question Text</label>
                              <input
                                type="text"
                                value={question.question}
                                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                                placeholder="Enter question"
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {question.options.map((option: string, oIndex: number) => (
                                <div key={oIndex}>
                                  <label className="block text-white/80 text-sm font-medium mb-2">Option {oIndex + 1}</label>
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...question.options]
                                      newOptions[oIndex] = e.target.value
                                      updateQuestion(qIndex, 'options', newOptions)
                                    }}
                                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"
                                    placeholder={`Option ${oIndex + 1}`}
                                  />
                                </div>
                              ))}
                            </div>
                            
                            <div>
                              <label className="block text-white/80 text-sm font-medium mb-2">Correct Answer</label>
                              <select
                                value={question.correct}
                                onChange={(e) => updateQuestion(qIndex, 'correct', e.target.value)}
                                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                              >
                                <option value="" className="bg-gray-800">Select correct answer</option>
                                {question.options.map((option: string, index: number) => (
                                  <option key={index} value={option} className="bg-gray-800">
                                    {option || `Option ${index + 1}`}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {newQuiz.questions.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-white/60">No questions added yet. Click "Add Question" to start.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreatingQuiz(false)
                        setSelectedCourseForQuiz(null)
                      }}
                      className="bg-transparent border border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveQuiz}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Save Quiz
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <CategoryManager />
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            {/* Assignment Management Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-yellow-400" />
                  Assignment Management
                </h3>
                <p className="text-green-300 text-sm mt-1">Create and manage class assignments</p>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-lg font-medium text-white">Current Assignments</h4>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Calendar className="w-4 h-4 mr-2" />
                    Create Assignment
                  </Button>
                </div>
                <div className="space-y-4">
                  {dashboardData.assignments.length > 0 ? (
                    dashboardData.assignments.map((assignment, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-medium text-white">{assignment.title}</div>
                            <div className="flex items-center text-sm text-green-400 mt-1">
                              <Clock className="w-4 h-4 mr-1" />
                              Due: {assignment.dueDate}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-green-400">Submissions</div>
                            <div className="text-lg font-semibold text-white">
                              {assignment.submissions}/{dashboardData.classOverview.totalStudents}
                            </div>
                            <div className="w-20 bg-white/20 rounded-full h-2 mt-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full" 
                                style={{ width: `${dashboardData.classOverview.totalStudents > 0 ? (assignment.submissions / dashboardData.classOverview.totalStudents) * 100 : 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-white mb-2">No assignments yet</h4>
                      <p className="text-gray-400 mb-6">Create your first assignment to get started</p>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Calendar className="w-4 h-4 mr-2" />
                        Create Assignment
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Topic-wise Performance Card */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                    Topic-wise Performance
                  </h3>
                  <p className="text-green-300 text-sm mt-1">Class performance by subject area</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {Object.keys(dashboardData.analytics.topicWisePerformance).length > 0 ? (
                      Object.entries(dashboardData.analytics.topicWisePerformance).map(([topic, performance]) => (
                        <div key={topic} className="flex items-center justify-between">
                          <span className="font-medium text-white capitalize">{topic}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-white/20 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${performance}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-green-300">{performance}%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-white mb-2">No performance data yet</h4>
                        <p className="text-gray-400">Topic-wise performance will appear here as students complete quizzes</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quiz Score Distribution Card */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-xl font-semibold text-white flex items-center">
                    <Award className="w-5 h-5 mr-2 text-yellow-400" />
                    Quiz Score Distribution
                  </h3>
                  <p className="text-green-300 text-sm mt-1">Student performance distribution</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {Object.keys(dashboardData.analytics.quizScoreDistribution).length > 0 ? (
                      Object.entries(dashboardData.analytics.quizScoreDistribution).map(([range, count]) => (
                        <div key={range} className="flex items-center justify-between">
                          <span className="font-medium text-white">{range}%</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-white/20 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${dashboardData.classOverview.totalStudents > 0 ? (count / dashboardData.classOverview.totalStudents) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold text-green-300">{count} students</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-white mb-2">No quiz data yet</h4>
                        <p className="text-gray-400">Quiz score distribution will appear here as students complete quizzes</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-4">
            {/* Teacher Earnings Dashboard Card */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-green-400" />
                  Earnings Dashboard
                </h3>
                <p className="text-green-300 text-sm mt-1">Manage your course earnings and withdrawals</p>
              </div>
              <div className="p-6">
                <TeacherEarningsDashboard />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create Course Modal */}
      <CreateCourseModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCourseCreated}
      />

      {/* View Course Modal */}
      <CourseViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setViewingCourseId(null)
        }}
        onEdit={handleEditFromView}
        courseId={viewingCourseId}
      />

      {/* Edit Course Modal */}
      <EditCourseModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedCourse(null)
        }}
        onSuccess={handleCourseUpdated}
        course={selectedCourse}
      />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { io, Socket } from 'socket.io-client'
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Star,
  Calendar,
  Filter,
  Search,
  Shield,
  Settings,
  BarChart3,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Database,
  Activity,
  Globe,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Wifi,
  WifiOff,
  Wallet
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'
import AdminPaymentDashboard from '../components/AdminPaymentDashboard'

interface DashboardStats {
  totalCourses: number
  publishedCourses: number
  totalStudents: number
  totalTeachers: number
  totalEnrollments: number
  totalRevenue: number
}

interface Course {
  _id: string
  title: string
  slug: string
  thumbnail: string
  instructor: {
    name: string
    email: string
  }
  category: {
    name: string
  }
  level: string
  price: number
  isFree: boolean
  published: boolean
  approvedByAdmin: boolean
  featured: boolean
  enrolledCount: number
  rating: {
    average: number
    count: number
  }
  createdAt: string
}

interface Teacher {
  _id: string
  name: string
  email: string
  isActive: boolean
  coursesCreated: number
  totalStudents: number
  rating: string
  createdAt: string
}

interface Admin {
  _id: string
  name: string
  email: string
  isActive: boolean
  isSuperAdmin: boolean
  createdAt: string
}

interface Student {
  _id: string
  name: string
  email: string
  isActive: boolean
  enrolledCourses: number
  createdAt: string
}

interface AdminPlanData {
  summary: {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    recentStudents: number;
    growthRate: number;
  };
  studentsByGrade: Array<{
    grade: string;
    count: number;
  }>;
  monthlyGrowth: Array<{
    month: string;
    year: number;
    students: number;
  }>;
  recentRegistrations: Array<{
    _id: string;
    name: string;
    email: string;
    grade: string;
    isActive: boolean;
    joinedAt: string;
  }>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalStudents: number;
    studentsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface SystemSettings {
  maintenanceMode: {
    enabled: boolean;
    message: string;
    allowAdminAccess: boolean;
  };
  registrations: {
    enabled: boolean;
    requireEmailVerification: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    emailVerification: boolean;
  };
  system: {
    adminEmail: string;
    maxUsers: number;
    storageLimit: number;
  };
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { token, logoutWithRedirect, user } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats>({
    totalCourses: 0,
    publishedCourses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalEnrollments: 0,
    totalRevenue: 0
  })
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [studentsPagination, setStudentsPagination] = useState<any>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' })
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(60000) // 60 seconds instead of 30
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [rateLimitWarning, setRateLimitWarning] = useState(false)
  const [adminPlanData, setAdminPlanData] = useState<AdminPlanData | null>(null)
  const [systemAnalytics, setSystemAnalytics] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [studentPage, setStudentPage] = useState(1)
  const [studentsPerPage] = useState(15)
  const [studentSearchTerm, setStudentSearchTerm] = useState('')
  const [studentFilterStatus, setStudentFilterStatus] = useState('all')
  
  // Separate pagination for Student Management section
  const [studentManagementPage, setStudentManagementPage] = useState(1)
  const [studentManagementPerPage] = useState(15)
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: {
      enabled: false,
      message: 'System is currently under maintenance. Please try again later.',
      allowAdminAccess: true
    },
    registrations: {
      enabled: true,
      requireEmailVerification: false
    },
    security: {
      twoFactorAuth: false,
      emailVerification: true
    },
    system: {
      adminEmail: 'admin@aitutor.com',
      maxUsers: 1000,
      storageLimit: 1073741824
    }
  })

  useEffect(() => {
    console.log('AdminDashboard component mounted or auth state changed')
    console.log('Current user:', user)
    console.log('Token exists:', !!token)
    
    if (!token) {
      console.error('No token available, redirecting to admin login')
      navigate('/admin-login')
      return
    }
    
    if (!user || user.role !== 'admin') {
      console.error('User is not admin:', user?.role)
      navigate('/admin-login')
      return
    }
    
    fetchDashboardData()
    fetchSystemSettings()
  }, [token, user, navigate])

  
  // Fetch admin plan data when page changes
  useEffect(() => {
    if (token && user && user.role === 'admin') {
      const fetchAdminPlanData = async () => {
        try {
          const adminPlanResponse = await api.get(`/admin/plan/students?page=${studentPage}&limit=${studentsPerPage}`);
          
          if (adminPlanResponse.data.success) {
            const adminPlanDataResponse = adminPlanResponse.data;
            console.log('Admin plan data:', adminPlanDataResponse)
            setAdminPlanData(adminPlanDataResponse.data)
          } else {
            console.error('Admin plan API failed:', adminPlanResponse.data)
            setAdminPlanData(null)
          }
        } catch (error) {
          console.error('Admin plan fetch error:', error)
          setAdminPlanData(null)
        }
      };

      fetchAdminPlanData();
    }
  }, [studentPage, studentsPerPage, token, user])

  // Fetch students when page, search, or filter changes
  useEffect(() => {
    console.log(`🔍 Student Management useEffect triggered - studentManagementPage: ${studentManagementPage}, studentManagementPerPage: ${studentManagementPerPage}, searchTerm: "${studentSearchTerm}", filterStatus: "${studentFilterStatus}"`)
    if (token && user && user.role === 'admin') {
      const fetchStudentsData = async () => {
        try {
          console.log(`🔍 Fetching Student Management data for page ${studentManagementPage}...`)
          const studentsResponse = await api.get(`/admin/students?page=${studentManagementPage}&limit=${studentManagementPerPage}&search=${studentSearchTerm}&status=${studentFilterStatus}`);
          
          if (studentsResponse.data.success) {
            const studentsData = studentsResponse.data;
            console.log('✅ Student Management data received:', studentsData)
            
            // Show 18 students on page 1, otherwise show paginated data
            if (studentManagementPage === 1 && studentsData.students && studentsData.students.length > 0) {
              // For page 1, show first 18 students
              const firstPageStudents = studentsData.students.slice(0, 18);
              console.log('✅ Showing first 18 students on page 1:', firstPageStudents.length);
              setStudents(firstPageStudents);
            } else if (studentManagementPage === 2 && studentsData.students && studentsData.students.length > 0) {
              // For page 2, show next 18 students (students 19-36)
              const secondPageStudents = studentsData.students.slice(18, 36);
              console.log('✅ Showing next 18 students on page 2:', secondPageStudents.length);
              setStudents(secondPageStudents);
            } else if (studentManagementPage === 3 && studentsData.students && studentsData.students.length > 0) {
              // For page 3, show next 18 students (students 37-54)
              const thirdPageStudents = studentsData.students.slice(36, 54);
              console.log('✅ Showing next 18 students on page 3:', thirdPageStudents.length);
              setStudents(thirdPageStudents);
            } else {
              // For other pages or no data, show paginated data
              console.log('✅ Showing paginated students, total:', studentsData.students?.length || 0);
              setStudents(studentsData.students || []);
            }
            
            setStudentsPagination(studentsData.pagination || null)
          } else {
            console.error('Student Management API failed:', studentsResponse.data)
            setStudents([])
            setStudentsPagination(null)
          }
        } catch (error) {
          console.error('Student Management fetch error:', error)
          setStudents([])
          setStudentsPagination(null)
        }
      };

      fetchStudentsData();
    }
  }, [studentManagementPage, studentManagementPerPage, studentSearchTerm, studentFilterStatus, token, user])

  // Real-time data updates
  useEffect(() => {
    if (!isRealTimeEnabled) return

    const interval = setInterval(() => {
      console.log('Auto-refreshing dashboard data...')
      fetchDashboardData()
      setLastUpdated(new Date())
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [isRealTimeEnabled, refreshInterval])

  // Manual refresh when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isRealTimeEnabled) {
        console.log('Tab became visible, refreshing data...')
        fetchDashboardData()
        setLastUpdated(new Date())
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isRealTimeEnabled])

  // WebSocket connection for real-time updates
  useEffect(() => {
    if (!isRealTimeEnabled || !token) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
        setConnectionStatus('disconnected')
      }
      return
    }

    const newSocket = io('http://localhost:3004', {
      auth: {
        token: token
      }
    })

    setConnectionStatus('connecting')

    newSocket.on('connect', () => {
      console.log('Connected to admin dashboard WebSocket')
      setConnectionStatus('connected')
      newSocket.emit('join-admin-dashboard')
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from admin dashboard WebSocket')
      setConnectionStatus('disconnected')
    })

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error)
      setConnectionStatus('disconnected')
    })

    // Listen for real-time updates
    newSocket.on('student-updated', (data) => {
      console.log('Student updated:', data)
      setStudents(prev => {
        const index = prev.findIndex(s => s._id === data.studentId)
        if (index !== -1) {
          const updated = [...prev]
          updated[index] = { ...updated[index], ...data.updates }
          return updated
        }
        return prev
      })
      setLastUpdated(new Date())
    })

    newSocket.on('teacher-updated', (data) => {
      console.log('Teacher updated:', data)
      setTeachers(prev => {
        const index = prev.findIndex(t => t._id === data.teacherId)
        if (index !== -1) {
          const updated = [...prev]
          updated[index] = { ...updated[index], ...data.updates }
          return updated
        }
        return prev
      })
      setLastUpdated(new Date())
    })

    newSocket.on('stats-updated', (data) => {
      console.log('Stats updated:', data)
      setStats(prev => ({ ...prev, ...data }))
      setLastUpdated(new Date())
    })

    newSocket.on('new-student', (student) => {
      console.log('New student registered:', student)
      setStudents(prev => [student, ...prev])
      setStats(prev => ({ ...prev, totalStudents: prev.totalStudents + 1 }))
      setLastUpdated(new Date())
    })

    newSocket.on('new-teacher', (teacher) => {
      console.log('New teacher registered:', teacher)
      setTeachers(prev => [teacher, ...prev])
      setStats(prev => ({ ...prev, totalTeachers: prev.totalTeachers + 1 }))
      setLastUpdated(new Date())
    })

    newSocket.on('student-deleted', (data) => {
      console.log('Student deleted:', data)
      setStudents(prev => prev.filter(s => s._id !== data.studentId))
      setStats(prev => ({ ...prev, totalStudents: Math.max(0, prev.totalStudents - 1) }))
      setLastUpdated(new Date())
    })

    newSocket.on('teacher-deleted', (data) => {
      console.log('Teacher deleted:', data)
      setTeachers(prev => prev.filter(t => t._id !== data.teacherId))
      setStats(prev => ({ ...prev, totalTeachers: Math.max(0, prev.totalTeachers - 1) }))
      setLastUpdated(new Date())
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [isRealTimeEnabled, token])

  const fetchDashboardData = async () => {
    try {
      // Use token from auth store (already available from the component props)
      console.log('🔍 fetchDashboardData called');
      console.log('🔍 Token exists:', !!token);
      console.log('🔍 Token length:', token?.length);
      console.log('🔍 Auth store token:', token);
      console.log('🔍 LocalStorage token:', localStorage.getItem('token'));
      
      if (!token) {
        console.error('❌ No token found in auth store')
        setLoading(false)
        return
      }
      
      console.log('🔍 Fetching admin dashboard data...')
      
      // Fetch data sequentially to avoid overwhelming the server with parallel requests
      // This helps prevent 429 errors
      
      // 1. Fetch stats first
      try {
        console.log('🔍 Making stats API call to /api/admin/dashboard/stats');
        const statsResponse = await api.get('/admin/dashboard/stats');
        
        console.log('🔍 Stats response status:', statsResponse.status);
        console.log('🔍 Stats response data:', statsResponse.data);
        
        if (statsResponse.data.success) {
          const statsData = statsResponse.data;
          console.log('✅ Stats data received:', statsData)
          console.log('✅ Stats data.stats:', statsData.stats)
          console.log('✅ Setting stats with:', statsData.stats || statsData)
          
          // Ensure we set the stats correctly
          const statsToSet = statsData.stats || statsData
          console.log('✅ Final stats to set:', statsToSet)
          setStats(statsToSet)
        } else {
          console.error('❌ Stats API returned failure:', statsResponse.data)
          setStats({
            totalCourses: 0,
            publishedCourses: 0,
            totalStudents: 0,
            totalTeachers: 0,
            totalEnrollments: 0,
            totalRevenue: 0
          })
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error('Stats fetch error:', error)
        setStats({
          totalCourses: 0,
          publishedCourses: 0,
          totalStudents: 0,
          totalTeachers: 0,
          totalEnrollments: 0,
          totalRevenue: 0
        })
      }

      // 2. Fetch courses
      try {
        console.log('Admin: Fetching courses from /api/admin/courses...');
        const coursesResponse = await api.get('/admin/courses');
        
        console.log('Admin: Courses response status:', coursesResponse.status);
        console.log('Admin: Courses response data:', coursesResponse.data);
        
        if (coursesResponse.data.success) {
          const coursesData = coursesResponse.data;
          console.log('Admin: Courses data received:', coursesData)
          console.log('Admin: Number of courses:', coursesData.courses?.length || 0)
          if (coursesData.courses && coursesData.courses.length > 0) {
            console.log('Admin: First course:', coursesData.courses[0])
          }
          setCourses(coursesData.courses || [])
        } else {
          console.error('Admin: Courses API failed:', coursesResponse.data)
          setCourses([])
        }
      } catch (error) {
        console.error('Admin: Courses fetch error:', error)
        setCourses([])
      }

      await new Promise(resolve => setTimeout(resolve, 100))

      // 3. Fetch students - REMOVED to avoid conflicts with useEffect below
      // Students are now fetched by the dedicated useEffect based on page changes
      
      await new Promise(resolve => setTimeout(resolve, 100))

      // 4. Fetch teachers
      try {
        const teachersResponse = await api.get('/admin/teachers');
        
        if (teachersResponse.data.success) {
          const teachersData = teachersResponse.data;
          console.log('Teachers data:', teachersData)
          setTeachers(teachersData.teachers || [])
        } else {
          console.error('Teachers API failed:', teachersResponse.data)
          setTeachers([])
        }
      } catch (error) {
        console.error('Teachers fetch error:', error)
        setTeachers([])
      }

      await new Promise(resolve => setTimeout(resolve, 100))

      // 5. Fetch admins
      try {
        const adminsResponse = await api.get('/admin/admins');
        
        if (adminsResponse.data.success) {
          const adminsData = adminsResponse.data;
          console.log('Admins data:', adminsData)
          setAdmins(adminsData.admins || [])
        } else {
          console.error('Admins API failed:', adminsResponse.data)
          setAdmins([])
        }
      } catch (error) {
        console.error('Admins fetch error:', error)
        setAdmins([])
      }

      await new Promise(resolve => setTimeout(resolve, 100))

      // 6. Fetch admin plan student data
      try {
        const adminPlanResponse = await api.get(`/admin/plan/students?page=${studentPage}&limit=${studentsPerPage}`);
        
        if (adminPlanResponse.data.success) {
          const adminPlanDataResponse = adminPlanResponse.data;
          console.log('Admin plan data:', adminPlanDataResponse)
          setAdminPlanData(adminPlanDataResponse.data)
        } else {
          console.error('Admin plan API failed:', adminPlanResponse.data)
          setAdminPlanData(null)
        }
      } catch (error) {
        console.error('Admin plan fetch error:', error)
        setAdminPlanData(null)
      }

      await new Promise(resolve => setTimeout(resolve, 100))

      // 7. Fetch system analytics
      try {
        setAnalyticsLoading(true)
        const analyticsResponse = await api.get('/admin/analytics');
        
        if (analyticsResponse.data.success) {
          const analyticsData = analyticsResponse.data;
          console.log('System analytics data:', analyticsData)
          setSystemAnalytics(analyticsData.analytics)
        } else {
          console.error('System analytics API failed:', analyticsResponse.data)
          setSystemAnalytics(null)
        }
      } catch (error) {
        console.error('System analytics fetch error:', error)
        setSystemAnalytics(null)
      } finally {
        setAnalyticsLoading(false)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set fallback data
      setStats({
        totalCourses: 0,
        publishedCourses: 0,
        totalStudents: 0,
        totalTeachers: 0,
        totalEnrollments: 0,
        totalRevenue: 0
      })
      setCourses([])
      setStudents([])
      setTeachers([])
      setAdmins([])
    } finally {
      setLoading(false)
      setLastUpdated(new Date())
    }
  }

  const fetchSystemSettings = async () => {
    try {
      console.log('🔍 Fetching system settings...')
      console.log('🔍 Token exists:', !!token);
      
      if (!token) {
        console.error('No token found for system settings')
        return
      }
      
      console.log('Fetching system settings...')
      
      const response = await api.get('/system');
      
      if (response.data.success) {
        const data = response.data;
        console.log('System settings:', data.settings)
        setSystemSettings(data.settings)
      } else {
        console.error('System settings API failed:', response.data)
      }
    } catch (error) {
      console.error('Error fetching system settings:', error)
    }
  }

  const handleUpdateSystemSettings = async (updates: Partial<SystemSettings>) => {
    try {
      console.log('🔍 Updating system settings:', updates)
      console.log('🔍 Token exists:', !!token);
      
      if (!token) {
        console.error('No token found for system settings update')
        return
      }
      
      console.log('Updating system settings:', updates)
      
      const response = await fetch('/api/system', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('System settings updated:', data.settings)
        setSystemSettings(data.settings)
        alert('Settings updated successfully')
      } else {
        const error = await response.json()
        console.error('System settings update failed:', error)
        alert(error.message || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error updating system settings:', error)
      alert('Failed to update settings')
    }
  }

  const handleApproveCourse = async (courseId: string) => {
    try {
      console.log('🔍 Approving course:', courseId)
      console.log('🔍 Token exists:', !!token);
      
      await fetch(`/api/admin/courses/${courseId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      fetchDashboardData()
    } catch (error) {
      console.error('Error approving course:', error)
    }
  }

  const handleFeatureCourse = async (courseId: string, featured: boolean) => {
    try {
      console.log('🔍 Featuring course:', courseId, 'featured:', featured)
      console.log('🔍 Token exists:', !!token);
      
      await fetch(`/api/admin/courses/${courseId}/feature`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featured })
      })
      
      fetchDashboardData()
    } catch (error) {
      console.error('Error featuring course:', error)
    }
  }

  const handleBlockStudent = async (studentId: string) => {
    try {
      console.log('🔍 Blocking student:', studentId)
      console.log('🔍 Token exists:', !!token);
      
      await fetch(`/api/admin/students/${studentId}/block`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      fetchDashboardData()
    } catch (error) {
      console.error('Error blocking student:', error)
    }
  }

  const handleUnblockStudent = async (studentId: string) => {
    try {
      console.log('🔍 Unblocking student:', studentId)
      console.log('🔍 Token exists:', !!token);
      
      await fetch(`/api/admin/students/${studentId}/unblock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      fetchDashboardData()
    } catch (error) {
      console.error('Error unblocking student:', error)
    }
  }

  const handleBlockTeacher = async (teacherId: string) => {
    try {
      console.log('🔍 Blocking teacher:', teacherId)
      console.log('🔍 Token exists:', !!token);
      
      await fetch(`/api/admin/teachers/${teacherId}/block`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      fetchDashboardData()
    } catch (error) {
      console.error('Error blocking teacher:', error)
    }
  }

  const handleUnblockTeacher = async (teacherId: string) => {
    try {
      console.log('🔍 Unblocking teacher:', teacherId)
      console.log('🔍 Token exists:', !!token);
      
      await fetch(`/api/admin/teachers/${teacherId}/unblock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      fetchDashboardData()
    } catch (error) {
      console.error('Error unblocking teacher:', error)
    }
  }

  const handleDeleteUser = async (userId: string, userType: 'student' | 'teacher') => {
    if (!confirm(`Are you sure you want to delete this ${userType}?`)) return
    
    try {
      console.log('🔍 Deleting user:', userId, 'type:', userType)
      console.log('🔍 Token exists:', !!token);
      
      await fetch(`/api/admin/${userType}s/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      fetchDashboardData()
    } catch (error) {
      console.error(`Error deleting ${userType}:`, error)
    }
  }

  const handleCreateAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      alert('Please fill in all fields')
      return
    }

    try {
      console.log('🔍 Creating admin:', newAdmin)
      console.log('🔍 Token exists:', !!token);
      
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAdmin)
      })
      
      if (response.ok) {
        setShowAddAdminModal(false)
        setNewAdmin({ name: '', email: '', password: '' })
        fetchDashboardData()
        alert('Admin created successfully')
      } else {
        const error = await response.json()
        alert(error.message || 'Failed to create admin')
      }
    } catch (error) {
      console.error('Error creating admin:', error)
      alert('Failed to create admin')
    }
  }

  const handleBlockAdmin = async (adminId: string) => {
    try {
      console.log('🔍 Blocking admin:', adminId)
      console.log('🔍 Token exists:', !!token);
      
      await fetch(`/api/admin/admins/${adminId}/block`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      fetchDashboardData()
    } catch (error) {
      console.error('Error blocking admin:', error)
    }
  }

  const handleUnblockAdmin = async (adminId: string) => {
    try {
      console.log('🔍 Unblocking admin:', adminId)
      console.log('🔍 Token exists:', !!token);
      
      await fetch(`/api/admin/admins/${adminId}/unblock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      fetchDashboardData()
    } catch (error) {
      console.error('Error unblocking admin:', error)
    }
  }

  const handleDeleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return
    
    try {
      console.log('🔍 Deleting admin:', adminId)
      console.log('🔍 Token exists:', !!token);
      
      await fetch(`/api/admin/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      fetchDashboardData()
    } catch (error) {
      console.error('Error deleting admin:', error)
    }
  }

  const handleLogout = () => {
    console.log('AdminDashboard: Logging out...')
    console.log('AdminDashboard: Current token before logout:', token)
    logoutWithRedirect(navigate)
    console.log('AdminDashboard: Logout with redirect function called')
  }

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'published') return matchesSearch && course.published
    if (filterStatus === 'draft') return matchesSearch && !course.published
    if (filterStatus === 'pending') return matchesSearch && !course.approvedByAdmin
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Admin Header */}
        <div className="bg-black/40 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Admin Control Center</h1>
                  <p className="text-purple-300 text-sm">Loading dashboard data...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-purple-300/20 rounded mb-2"></div>
                  <div className="h-8 bg-purple-300/20 rounded mb-1"></div>
                  <div className="h-3 bg-purple-300/20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Admin Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Admin Control Center</h1>
                <p className="text-purple-300 text-sm">Complete platform management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Real-time Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500/20 border-green-400/30'
                  : connectionStatus === 'connecting'
                  ? 'bg-yellow-500/20 border-yellow-400/30'
                  : 'bg-red-500/20 border-red-400/30'
              }`}>
                {connectionStatus === 'connected' ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">Live</span>
                  </>
                ) : connectionStatus === 'connecting' ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-yellow-400 animate-spin" />
                    <span className="text-yellow-400 text-sm">Connecting</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm">Offline</span>
                  </>
                )}
              </div>

              {/* Rate Limit Warning */}
              {rateLimitWarning && (
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg border bg-orange-500/20 border-orange-400/30">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-sm">Rate Limited</span>
                </div>
              )}

              {/* Last Updated */}
              <div className="px-3 py-2 bg-white/10 rounded-lg border border-white/20">
                <span className="text-purple-300 text-xs">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>

              
              {/* Refresh Controls */}
              <div className="flex items-center space-x-2">
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  className="px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={10000} className="bg-gray-800">10s</option>
                  <option value={30000} className="bg-gray-800">30s</option>
                  <option value={60000} className="bg-gray-800">1m</option>
                  <option value={300000} className="bg-gray-800">5m</option>
                </select>
                
                <button
                  onClick={() => setIsRealTimeEnabled(!isRealTimeEnabled)}
                  className={`p-2 rounded-lg border transition-colors ${
                    isRealTimeEnabled 
                      ? 'bg-green-500/20 border-green-400/30 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-500/20 border-gray-400/30 text-gray-400 hover:bg-gray-500/30'
                  }`}
                >
                  {isRealTimeEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => {
                    fetchDashboardData()
                    setLastUpdated(new Date())
                  }}
                  className="p-2 bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-lg">
                <span className="text-green-400 text-sm font-medium">System Online</span>
              </div>
              <div className="px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg">
                <span className="text-blue-400 text-sm font-medium">Admin Access</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 relative">
            {isRealTimeEnabled && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalStudents || 0}</p>
                <p className="text-purple-400 text-xs mt-1">Active learners</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 relative">
            {isRealTimeEnabled && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Total Teachers</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalTeachers || 0}</p>
                <p className="text-purple-400 text-xs mt-1">Course creators</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 relative">
            {isRealTimeEnabled && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Total Courses</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.totalCourses || 0}</p>
                <p className="text-purple-400 text-xs mt-1">{stats.publishedCourses || 0} published</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 relative">
            {isRealTimeEnabled && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-2">${stats.totalRevenue || 0}</p>
                <p className="text-purple-400 text-xs mt-1">Lifetime earnings</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-xl border border-white/20 p-1 rounded-xl">
            <TabsTrigger value="students" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-300 rounded-lg">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="teachers" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-300 rounded-lg">
              <UserCheck className="w-4 h-4 mr-2" />
              Teachers
            </TabsTrigger>
            <TabsTrigger value="admins" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-300 rounded-lg">
              <Shield className="w-4 h-4 mr-2" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-300 rounded-lg">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-300 rounded-lg">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-300 rounded-lg">
              <Wallet className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-purple-300 rounded-lg">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
                  Course Management
                </h3>
                <p className="text-purple-300 text-sm mt-1">Review, approve, and manage all platform courses</p>
              </div>
              <div className="p-6 border-b border-white/10">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-purple-400"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all" className="bg-gray-800">All Courses</option>
                    <option value="published" className="bg-gray-800">Published</option>
                    <option value="draft" className="bg-gray-800">Draft</option>
                    <option value="pending" className="bg-gray-800">Pending Approval</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Instructor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredCourses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <BookOpen className="w-12 h-12 text-purple-400/50 mb-4" />
                            <p className="text-purple-300 text-lg font-medium">No courses found</p>
                            <p className="text-purple-400 text-sm mt-2">
                              {loading ? 'Loading course data...' : 'No courses have been created yet.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCourses.map((course) => (
                      <tr key={course._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-12 w-12 rounded-lg object-cover border border-white/20"
                              src={course.thumbnail}
                              alt={course.title}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {course.title}
                              </div>
                              <div className="text-sm text-purple-300">
                                {course.category.name} • {course.level}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{course.instructor.name}</div>
                          <div className="text-sm text-purple-300">{course.instructor.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {course.published ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-400/30">
                                Published
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-400/30">
                                Draft
                              </span>
                            )}
                            {course.approvedByAdmin ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-400/30">
                                Approved
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-400 border border-orange-400/30">
                                Pending
                              </span>
                            )}
                            {course.featured && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-400/30">
                                Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                          {course.enrolledCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm text-purple-300">
                              {course.rating.average.toFixed(1)} ({course.rating.count})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {!course.approvedByAdmin && (
                              <Button
                                size="sm"
                                onClick={() => handleApproveCourse(course._id)}
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-400/30"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant={course.featured ? "secondary" : "outline"}
                              onClick={() => handleFeatureCourse(course._id, !course.featured)}
                              className={course.featured 
                                ? "bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-400/30"
                                : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                              }
                            >
                              <Star className="w-3 h-3 mr-1" />
                              {course.featured ? 'Unfeature' : 'Feature'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/admin/courses/${course._id}/edit`)}
                              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  Student Management
                </h3>
                <p className="text-purple-300 text-sm mt-1">Manage all student accounts and permissions</p>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="p-6 border-b border-white/10">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                    <Input
                      placeholder="Search students by name or email..."
                      value={studentSearchTerm}
                      onChange={(e) => {
                        setStudentSearchTerm(e.target.value)
                        setStudentManagementPage(1) // Reset to first page when searching
                      }}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder-purple-400"
                    />
                  </div>
                  <select
                    value={studentFilterStatus}
                    onChange={(e) => {
                      setStudentFilterStatus(e.target.value)
                      setStudentManagementPage(1) // Reset to first page when filtering
                    }}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all" className="bg-gray-800">All Students</option>
                    <option value="active" className="bg-gray-800">Active</option>
                    <option value="inactive" className="bg-gray-800">Blocked</option>
                  </select>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Courses
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Users className="w-12 h-12 text-purple-400/50 mb-4" />
                            <p className="text-purple-300 text-lg font-medium">No students found</p>
                            <p className="text-purple-400 text-sm mt-2">
                              {loading ? 'Loading student data...' : 
                               studentSearchTerm || studentFilterStatus !== 'all' 
                                 ? 'No students match your search criteria.' 
                                 : 'No student accounts have been created yet.'
                              }
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{student.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-purple-300">{student.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {student.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-400/30">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-400/30">
                                <UserX className="w-3 h-3 mr-1" />
                                Blocked
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                            {student.enrolledCourses}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {student.isActive ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleBlockStudent(student._id)}
                                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30"
                                >
                                  <Lock className="w-3 h-3 mr-1" />
                                  Block
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleUnblockStudent(student._id)}
                                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-400/30"
                                >
                                  <Unlock className="w-3 h-3 mr-1" />
                                  Unblock
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(student._id, 'student')}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination Controls */}
              {students.length > 0 && (
                <div className="flex items-center justify-between p-6 border-t border-white/10">
                  <div className="text-sm text-purple-300">
                    {studentsPagination ? 
                      `Showing ${((studentsPagination.currentPage - 1) * studentsPagination.studentsPerPage) + 1} to ${Math.min(studentsPagination.currentPage * studentsPagination.studentsPerPage, studentsPagination.totalStudents)} of ${studentsPagination.totalStudents} students` :
                      `Showing ${((studentManagementPage - 1) * studentManagementPerPage) + 1} to ${Math.min(studentManagementPage * studentManagementPerPage, students.length)} of ${students.length} students`
                    }
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setStudentManagementPage(prev => Math.max(1, prev - 1))}
                      disabled={studentsPagination ? !studentsPagination.hasPrevPage : studentManagementPage === 1}
                      className="px-3 py-1 text-sm bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: studentsPagination ? studentsPagination.totalPages : Math.ceil(students.length / studentManagementPerPage) }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => {
                            console.log(`🔍 Clicking Student Management page ${page}, current page: ${studentManagementPage}`)
                            setStudentManagementPage(page)
                          }}
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            studentManagementPage === page
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setStudentManagementPage(prev => studentsPagination ? Math.min(studentsPagination.totalPages, prev + 1) : Math.min(Math.ceil(students.length / studentManagementPerPage), prev + 1))}
                      disabled={studentsPagination ? !studentsPagination.hasNextPage : studentManagementPage === Math.ceil(students.length / studentManagementPerPage)}
                      className="px-3 py-1 text-sm bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                  <div className="text-sm text-purple-300">
                    Page {studentManagementPage} of {studentsPagination ? studentsPagination.totalPages : Math.ceil(students.length / studentManagementPerPage)}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Teachers Tab */}
          <TabsContent value="teachers" className="space-y-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <UserCheck className="w-5 h-5 mr-2 text-green-400" />
                  Teacher Management
                </h3>
                <p className="text-purple-300 text-sm mt-1">Manage all teacher accounts and course permissions</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Teacher
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Courses
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Students
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {teachers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <UserCheck className="w-12 h-12 text-purple-400/50 mb-4" />
                            <p className="text-purple-300 text-lg font-medium">No teachers found</p>
                            <p className="text-purple-400 text-sm mt-2">
                              {loading ? 'Loading teacher data...' : 'No teacher accounts have been created yet.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      teachers.map((teacher) => (
                        <tr key={teacher._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{teacher.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-purple-300">{teacher.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {teacher.isActive ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-400/30">
                                <UserCheck className="w-3 h-3 mr-1" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-400/30">
                                <UserX className="w-3 h-3 mr-1" />
                                Blocked
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                            {teacher.coursesCreated}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                            {teacher.totalStudents}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span className="ml-1 text-sm text-purple-300">
                                {teacher.rating}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {teacher.isActive ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleBlockTeacher(teacher._id)}
                                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30"
                                >
                                  <Lock className="w-3 h-3 mr-1" />
                                  Block
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  onClick={() => handleUnblockTeacher(teacher._id)}
                                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-400/30"
                                >
                                  <Unlock className="w-3 h-3 mr-1" />
                                  Unblock
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(teacher._id, 'teacher')}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Admins Tab */}
          <TabsContent value="admins" className="space-y-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-white flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-purple-400" />
                      Admin Management
                    </h3>
                    <p className="text-purple-300 text-sm mt-1">Manage admin accounts and permissions</p>
                  </div>
                  <Button
                    onClick={() => setShowAddAdminModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Add Admin
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {admins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{admin.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-purple-300">{admin.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {admin.isSuperAdmin ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-400/30">
                              <Shield className="w-3 h-3 mr-1" />
                              Super Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-400/30">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {admin.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-400/30">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-400/30">
                              <UserX className="w-3 h-3 mr-1" />
                              Blocked
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-400">
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {admin.isActive ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleBlockAdmin(admin._id)}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30"
                                disabled={admin.isSuperAdmin && user?.email !== admin.email}
                              >
                                <Lock className="w-3 h-3 mr-1" />
                                Block
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleUnblockAdmin(admin._id)}
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-400/30"
                              >
                                <Unlock className="w-3 h-3 mr-1" />
                                Unblock
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAdmin(admin._id)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/30"
                              disabled={admin.isSuperAdmin}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Admin Modal */}
            {showAddAdminModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-semibold text-white mb-4">Add New Admin</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Name
                      </label>
                      <Input
                        value={newAdmin.name}
                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                        placeholder="Enter admin name"
                        className="bg-white/10 border-white/20 text-white placeholder-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={newAdmin.email}
                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                        placeholder="Enter admin email"
                        className="bg-white/10 border-white/20 text-white placeholder-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-300 mb-2">
                        Password
                      </label>
                      <Input
                        type="password"
                        value={newAdmin.password}
                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                        placeholder="Enter admin password"
                        className="bg-white/10 border-white/20 text-white placeholder-purple-400"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddAdminModal(false)
                        setNewAdmin({ name: '', email: '', password: '' })
                      }}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateAdmin}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Create Admin
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <>
            {/* Admin Plan Student Details */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-400" />
                  Admin Plan Student Analytics
                </h3>
                <p className="text-purple-300 text-sm mt-1">Comprehensive student data and insights for admin plan</p>
              </div>
              
              {adminPlanData ? (
                <div className="p-6 space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-300 text-xs">Total Students</p>
                          <p className="text-2xl font-bold text-white">{adminPlanData.summary.totalStudents}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-400/50" />
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-300 text-xs">Active</p>
                          <p className="text-2xl font-bold text-green-400">{adminPlanData.summary.activeStudents}</p>
                        </div>
                        <UserCheck className="w-8 h-8 text-green-400/50" />
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-300 text-xs">Inactive</p>
                          <p className="text-2xl font-bold text-red-400">{adminPlanData.summary.inactiveStudents}</p>
                        </div>
                        <UserX className="w-8 h-8 text-red-400/50" />
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-300 text-xs">New (30d)</p>
                          <p className="text-2xl font-bold text-purple-400">{adminPlanData.summary.recentStudents}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-400/50" />
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-300 text-xs">Growth Rate</p>
                          <p className="text-2xl font-bold text-yellow-400">{adminPlanData.summary.growthRate}%</p>
                        </div>
                        <Activity className="w-8 h-8 text-yellow-400/50" />
                      </div>
                    </div>
                  </div>

                  {/* Recent Registrations */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-medium text-white">Recent Student Registrations</h4>
                      <div className="text-sm text-purple-300">
                        {adminPlanData.pagination ? 
                          `Showing ${((adminPlanData.pagination.currentPage - 1) * adminPlanData.pagination.studentsPerPage) + 1} to ${Math.min(adminPlanData.pagination.currentPage * adminPlanData.pagination.studentsPerPage, adminPlanData.pagination.totalStudents)} of ${adminPlanData.pagination.totalStudents} students` :
                          `Showing 1 to ${Math.min(15, adminPlanData.recentRegistrations.length)} of ${adminPlanData.recentRegistrations.length} students`
                        }
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-white/10">
                          <tr>
                            <th className="text-left py-2 px-4 text-xs font-medium text-purple-300">Name</th>
                            <th className="text-left py-2 px-4 text-xs font-medium text-purple-300">Email</th>
                            <th className="text-left py-2 px-4 text-xs font-medium text-purple-300">Grade</th>
                            <th className="text-left py-2 px-4 text-xs font-medium text-purple-300">Status</th>
                            <th className="text-left py-2 px-4 text-xs font-medium text-purple-300">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {adminPlanData.recentRegistrations.map((student) => (
                            <tr key={student._id} className="hover:bg-white/5">
                              <td className="py-2 px-4 text-white">{student.name}</td>
                              <td className="py-2 px-4 text-purple-300">{student.email}</td>
                              <td className="py-2 px-4 text-purple-300">{student.grade}</td>
                              <td className="py-2 px-4">
                                {student.isActive ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-400/30">
                                    Active
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-400/30">
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-4 text-purple-300">
                                {new Date(student.joinedAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Pagination Controls */}
                    {(adminPlanData.pagination ? adminPlanData.pagination.totalStudents > adminPlanData.pagination.studentsPerPage : adminPlanData.recentRegistrations.length > studentsPerPage) && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setStudentPage(prev => Math.max(1, prev - 1))}
                            disabled={adminPlanData.pagination ? !adminPlanData.pagination.hasPrevPage : studentPage === 1}
                            className="px-3 py-1 text-sm bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Previous
                          </button>
                          
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: adminPlanData.pagination ? adminPlanData.pagination.totalPages : Math.ceil(adminPlanData.recentRegistrations.length / studentsPerPage) }, (_, i) => i + 1).map((page) => (
                              <button
                                key={page}
                                onClick={() => setStudentPage(page)}
                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                  studentPage === page
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          
                          <button
                            onClick={() => setStudentPage(prev => Math.min(adminPlanData.pagination ? adminPlanData.pagination.totalPages : Math.ceil(adminPlanData.recentRegistrations.length / studentsPerPage), prev + 1))}
                            disabled={adminPlanData.pagination ? !adminPlanData.pagination.hasNextPage : studentPage === Math.ceil(adminPlanData.recentRegistrations.length / studentsPerPage)}
                            className="px-3 py-1 text-sm bg-white/10 border border-white/20 rounded text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            Next
                          </button>
                        </div>
                        
                        <div className="text-sm text-purple-300">
                          Page {studentPage} of {adminPlanData.pagination ? adminPlanData.pagination.totalPages : Math.ceil(adminPlanData.recentRegistrations.length / studentsPerPage)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-purple-300">Loading admin plan student data...</p>
                </div>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-purple-400" />
                  User Growth Analytics
                </h3>
                <p className="text-purple-300 text-sm mt-1">Platform-wide user growth and engagement metrics</p>
              </div>
              <div className="p-6">
                {analyticsLoading ? (
                  <div className="h-64 flex items-center justify-center text-purple-400">
                    <div className="text-center">
                      <RefreshCw className="w-16 h-16 mx-auto mb-4 animate-spin" />
                      <p>Loading analytics data...</p>
                    </div>
                  </div>
                ) : systemAnalytics && systemAnalytics.userGrowth ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-300 text-sm">Total Students</p>
                            <p className="text-2xl font-bold text-white">
                              {systemAnalytics.summary?.totalStudents || systemAnalytics.userGrowth.reduce((sum: number, item: any) => sum + item.students, 0)}
                            </p>
                          </div>
                          <Users className="w-8 h-8 text-blue-400" />
                        </div>
                      </div>
                      <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-300 text-sm">Total Teachers</p>
                            <p className="text-2xl font-bold text-white">
                              {systemAnalytics.summary?.totalTeachers || systemAnalytics.userGrowth.reduce((sum: number, item: any) => sum + item.teachers, 0)}
                            </p>
                          </div>
                          <UserCheck className="w-8 h-8 text-green-400" />
                        </div>
                      </div>
                      <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-300 text-sm">New Users (30d)</p>
                            <p className="text-2xl font-bold text-white">
                              {systemAnalytics.summary?.newUsersLast30Days || systemAnalytics.userGrowth.reduce((sum: number, item: any) => sum + item.students + item.teachers, 0)}
                            </p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-purple-400" />
                        </div>
                      </div>
                    </div>
                    <div className="h-64 bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-4">User Growth Trend (Last 30 Days)</h4>
                      <div className="h-48 flex items-end space-x-1">
                        {systemAnalytics.userGrowth.slice(-14).map((item: any, index: number) => {
                          const maxValue = Math.max(...systemAnalytics.userGrowth.slice(-14).map((d: any) => d.students + d.teachers));
                          const height = maxValue > 0 ? ((item.students + item.teachers) / maxValue) * 150 : 20;
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t transition-all duration-300 hover:opacity-80" 
                                   style={{ height: `${Math.max(20, height)}px` }}
                                   title={`${item.students} students, ${item.teachers} teachers`}>
                              </div>
                              <span className="text-xs text-purple-300 mt-1">
                                {new Date(item.date).getDate()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-center mt-2 space-x-4 text-xs">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                          <span className="text-purple-300">Daily New Users</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-purple-400">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No analytics data available</p>
                      <p className="text-sm mt-2">User growth data will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-400" />
                  Revenue Overview
                </h3>
                <p className="text-purple-300 text-sm mt-1">Platform earnings and financial metrics</p>
              </div>
              <div className="p-6">
                {analyticsLoading ? (
                  <div className="h-64 flex items-center justify-center text-purple-400">
                    <div className="text-center">
                      <RefreshCw className="w-16 h-16 mx-auto mb-4 animate-spin" />
                      <p>Loading revenue data...</p>
                    </div>
                  </div>
                ) : systemAnalytics && systemAnalytics.revenue ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-green-500/20 border border-green-400/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-300 text-sm">Total Revenue (30d)</p>
                            <p className="text-2xl font-bold text-white">
                              ${(systemAnalytics.summary?.totalRevenue || systemAnalytics.revenue.reduce((sum: number, item: any) => sum + item.amount, 0)).toFixed(2)}
                            </p>
                          </div>
                          <DollarSign className="w-8 h-8 text-green-400" />
                        </div>
                      </div>
                      <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-300 text-sm">Total Enrollments</p>
                            <p className="text-2xl font-bold text-white">
                              {systemAnalytics.summary?.totalEnrollments || systemAnalytics.courseEnrollments.reduce((sum: number, item: any) => sum + item.enrollments, 0)}
                            </p>
                          </div>
                          <BookOpen className="w-8 h-8 text-blue-400" />
                        </div>
                      </div>
                      <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-300 text-sm">Avg. Revenue/Day</p>
                            <p className="text-2xl font-bold text-white">
                              ${((systemAnalytics.summary?.totalRevenue || systemAnalytics.revenue.reduce((sum: number, item: any) => sum + item.amount, 0)) / 30).toFixed(2)}
                            </p>
                          </div>
                          <TrendingUp className="w-8 h-8 text-purple-400" />
                        </div>
                      </div>
                    </div>
                    <div className="h-64 bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium mb-4">Revenue Trend (Last 30 Days)</h4>
                      <div className="h-48 flex items-end space-x-1">
                        {systemAnalytics.revenue.slice(-14).map((item: any, index: number) => {
                          const maxValue = Math.max(...systemAnalytics.revenue.slice(-14).map((d: any) => d.amount));
                          const height = maxValue > 0 ? (item.amount / maxValue) * 150 : 20;
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div className="w-full bg-gradient-to-t from-green-500 to-blue-500 rounded-t transition-all duration-300 hover:opacity-80" 
                                   style={{ height: `${Math.max(20, height)}px` }}
                                   title={`$${item.amount.toFixed(2)}`}>
                              </div>
                              <span className="text-xs text-purple-300 mt-1">
                                {new Date(item.date).getDate()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-center mt-2 space-x-4 text-xs">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
                          <span className="text-purple-300">Daily Revenue</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-purple-400">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No revenue data available</p>
                      <p className="text-sm mt-2">Financial metrics will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            </>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <AdminPaymentDashboard />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-400" />
                  Platform Settings
                </h3>
                <p className="text-purple-300 text-sm mt-1">Configure system-wide settings and preferences</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Platform Name
                  </label>
                  <Input 
                    defaultValue="AI Tutor Platform" 
                    className="bg-white/10 border-white/20 text-white placeholder-purple-400 hover:bg-white hover:text-gray-900 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Admin Email
                  </label>
                  <Input 
                    value={systemSettings.system.adminEmail}
                    onChange={(e) => setSystemSettings(prev => ({
                      ...prev,
                      system: { ...prev.system, adminEmail: e.target.value }
                    }))}
                    className="bg-white/10 border-white/20 text-white placeholder-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    System Status
                  </label>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={systemSettings.maintenanceMode.enabled}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          maintenanceMode: { ...prev.maintenanceMode, enabled: e.target.checked }
                        }))}
                      />
                      <span className="text-sm text-purple-300">Enable maintenance mode</span>
                    </div>
                    {systemSettings.maintenanceMode.enabled && (
                      <div className="ml-6">
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                          Maintenance Message
                        </label>
                        <textarea
                          value={systemSettings.maintenanceMode.message}
                          onChange={(e) => setSystemSettings(prev => ({
                            ...prev,
                            maintenanceMode: { ...prev.maintenanceMode, message: e.target.value }
                          }))}
                          className="w-full bg-white/10 border-white/20 text-white placeholder-purple-400 rounded-lg p-2 text-sm"
                          rows={3}
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={systemSettings.registrations.enabled}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          registrations: { ...prev.registrations, enabled: e.target.checked }
                        }))}
                      />
                      <span className="text-sm text-purple-300">Allow new registrations</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">
                    Security Settings
                  </label>
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={systemSettings.security.twoFactorAuth}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, twoFactorAuth: e.target.checked }
                        }))}
                      />
                      <span className="text-sm text-purple-300">Two-factor authentication</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded"
                        checked={systemSettings.security.emailVerification}
                        onChange={(e) => setSystemSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, emailVerification: e.target.checked }
                        }))}
                      />
                      <span className="text-sm text-purple-300">Email verification required</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleUpdateSystemSettings(systemSettings)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

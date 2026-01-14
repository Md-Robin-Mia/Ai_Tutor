import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { PaymentModal } from '../components/PaymentModal'
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  TrendingUp, 
  Award, 
  Filter, 
  Search, 
  Play, 
  BarChart3, 
  Target, 
  Zap,
  Heart,
  Share2,
  Calendar,
  User,
  ChevronRight,
  Sparkles,
  Flame,
  Trophy,
  Globe,
  Monitor,
  Smartphone,
  Download,
  Infinity,
  Eye,
  Bell,
  Edit
} from 'lucide-react'
import '../styles/dashboard-theme.css'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

interface Course {
  _id: string
  title: string
  instructor: {
    _id: string
    name: string
    email: string
  }
  category: {
    name: string
    _id: string
  }
  level: string
  duration: number
  enrolledCount: number
  rating: {
    average: number
    count: number
  }
  totalLessons: number
  price: number
  thumbnail: string
  description: string
  requirements: string[]
  whatYouLearn: string[]
  targetAudience: string[]
  published: boolean
  approvedByAdmin: boolean
  isEnrolled?: boolean
  progress?: number
  enrollment?: {
    enrolledAt: string
    progress: number
    lastAccessedAt?: string
  }
}


export default function CoursePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([])
  const [inProgressCourses, setInProgressCourses] = useState<Course[]>([])
  const [completedCourses, setCompletedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedPrice, setSelectedPrice] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('newest')
  const [courseViews, setCourseViews] = useState<{[key: string]: number}>({})
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const { token, user } = useAuthStore()
  const navigate = useNavigate()

  
  
  
  
  
  
  const categories = [
    { value: 'all', label: 'All Courses', icon: Globe },
    { value: 'Programming', label: 'Programming', icon: Monitor },
    { value: 'Design', label: 'Design', icon: Sparkles },
    { value: 'Business', label: 'Business', icon: Target },
    { value: 'Marketing', label: 'Marketing', icon: TrendingUp },
    { value: 'Data Science', label: 'Data Science', icon: BarChart3 },
    { value: 'Languages', label: 'Languages', icon: Globe }
  ]

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' }
  ]

  const priceFilters = [
    { value: 'all', label: 'All Prices' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' }
  ]

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Newest' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' }
  ]

  // Fetch courses and student/teacher data
  useEffect(() => {
    fetchCourses()
    if (user?.role === 'student') {
      fetchStudentCourses()
    } else if (user?.role === 'teacher') {
      fetchTeacherCourses()
    }
  }, [])

  const fetchCourses = async () => {
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        sortBy: sortBy
      })

      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedLevel !== 'all') params.append('level', selectedLevel)
      if (searchTerm) params.append('search', searchTerm)

      const response = await api.get(`/courses?${params}`)
      
      if (response.data) {
        console.log('Courses fetched from API:', response.data.courses.length);
        console.log('Sample course data:', response.data.courses[0]);
        console.log('Courses with isEnrolled=true:', response.data.courses.filter(c => c.isEnrolled).length);
        setCourses(response.data.courses)
        setFilteredCourses(response.data.courses)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStudentCourses = async () => {
    try {
      if (!token) return

      const [enrolledRes, inProgressRes, completedRes] = await Promise.all([
        api.get('/courses/student/enrolled'),
        api.get('/courses/student/in-progress'),
        api.get('/courses/student/completed')
      ])

      if (enrolledRes.data) {
        console.log('Enrolled courses fetched:', enrolledRes.data.courses.length);
        console.log('Sample enrolled course:', enrolledRes.data.courses[0]);
        setEnrolledCourses(enrolledRes.data.courses)
      }
      if (inProgressRes.data) {
        console.log('In-progress courses fetched:', inProgressRes.data.courses.length);
        setInProgressCourses(inProgressRes.data.courses)
      }
      if (completedRes.data) {
        console.log('Completed courses fetched:', completedRes.data.courses.length);
        setCompletedCourses(completedRes.data.courses)
      }
    } catch (error) {
      console.error('Error fetching student courses:', error)
    }
  }

  const fetchTeacherCourses = async () => {
    try {
      if (!token) return

      const response = await api.get('/teacher/courses')
      
      if (response.data) {
        // Store teacher courses for reference
        // These will be displayed in the main courses grid due to the backend logic
        console.log('Teacher courses fetched:', response.data.courses)
      }
    } catch (error) {
      console.error('Error fetching teacher courses:', error)
    }
  }

  // Merge enrollment status from student courses into main course list
  const mergeEnrollmentStatus = (mainCourses: Course[], studentCourses: Course[]) => {
    const studentCourseMap = new Map(
      studentCourses.map(course => [course._id, { isEnrolled: true, progress: course.progress || 0 }])
    )
    
    const merged = mainCourses.map(course => ({
      ...course,
      isEnrolled: studentCourseMap.has(course._id) || course.isEnrolled,
      progress: studentCourseMap.get(course._id)?.progress || course.progress || 0
    }))
    
    // Debug logging
    console.log('Course enrollment merge:', {
      mainCoursesCount: mainCourses.length,
      studentCoursesCount: studentCourses.length,
      mergedCoursesWithEnrollment: merged.filter(c => c.isEnrolled).length
    })
    
    return merged
  }

  // Refetch courses when filters change
  useEffect(() => {
    fetchCourses()
  }, [selectedCategory, selectedLevel, selectedPrice, searchTerm, sortBy])

  useEffect(() => {
    let filtered = courses
    
    // Merge enrollment status if student data is available
    if (user?.role === 'student' && enrolledCourses.length > 0) {
      filtered = mergeEnrollmentStatus(filtered, enrolledCourses)
    }

    // Client-side filtering for additional filters not handled by API
    if (selectedPrice === 'free') {
      filtered = filtered.filter(course => course.price === 0)
    } else if (selectedPrice === 'paid') {
      filtered = filtered.filter(course => course.price > 0)
    }

    setFilteredCourses(filtered)
  }, [courses, selectedPrice, enrolledCourses, inProgressCourses, completedCourses])

  const handleEnroll = async (courseId: string) => {
    try {
      if (!token) {
        navigate('/login')
        return
      }

      // Find the course to check if it's paid
      const course = courses.find(c => c._id === courseId)
      
      if (course && course.price > 0) {
        // For paid courses, open payment system
        handlePayment(courseId, course.price)
      } else {
        // For free courses, enroll directly
        const response = await api.post(`/courses/${courseId}/enroll`)

        if (response.data) {
          // Refetch student courses
          fetchStudentCourses()
          // Update course in list
          fetchCourses()
        }
      }
    } catch (error: any) {
      console.error('Error enrolling in course:', error)
      alert(error.response?.data?.message || 'Failed to enroll in course')
    }
  }

  const handlePayment = async (courseId: string, price: number) => {
    try {
      // Find the course
      const course = courses.find(c => c._id === courseId)
      
      if (course) {
        setSelectedCourse(course)
        setShowPaymentModal(true)
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      alert('Failed to open payment modal. Please try again.')
    }
  }

  const handlePaymentSuccess = async (transactionId: string) => {
    try {
      // Refresh course data after successful payment
      fetchStudentCourses()
      fetchCourses()
      
      // Show success message
      alert('Course purchased successfully! You are now enrolled.')
    } catch (error: any) {
      console.error('Payment success handling error:', error)
    }
  }

  const handleBookmark = (courseId: string) => {
    const isBookmarked = bookmarkedCourses.includes(courseId)
    if (isBookmarked) {
      setBookmarkedCourses(bookmarkedCourses.filter(id => id !== courseId))
    } else {
      setBookmarkedCourses([...bookmarkedCourses, courseId])
    }
  }

  const trackCourseView = (courseId: string) => {
    setCourseViews(prev => ({
      ...prev,
      [courseId]: (prev[courseId] || 0) + 1
    }))
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'Intermediate': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'Advanced': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-gradient-to-r from-green-500 to-emerald-500'
    if (progress >= 50) return 'bg-gradient-to-r from-blue-500 to-cyan-500'
    if (progress >= 25) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    return 'bg-gradient-to-r from-gray-500 to-gray-600'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dashboard-layout">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-6" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading Amazing Courses</h2>
          <p className="text-white/70">Preparing your learning journey...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen dashboard-layout">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{paddingTop: '100px'}}>
        {/* Hero Section */}
        <div className="text-center mb-12 slide-in-top">
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 float">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Discover Your Learning Journey
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto">
            Explore world-class courses and unlock your potential with expert-led instruction
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="stats-card border-l-blue-500 fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">Total Courses</p>
                  <p className="text-3xl font-bold text-white">{courses.length}</p>
                  <p className="text-green-400 text-sm mt-1">Available now</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card border-l-green-500 fade-in" style={{ animationDelay: '0.1s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">Enrolled</p>
                  <p className="text-3xl font-bold text-white">{enrolledCourses.length}</p>
                  <p className="text-blue-400 text-sm mt-1">Your courses</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card border-l-yellow-500 fade-in" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">In Progress</p>
                  <p className="text-3xl font-bold text-white">{inProgressCourses.length}</p>
                  <p className="text-yellow-400 text-sm mt-1">Keep going!</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card border-l-purple-500 fade-in" style={{ animationDelay: '0.3s' }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm mb-1">Completed</p>
                  <p className="text-3xl font-bold text-white">{completedCourses.length}</p>
                  <p className="text-purple-400 text-sm mt-1">Well done!</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Enrolled Courses Section */}
        {user?.role === 'student' && enrolledCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">My Enrolled Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrolledCourses.map((course, index) => (
                <Card key={course._id} className="relative overflow-hidden group fade-in" style={{ 
                  animationDelay: `${index * 0.1}s`,
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                    
                    {/* Progress Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-md">
                        {course.enrollment?.progress || 0}% Complete
                      </Badge>
                    </div>

                    {/* Continue Learning Button */}
                    <div className="absolute bottom-4 right-4">
                      <Button 
                        onClick={() => navigate(`/courses/${course._id}?continue=true`)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Continue Learning
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-white/70 text-sm mb-4">{course.instructor.name}</p>
                    <div className="flex items-center justify-between text-white/60 text-sm">
                      <span>{course.totalLessons} lessons</span>
                      <span>{Math.round(course.duration)} hours</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* In Progress Courses Section */}
        {user?.role === 'student' && inProgressCourses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">In Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {inProgressCourses.map((course, index) => (
                <Card key={course._id} className="relative overflow-hidden group fade-in" style={{ 
                  animationDelay: `${index * 0.1}s`,
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                  <div className="relative h-56 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20"></div>
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                    
                    {/* Progress Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 backdrop-blur-md">
                        {course.enrollment?.progress || 0}% Complete
                      </Badge>
                    </div>

                    {/* Continue Button */}
                    <div className="absolute bottom-4 right-4">
                      <Button 
                        onClick={() => navigate(`/courses/${course._id}?continue=true`)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                    <p className="text-white/70 text-sm mb-4">{course.instructor.name}</p>
                    <div className="flex items-center justify-between text-white/60 text-sm">
                      <span>{course.totalLessons} lessons</span>
                      <span>{Math.round(course.duration)} hours</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        
        {/* Advanced Search and Filters */}
        <Card className="mb-8 slide-in-top" style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
          e.currentTarget.style.backdropFilter = 'blur(25px) saturate(200%)'
          ;(e.currentTarget.style as any).WebkitBackdropFilter = 'blur(25px) saturate(200%)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
          e.currentTarget.style.backdropFilter = 'blur(20px) saturate(180%)'
          ;(e.currentTarget.style as any).WebkitBackdropFilter = 'blur(20px) saturate(180%)'
        }}>
          <CardContent className="p-6" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)' as any
          }}>
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search courses, instructors, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                  e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.5)'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="text-white transition-all duration-300 hover:scale-105" style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="border-gray-700" style={{
                  background: 'rgba(31, 41, 55, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  {categories.map((category) => {
                    const IconComponent = category.icon
                    return (
                      <SelectItem key={category.value} value={category.value} className="text-white hover:bg-gray-700 transition-colors duration-200">
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              {/* Level Filter */}
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="text-white transition-all duration-300 hover:scale-105" style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent className="border-gray-700" style={{
                  background: 'rgba(31, 41, 55, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  {levels.map((level) => (
                    <SelectItem key={level.value} value={level.value} className="text-white hover:bg-gray-700 transition-colors duration-200">
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price Filter */}
              <Select value={selectedPrice} onValueChange={setSelectedPrice}>
                <SelectTrigger className="text-white transition-all duration-300 hover:scale-105" style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent className="border-gray-700" style={{
                  background: 'rgba(31, 41, 55, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  {priceFilters.map((price) => (
                    <SelectItem key={price.value} value={price.value} className="text-white hover:bg-gray-700 transition-colors duration-200">
                      {price.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="text-white transition-all duration-300 hover:scale-105" style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="border-gray-700" style={{
                  background: 'rgba(31, 41, 55, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  {sortOptions.map((sort) => (
                    <SelectItem key={sort.value} value={sort.value} className="text-white hover:bg-gray-700 transition-colors duration-200">
                      {sort.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="transition-all duration-300 hover:scale-105" style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#93c5fd'
                }}>
                  {categories.find(c => c.value === selectedCategory)?.label}
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className="ml-2 text-blue-300 hover:text-white transition-colors duration-200"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedLevel !== 'all' && (
                <Badge variant="secondary" className="transition-all duration-300 hover:scale-105" style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  color: '#86efac'
                }}>
                  {levels.find(l => l.value === selectedLevel)?.label}
                  <button 
                    onClick={() => setSelectedLevel('all')}
                    className="ml-2 text-green-300 hover:text-white transition-colors duration-200"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedPrice !== 'all' && (
                <Badge variant="secondary" className="transition-all duration-300 hover:scale-105" style={{
                  background: 'rgba(168, 85, 247, 0.2)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: '#d8b4fe'
                }}>
                  {priceFilters.find(p => p.value === selectedPrice)?.label}
                  <button 
                    onClick={() => setSelectedPrice('all')}
                    className="ml-2 text-purple-300 hover:text-white transition-colors duration-200"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="transition-all duration-300 hover:scale-105" style={{
                  background: 'rgba(251, 146, 60, 0.2)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                  border: '1px solid rgba(251, 146, 60, 0.3)',
                  color: '#fdba74'
                }}>
                  Search: "{searchTerm}"
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-2 text-orange-300 hover:text-white transition-colors duration-200"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {(selectedCategory !== 'all' || selectedLevel !== 'all' || selectedPrice !== 'all' || searchTerm) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedLevel('all')
                    setSelectedPrice('all')
                    setSearchTerm('')
                  }}
                  className="transition-all duration-300 hover:scale-105 text-white font-medium"
                  style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: '#ffffff',
                    boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.6)'
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.4)'
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course: Course, index: number) => (
            <Card key={course._id} className="relative overflow-hidden group fade-in" style={{ 
              animationDelay: `${index * 0.1}s`,
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.backdropFilter = 'blur(25px) saturate(200%)'
              ;(e.currentTarget.style as any).WebkitBackdropFilter = 'blur(25px) saturate(200%)'
              
              // Track hover as additional view
              trackCourseView(course._id)
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
              e.currentTarget.style.backdropFilter = 'blur(20px) saturate(180%)'
              ;(e.currentTarget.style as any).WebkitBackdropFilter = 'blur(20px) saturate(180%)'
            }}>
              {/* Glassmorphism overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              
              {/* Course Image */}
              <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                
                {/* Glassmorphism top badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between">
                  <div className="flex gap-2">
                    <Badge className={`border backdrop-blur-md ${getLevelColor(course.level)}`} style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}>
                      {course.level}
                    </Badge>
                    
                    {/* Show draft/approval status for teacher courses */}
                    {user?.role === 'teacher' && course.instructor._id === user._id && (
                      <>
                        {!course.published && (
                          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 backdrop-blur-md">
                            Draft
                          </Badge>
                        )}
                        {course.published && !course.approvedByAdmin && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 backdrop-blur-md">
                            Pending Approval
                          </Badge>
                        )}
                        {course.published && course.approvedByAdmin && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-md">
                            Published
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => handleBookmark(course._id)}
                    className="w-8 h-8 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                      e.currentTarget.style.transform = 'scale(1.05) rotate(15deg)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                      e.currentTarget.style.transform = 'scale(1) rotate(0deg)'
                    }}
                  >
                    <Heart className={`w-4 h-4 transition-colors duration-300 ${bookmarkedCourses.includes(course._id) ? 'text-red-400 fill-red-400' : 'text-white/70 hover:text-red-400'}`} />
                  </button>
                </div>

                {/* Enrollment status badge */}
                {course.isEnrolled && (
                  <div className="absolute top-16 left-4">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-md">
                      Enrolled
                    </Badge>
                  </div>
                )}

                {/* Price badge */}
                <div className="absolute bottom-4 left-4">
                  {course.price === 0 ? (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-md">
                      Free
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 backdrop-blur-md">
                      ${course.price}
                    </Badge>
                  )}
                </div>

                {/* Play button overlay */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="bg-blue-500 hover:bg-blue-600 text-white backdrop-blur-md"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>

              <CardContent className="p-6" style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)'
              }}>
                {/* Title */}
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2 transition-colors duration-300 group-hover:text-blue-300">
                  {course.title}
                </h3>
                
                {/* Instructor */}
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-4 h-4 text-white/70" />
                  <p className="text-white/80 text-sm">{course.instructor.name}</p>
                </div>

                {/* Course Stats */}
                <div className="flex items-center justify-between mb-4 p-3 rounded-lg" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white font-medium">{course.rating.average}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-white/50" />
                      <span className="text-white/70 text-sm">{course.enrolledCount.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-blue-400" />
                    <span className="text-white/70 text-sm">{courseViews[course._id] || 0}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-white/70 text-sm mb-4 line-clamp-2">{course.description}</p>

                {/* Course details */}
                <div className="flex items-center gap-4 mb-4 text-xs text-white/50">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    <span>{course.totalLessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{Math.round(course.duration)}h</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {user?.role === 'teacher' && course.instructor._id === user._id ? (
                    // Teacher course actions
                    <Button 
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="flex-1 transition-all duration-300 hover:scale-105" 
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Manage Course
                    </Button>
                  ) : course.isEnrolled ? (
                    // Enrolled student actions
                    <Button 
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="flex-1 transition-all duration-300 hover:scale-105" 
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  ) : (
                    // Not enrolled - show enroll button (only if course is published and approved)
                    course.published && course.approvedByAdmin && (
                      <Button 
                        onClick={() => handleEnroll(course._id)}
                        disabled={processingPayment === course._id}
                        className={`flex-1 transition-all duration-300 hover:scale-105 ${course.price === 0 ? 'from-green-500 to-emerald-600' : 'from-blue-500 to-purple-600'}`}
                        style={{
                          background: course.price === 0 
                            ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          backdropFilter: 'blur(10px)',
                          WebkitBackdropFilter: 'blur(10px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          opacity: processingPayment === course._id ? 0.7 : 1
                        }}
                      >
                        {processingPayment === course._id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Processing...
                          </>
                        ) : course.price === 0 ? (
                          <>
                            <Target className="w-4 h-4 mr-2" />
                            Enroll Free
                          </>
                        ) : (
                          <>
                            <span className="mr-2 font-bold">$</span>
                            {course.price}
                            <span className="ml-2 text-sm">Buy Now</span>
                          </>
                        )}
                      </Button>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-white/50" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">No courses found</h3>
            <p className="text-white/70 mb-6 max-w-md mx-auto">
              Try adjusting your search terms or filters to find the perfect course for you
            </p>
            <Button 
              onClick={() => {
                setSelectedCategory('all')
                setSelectedLevel('all')
                setSelectedPrice('all')
                setSearchTerm('')
              }}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Load More Section */}
        {filteredCourses.length > 0 && filteredCourses.length < courses.length && (
          <div className="text-center mt-16 mb-8">
            <Button 
              variant="outline" 
              className="group relative overflow-hidden transition-all duration-500 ease-out"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '16px',
                padding: '12px 32px',
                fontSize: '16px',
                fontWeight: '600',
                color: '#ffffff',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                transform: 'translateY(0) scale(1)',
                opacity: '0.9'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.backdropFilter = 'blur(25px) saturate(200%)'
                ;(e.currentTarget.style as any).WebkitBackdropFilter = 'blur(25px) saturate(200%)'
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)'
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.backdropFilter = 'blur(20px) saturate(180%)'
                ;(e.currentTarget.style as any).WebkitBackdropFilter = 'blur(20px) saturate(180%)'
                e.currentTarget.style.opacity = '0.9'
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Glassmorphism overlay effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Button content with animation */}
              <div className="relative flex items-center justify-center">
                <span className="transition-all duration-300 group-hover:text-blue-300">Load More Courses</span>
                <ChevronRight 
                  className="w-4 h-4 ml-2 transition-all duration-300 group-hover:translate-x-1 group-hover:text-blue-300" 
                />
              </div>
              
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </Button>
            
            {/* Additional visual elements */}
            <div className="mt-4 flex items-center justify-center gap-2 text-white/50 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Showing {filteredCourses.length} of {courses.length} courses</span>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedCourse && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedCourse(null)
          }}
          course={{
            id: selectedCourse._id,
            title: selectedCourse.title,
            price: selectedCourse.price,
            thumbnail: selectedCourse.thumbnail,
            instructor: selectedCourse.instructor.name
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}

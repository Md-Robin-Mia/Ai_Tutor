import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

interface Lesson {
  id: string
  title: string
  type: 'video' | 'text' | 'assignment' | 'quiz'
  duration: number
  content?: string
  videoUrl?: string
  pdfUrl?: string
  assignmentInstructions?: string
  order: number
  isPreview: boolean
  resources?: Array<{
    name: string
    url: string
    type: 'pdf' | 'link' | 'download'
  }>
}

interface Module {
  id: string
  title: string
  description?: string
  order: number
  lessons: Lesson[]
}

interface Course {
  _id: string
  title: string
  description: string
  thumbnail: string
  instructor: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string
  price: number
  isFree: boolean
  published: boolean
  approvedByAdmin: boolean
  tags: string[]
  requirements: string[]
  whatYouLearn: string[]
  targetAudience: string[]
  lessons: Array<{
    _id: string
    title: string
    description: string
    duration: number
    videoUrl?: string
    pdfUrl?: string
    assignmentInstructions?: string
    order: number
    isPreview: boolean
    resources?: Array<{
      name: string
      url: string
      type: 'pdf' | 'link' | 'download'
    }>
  }>
  modules?: Module[] // For backward compatibility
  totalDuration: number
  totalLessons: number
  enrolledStudents: string[]
  enrolledCount: number
  rating: {
    average: number
    count: number
  }
  createdAt: Date
  updatedAt: Date
}

export default function CourseViewer() {
  const { courseId, continue: continueParam } = useParams<{ courseId?: string; continue?: string }>()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentLesson, setCurrentLesson] = useState<string | null>(null)
  const [currentModule, setCurrentModule] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])

  useEffect(() => {
    // Fetch course data and track initial progress
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Handle both numeric and string course IDs
        const courseApiPath = courseId && !isNaN(Number(courseId)) 
          ? `/api/courses/by-id/${courseId}` 
          : `/api/courses/${courseId}`
        
        const response = await fetch(courseApiPath, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const courseData = await response.json()
          setCourse(courseData)
          
          // Handle continue logic
          if (continueParam === 'true' && courseData.isEnrolled) {
            // Get student's progress for this course
            const progressResponse = await fetch(`/api/courses/student/enrolled`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
            
            if (progressResponse.ok) {
              const progressData = await progressResponse.json()
              const enrolledCourse = progressData.courses.find((c: any) => c._id === courseData._id)
              
              if (enrolledCourse && enrolledCourse.enrollment) {
                // Set completed lessons
                if (enrolledCourse.enrollment.lessonsCompleted) {
                  setCompletedLessons(enrolledCourse.enrollment.lessonsCompleted)
                }
                
                // Find next lesson to continue from
                let nextLesson = null
                
                if (courseData.lessons && courseData.lessons.length > 0) {
                  for (const lesson of courseData.lessons) {
                    // Check if this lesson is not completed yet
                    if (!enrolledCourse.enrollment.lessonsCompleted || 
                        !enrolledCourse.enrollment.lessonsCompleted.includes(lesson._id)) {
                      nextLesson = lesson._id
                      break
                    }
                  }
                  
                  // If all lessons are completed, start with first lesson
                  if (!nextLesson && courseData.lessons[0]) {
                    nextLesson = courseData.lessons[0]._id
                  }
                }
                
                if (nextLesson) {
                  setCurrentLesson(nextLesson)
                  setCurrentModule('default') // Since we don't have modules
                  setProgress(enrolledCourse.enrollment.progress || 0)
                }
              }
            }
          } else if (courseData.lessons && courseData.lessons.length > 0) {
            // If this is the first time starting the course, track initial progress
            await trackCourseProgress(courseData._id, courseData.lessons[0]._id, 'default', 0, 0)
            setCurrentLesson(courseData.lessons[0]._id)
            setCurrentModule('default')
          }
        } else if (response.status === 401 || response.status === 403 || response.status === 404) {
          const errorData = await response.json()
          console.error('Course access error:', errorData)
          
          // Show specific error message based on error type
          let errorMessage = ''
          switch (errorData.errorType) {
            case 'COURSE_NOT_EXIST':
              errorMessage = `The course doesn't exist\n\nThe course ID may be invalid or the course was never created`
              break
            case 'COURSE_NOT_PUBLISHED':
              errorMessage = `The course is not published yet\n\nThis course is still in draft mode and not available to students`
              break
            case 'COURSE_NOT_APPROVED':
              errorMessage = `The course is not approved yet\n\nThis course is pending admin approval and not available to students`
              break
            case 'PERMISSION_DENIED':
              errorMessage = `You don't have permission to view this course\n\nThis may be a private course or requires enrollment`
              break
            case 'COURSE_REMOVED':
              errorMessage = `The course has been removed by the instructor\n\nThe course may have been temporarily or permanently removed`
              break
            case 'AUTHENTICATION_REQUIRED':
              errorMessage = `Authentication required\n\nYou need to be logged in to view this course`
              break
            case 'INVALID_TOKEN':
              errorMessage = `Authentication required\n\nYour authentication token is invalid or has expired. Please log in again.`
              break
            case 'INVALID_USER':
              errorMessage = `Authentication required\n\nYour account is not active or the authentication token is invalid. Please contact support.`
              break
            default:
              errorMessage = `${errorData.message}\n\n${errorData.details || 'Please check the course URL and try again'}`
          }
          alert(errorMessage)
        } else {
          console.error('Failed to fetch course:', response.status, response.statusText)
          alert(`Failed to fetch course: ${response.status} ${response.statusText}`)
        }
      } catch (error) {
        console.error('Failed to fetch course:', error)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId, continueParam])

  const trackCourseProgress = async (courseId: string, lessonId: string, moduleId: string, duration: number, completionPercentage: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lessonId,
          moduleId,
          duration,
          completionPercentage,
          quizScore: 0
        })
      })
      
      if (response.ok) {
        const updatedProgress = await response.json()
        setProgress(updatedProgress.completionPercentage)
        
        // Update completed lessons if this lesson is marked as complete
        if (completionPercentage >= 100) {
          setCompletedLessons(prev => [...prev.filter(id => id !== lessonId), lessonId])
        }
        
        // Update current lesson
        if (updatedProgress.currentLesson) {
          setCurrentLesson(updatedProgress.currentLesson)
        }
        if (updatedProgress.currentModule) {
          setCurrentModule(updatedProgress.currentModule)
        }
      }
    } catch (error) {
      console.error('Failed to track course progress:', error)
    }
  }

  const markLessonComplete = async (lessonId: string, moduleId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lessonId,
          moduleId,
          duration: 10, // Default 10 minutes per lesson
          completionPercentage: 100,
          quizScore: 0
        })
      })
      
      if (response.ok) {
        const updatedProgress = await response.json()
        setProgress(updatedProgress.completionPercentage)
        
        // Update completed lessons state
        setCompletedLessons(prev => [...prev, lessonId])
        
        // Find next lesson and automatically navigate to it
        if (course && course.lessons) {
          let nextLesson = null
          let foundCurrent = false
          
          for (const lesson of course.lessons) {
            if (foundCurrent) {
              nextLesson = lesson._id
              break
            }
            if (lesson._id === lessonId) {
              foundCurrent = true
            }
          }
          
          // If there's a next lesson, set it as current
          if (nextLesson) {
            setCurrentLesson(nextLesson)
            setCurrentModule('default')
            // Track progress for the next lesson
            await trackCourseProgress(courseId!, nextLesson, 'default', 5, 0)
          }
        }
        
        // Update current lesson if returned by API
        if (updatedProgress.currentLesson) {
          setCurrentLesson(updatedProgress.currentLesson)
        }
        if (updatedProgress.currentModule) {
          setCurrentModule(updatedProgress.currentModule)
        }
      }
    } catch (error) {
      console.error('Failed to mark lesson complete:', error)
    }
  }

  const startLesson = async (lessonId: string, moduleId: string) => {
    setCurrentLesson(lessonId)
    setCurrentModule(moduleId)
    
    // Track progress when starting a lesson
    await trackCourseProgress(courseId!, lessonId, moduleId, 5, 0) // Track 5 minutes of initial progress
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background-color)' }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-white">Loading course...</div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background-color)' }}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-400">Course not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background-color)' }}>
      <div className="container mx-auto p-4">
        {/* Course Header */}
        <div className="dashboard-header mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                📚 {course.title}
              </h1>
              <p className="text-white/80 text-lg mb-4">
                {course.description}
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 pulse"></div>
                  <span className="text-white/70 text-sm font-medium">
                    {course.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                  <span className="text-white/70 text-sm font-medium">
                    {course.level}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                  <span className="text-white/70 text-sm font-medium">
                    {course.isFree ? 'Free' : 'Paid'}
                  </span>
                </div>
              </div>
              <div className="text-white/60 text-sm mt-2">
                <span>Category: {course.category}</span>
                <span>•</span>
                <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => navigate('/student-dashboard')}
                className="btn-primary interactive-element px-6 py-3"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="dashboard-card mb-6 fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">📊 Course Progress</h3>
            <div className="text-white/80 text-sm">
              {progress}% Complete
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700/50 rounded-full h-8 overflow-hidden shadow-inner backdrop-filter backdrop-blur-sm">
            <div 
              className="h-8 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-700 shadow-lg relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-xs font-bold">
                {progress}%
              </div>
            </div>
          </div>
          
          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="stats-card group cursor-pointer interactive-element">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {course.totalLessons || course.lessons?.length || 0}
                </div>
                <div className="text-sm text-gray-300">
                  Total Lessons
                </div>
              </div>
            </div>
            <div className="stats-card group cursor-pointer interactive-element">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {completedLessons.length}
                </div>
                <div className="text-sm text-gray-300">
                  Completed
                </div>
              </div>
            </div>
            <div className="stats-card group cursor-pointer interactive-element">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">
                  {Math.round(progress)}%
                </div>
                <div className="text-sm text-gray-300">
                  Complete
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="dashboard-card mb-6 fade-in">
          <h3 className="text-xl font-bold text-white mb-4">📚 Course Content</h3>
          
          {/* Lessons */}
          <div className="space-y-3">
            {course.lessons.map((lesson, lessonIndex) => {
              const isCompleted = completedLessons.includes(lesson._id)
              const isCurrent = currentLesson === lesson._id
              
              return (
                <div 
                  key={lesson._id} 
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 cursor-pointer ${
                    isCurrent 
                      ? 'bg-blue-500/20 border-blue-400' 
                      : isCompleted 
                        ? 'bg-green-500/20 border-green-400'
                        : 'border-gray-600 hover:border-blue-400'
                  }`}
                  onClick={() => !isCompleted && startLesson(lesson._id, 'default')}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      isCompleted 
                        ? 'bg-green-500' 
                        : isCurrent 
                          ? 'bg-blue-500' 
                          : 'bg-gray-600'
                    }`}>
                      {isCompleted ? '✓' : lessonIndex + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{lesson.title}</div>
                      <div className="text-xs text-gray-400">
                        {lesson.duration}min • {lesson.isPreview ? 'Preview' : 'Full Lesson'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isCurrent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markLessonComplete(lesson._id, 'default')
                        }}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded-md transition-colors duration-200"
                      >
                        Mark Complete
                      </button>
                    )}
                    <span className="text-xs text-gray-400">
                      {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Start'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Course Actions */}
        <div className="flex justify-center space-x-4 mb-6">
          <button 
            onClick={() => navigate('/student-dashboard')}
            className="btn-primary interactive-element px-6 py-3"
          >
            ← Back to Dashboard
          </button>
          <button 
            onClick={() => navigate(`/courses/${course._id}?continue=true`)}
            className="btn-primary interactive-element px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg glow" // Continue Learning button
          >
            Continue Learning →
          </button>
        </div>
      </div>
    </div>
  )
}

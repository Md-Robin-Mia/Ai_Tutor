import { useState, useEffect } from 'react'
import { BookOpen, Clock, Target, TrendingUp, Award, Calendar, BarChart3, PieChart, Activity, Zap, CheckCircle, PlayCircle, Lock, Star, Flame, Brain, Users } from 'lucide-react'

interface CourseProgress {
  id: string
  title: string
  thumbnail?: string
  instructor: string
  totalLessons: number
  completedLessons: number
  progress: number
  timeSpent: number
  lastAccessed: string
  status: 'not_started' | 'in_progress' | 'completed'
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface LearningStats {
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  totalLessons: number
  completedLessons: number
  totalTimeSpent: number
  currentStreak: number
  longestStreak: number
  averageProgress: number
  weeklyHours: number[]
}

export default function StudentProgress() {
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null)

  // Mock data
  const mockCourseProgress: CourseProgress[] = [
    {
      id: '1',
      title: 'Advanced JavaScript Concepts',
      instructor: 'John Doe',
      totalLessons: 12,
      completedLessons: 8,
      progress: 67,
      timeSpent: 480,
      lastAccessed: '2024-01-15',
      status: 'in_progress',
      category: 'Programming',
      difficulty: 'advanced'
    },
    {
      id: '2',
      title: 'React Development Masterclass',
      instructor: 'Jane Smith',
      totalLessons: 15,
      completedLessons: 15,
      progress: 100,
      timeSpent: 720,
      lastAccessed: '2024-01-14',
      status: 'completed',
      category: 'Programming',
      difficulty: 'intermediate'
    },
    {
      id: '3',
      title: 'Introduction to Machine Learning',
      instructor: 'Dr. Alan Turing',
      totalLessons: 20,
      completedLessons: 3,
      progress: 15,
      timeSpent: 120,
      lastAccessed: '2024-01-13',
      status: 'in_progress',
      category: 'Data Science',
      difficulty: 'beginner'
    },
    {
      id: '4',
      title: 'Web Design Fundamentals',
      instructor: 'Sarah Johnson',
      totalLessons: 10,
      completedLessons: 0,
      progress: 0,
      timeSpent: 0,
      lastAccessed: '',
      status: 'not_started',
      category: 'Design',
      difficulty: 'beginner'
    },
    {
      id: '5',
      title: 'Python for Data Analysis',
      instructor: 'Mike Wilson',
      totalLessons: 18,
      completedLessons: 12,
      progress: 67,
      timeSpent: 540,
      lastAccessed: '2024-01-12',
      status: 'in_progress',
      category: 'Data Science',
      difficulty: 'intermediate'
    }
  ]

  const mockLearningStats: LearningStats = {
    totalCourses: 5,
    completedCourses: 1,
    inProgressCourses: 3,
    totalLessons: 75,
    completedLessons: 38,
    totalTimeSpent: 1860,
    currentStreak: 7,
    longestStreak: 14,
    averageProgress: 50,
    weeklyHours: [2.5, 3.2, 1.8, 4.1, 2.9, 3.5, 2.2]
  }

  useEffect(() => {
    setTimeout(() => {
      setCourseProgress(mockCourseProgress)
      setLearningStats(mockLearningStats)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
      case 'in_progress':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30'
      case 'not_started':
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-300'
      case 'intermediate':
        return 'text-yellow-300'
      case 'advanced':
        return 'text-red-300'
      default:
        return 'text-gray-300'
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card-advanced p-6 animate-pulse">
              <div className="h-20 bg-white/10 rounded-xl backdrop-blur-sm"></div>
            </div>
          ))}
        </div>
        <div className="glass-card-advanced p-8 animate-pulse">
          <div className="h-64 bg-white/10 rounded-xl backdrop-blur-sm"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Learning Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card-advanced p-6 group hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-black text-white">{learningStats?.totalCourses || 0}</div>
            </div>
            <div className="text-blue-300 font-bold text-sm mb-2">Total Courses</div>
            <div className="flex items-center gap-2 text-blue-400 text-xs">
              <Target className="w-3 h-3" />
              <span>Enrolled</span>
            </div>
          </div>
        </div>

        <div className="glass-card-advanced p-6 group hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-black text-white">{learningStats?.completedCourses || 0}</div>
            </div>
            <div className="text-green-300 font-bold text-sm mb-2">Completed</div>
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <Award className="w-3 h-3" />
              <span>Certified</span>
            </div>
          </div>
        </div>

        <div className="glass-card-advanced p-6 group hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-black text-white">{learningStats?.currentStreak || 0}</div>
            </div>
            <div className="text-orange-300 font-bold text-sm mb-2">Current Streak</div>
            <div className="flex items-center gap-2 text-orange-400 text-xs">
              <Zap className="w-3 h-3" />
              <span>Days active</span>
            </div>
          </div>
        </div>

        <div className="glass-card-advanced p-6 group hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-all duration-500">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-black text-white">{formatTime(learningStats?.totalTimeSpent || 0)}</div>
            </div>
            <div className="text-purple-300 font-bold text-sm mb-2">Total Time</div>
            <div className="flex items-center gap-2 text-purple-400 text-xs">
              <Activity className="w-3 h-3" />
              <span>Learning hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Charts and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <div className="glass-card-advanced p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            Weekly Activity
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-white/60 mb-2">
              <span>Day</span>
              <span>Hours</span>
            </div>
            {learningStats?.weeklyHours.map((hours, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-16 text-xs text-white/70">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </div>
                <div className="flex-1 bg-white/10 rounded-full h-6 backdrop-blur-sm overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                    style={{ width: `${(hours / 5) * 100}%` }}
                  >
                    <span className="text-xs text-white font-bold">{hours}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Weekly Total</span>
              <span className="text-white font-bold">
                {learningStats?.weeklyHours.reduce((sum, hours) => sum + hours, 0).toFixed(1)}h
              </span>
            </div>
          </div>
        </div>

        {/* Progress Distribution */}
        <div className="glass-card-advanced p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <PieChart className="w-4 h-4 text-white" />
            </div>
            Progress Distribution
          </h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-400">Completed</span>
                <span className="text-white font-bold">{learningStats?.completedCourses || 0} courses</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4 backdrop-blur-sm">
                <div 
                  className="h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${((learningStats?.completedCourses || 0) / (learningStats?.totalCourses || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-blue-400">In Progress</span>
                <span className="text-white font-bold">{learningStats?.inProgressCourses || 0} courses</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4 backdrop-blur-sm">
                <div 
                  className="h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${((learningStats?.inProgressCourses || 0) / (learningStats?.totalCourses || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Not Started</span>
                <span className="text-white font-bold">{(learningStats?.totalCourses || 0) - (learningStats?.completedCourses || 0) - (learningStats?.inProgressCourses || 0)} courses</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4 backdrop-blur-sm">
                <div 
                  className="h-4 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full transition-all duration-1000"
                  style={{ width: `${(((learningStats?.totalCourses || 0) - (learningStats?.completedCourses || 0) - (learningStats?.inProgressCourses || 0)) / (learningStats?.totalCourses || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="flex justify-between text-sm">
              <span className="text-white/60">Average Progress</span>
              <span className="text-white font-bold">{learningStats?.averageProgress || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress List */}
      <div className="glass-card-advanced p-8">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            Course Progress
          </h3>
        </div>

        <div className="space-y-4">
          {courseProgress.map((course, index) => (
            <div
              key={course.id}
              className="glass-card-mini p-6 hover:scale-102 transition-all duration-300 cursor-pointer"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-blue-500/30">
                    <BookOpen className="w-8 h-8 text-blue-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg mb-1">{course.title}</h4>
                    <p className="text-white/70 text-sm mb-2">by {course.instructor}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`px-2 py-1 rounded-full backdrop-blur-sm border ${getStatusColor(course.status)}`}>
                        {course.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full ${getDifficultyColor(course.difficulty)}`}>
                        {course.difficulty.toUpperCase()}
                      </span>
                      <span className="text-white/60">{course.category}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white mb-1">{course.progress}%</div>
                  <div className="text-sm text-white/60">{course.completedLessons}/{course.totalLessons} lessons</div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 relative overflow-hidden ${
                        course.status === 'completed' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : course.status === 'in_progress'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                          : 'bg-gradient-to-r from-gray-500 to-gray-600'
                      }`}
                      style={{ width: `${course.progress}%` }}
                    >
                      {course.status === 'in_progress' && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-white/60">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(course.timeSpent)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(course.lastAccessed)}</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors duration-200">
                    {course.status === 'not_started' ? (
                      <>
                        <PlayCircle className="w-3 h-3" />
                        Start
                      </>
                    ) : course.status === 'completed' ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        Review
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3 h-3" />
                        Continue
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

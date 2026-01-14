import { useState, useEffect } from 'react'
import { BookOpen, Clock, Star, Users, DollarSign, PlayCircle, Lock, CheckCircle, Search, Filter, TrendingUp, Award, Calendar, BarChart3, Heart, Share2, Download, ChevronRight, Zap, Target, Brain, Code, Palette, Music, Camera, Globe, Calculator, Microscope } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  instructor: string
  instructorAvatar?: string
  thumbnail?: string
  price: number
  originalPrice?: number
  rating: number
  reviews: number
  students: number
  duration: number
  lessons: number
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  tags: string[]
  language: string
  certificate: boolean
  lastUpdated: string
  isEnrolled: boolean
  progress?: number
  completedLessons?: number
  isBookmarked: boolean
  isFeatured: boolean
}

export default function StudentCourses() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [sortBy, setSortBy] = useState('progress')
  const [showFilters, setShowFilters] = useState(false)
  const [bookmarkedCourses, setBookmarkedCourses] = useState<string[]>([])

  // Mock data - only enrolled courses
  const mockCourses: Course[] = [
    {
      id: '1',
      title: 'Advanced JavaScript Concepts',
      description: 'Master advanced JavaScript concepts including closures, prototypes, async programming, and modern ES6+ features.',
      instructor: 'John Doe',
      instructorAvatar: '/api/placeholder/40/40',
      thumbnail: '/api/placeholder/400/250',
      price: 49.99,
      originalPrice: 89.99,
      rating: 4.8,
      reviews: 234,
      students: 15420,
      duration: 12,
      lessons: 45,
      level: 'advanced',
      category: 'Programming',
      tags: ['JavaScript', 'ES6', 'Async', 'Node.js'],
      language: 'English',
      certificate: true,
      lastUpdated: '2024-01-15',
      isEnrolled: true,
      progress: 67,
      completedLessons: 30,
      isBookmarked: true,
      isFeatured: true
    },
    {
      id: '2',
      title: 'React Development Masterclass',
      description: 'Complete guide to React development including hooks, context API, Redux, and building production-ready applications.',
      instructor: 'Jane Smith',
      instructorAvatar: '/api/placeholder/40/40',
      thumbnail: '/api/placeholder/400/250',
      price: 39.99,
      originalPrice: 69.99,
      rating: 4.9,
      reviews: 512,
      students: 28930,
      duration: 15,
      lessons: 62,
      level: 'intermediate',
      category: 'Programming',
      tags: ['React', 'Hooks', 'Redux', 'Next.js'],
      language: 'English',
      certificate: true,
      lastUpdated: '2024-01-14',
      isEnrolled: true,
      progress: 100,
      completedLessons: 62,
      isBookmarked: false,
      isFeatured: true
    },
    {
      id: '3',
      title: 'Introduction to Machine Learning',
      description: 'Learn the fundamentals of machine learning, including supervised and unsupervised learning, neural networks, and deep learning basics.',
      instructor: 'Dr. Alan Turing',
      instructorAvatar: '/api/placeholder/40/40',
      thumbnail: '/api/placeholder/400/250',
      price: 59.99,
      originalPrice: 99.99,
      rating: 4.7,
      reviews: 189,
      students: 12340,
      duration: 20,
      lessons: 78,
      level: 'beginner',
      category: 'Data Science',
      tags: ['Machine Learning', 'Python', 'Neural Networks', 'AI'],
      language: 'English',
      certificate: true,
      lastUpdated: '2024-01-13',
      isEnrolled: true,
      progress: 15,
      completedLessons: 12,
      isBookmarked: true,
      isFeatured: false
    },
    {
      id: '5',
      title: 'Python for Data Analysis',
      description: 'Learn Python programming for data analysis, including pandas, numpy, matplotlib, and data visualization techniques.',
      instructor: 'Mike Wilson',
      instructorAvatar: '/api/placeholder/40/40',
      thumbnail: '/api/placeholder/400/250',
      price: 44.99,
      originalPrice: 79.99,
      rating: 4.8,
      reviews: 298,
      students: 19870,
      duration: 18,
      lessons: 56,
      level: 'intermediate',
      category: 'Data Science',
      tags: ['Python', 'Pandas', 'NumPy', 'Data Visualization'],
      language: 'English',
      certificate: true,
      lastUpdated: '2024-01-11',
      isEnrolled: true,
      progress: 67,
      completedLessons: 38,
      isBookmarked: true,
      isFeatured: true
    }
  ]

  const categories = [
    { value: 'all', label: 'All Categories', icon: <Globe className="w-4 h-4" /> },
    { value: 'Programming', label: 'Programming', icon: <Code className="w-4 h-4" /> },
    { value: 'Design', label: 'Design', icon: <Palette className="w-4 h-4" /> },
    { value: 'Data Science', label: 'Data Science', icon: <Brain className="w-4 h-4" /> },
    { value: 'Marketing', label: 'Marketing', icon: <TrendingUp className="w-4 h-4" /> },
    { value: 'Music', label: 'Music', icon: <Music className="w-4 h-4" /> },
    { value: 'Photography', label: 'Photography', icon: <Camera className="w-4 h-4" /> }
  ]

  const levels = [
    { value: 'all', label: 'All Levels' },
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ]

  const sortOptions = [
    { value: 'progress', label: 'Progress' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'newest', label: 'Recently Updated' },
    { value: 'title', label: 'Alphabetical' }
  ]

  useEffect(() => {
    setTimeout(() => {
      setCourses(mockCourses)
      setFilteredCourses(mockCourses)
      setBookmarkedCourses(mockCourses.filter(course => course.isBookmarked).map(course => course.id))
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    let filtered = courses

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory)
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return (b.progress || 0) - (a.progress || 0)
        case 'rating':
          return b.rating - a.rating
        case 'newest':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    setFilteredCourses(filtered)
  }, [courses, searchTerm, selectedCategory, selectedLevel, sortBy])

  const getCategoryIcon = (category: string) => {
    const categoryMap: { [key: string]: JSX.Element } = {
      'Programming': <Code className="w-4 h-4" />,
      'Design': <Palette className="w-4 h-4" />,
      'Data Science': <Brain className="w-4 h-4" />,
      'Marketing': <TrendingUp className="w-4 h-4" />,
      'Music': <Music className="w-4 h-4" />,
      'Photography': <Camera className="w-4 h-4" />
    }
    return categoryMap[category] || <BookOpen className="w-4 h-4" />
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'text-green-300 bg-green-500/20 border-green-500/30'
      case 'intermediate':
        return 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30'
      case 'advanced':
        return 'text-red-300 bg-red-500/20 border-red-500/30'
      default:
        return 'text-gray-300 bg-gray-500/20 border-gray-500/30'
    }
  }

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours}h`
    }
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleEnroll = (courseId: string) => {
    // Handle enrollment logic
    console.log('Enrolling in course:', courseId)
  }

  const handleBookmark = (courseId: string) => {
    setBookmarkedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleShare = (courseId: string) => {
    // Handle sharing logic
    console.log('Sharing course:', courseId)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card-advanced p-8 animate-pulse">
          <div className="h-12 bg-white/10 rounded-xl backdrop-blur-sm mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white/10 rounded-xl backdrop-blur-sm h-80"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="glass-card-advanced p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              My Courses
            </h2>
            <p className="text-white/70">Track your progress and continue learning your enrolled courses</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/20 transition-all duration-300"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="glass-button-secondary flex items-center gap-2 px-4 py-2"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all duration-300"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value} className="bg-gray-800">
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-white/70 text-sm mb-2 block">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all duration-300"
              >
                {levels.map(level => (
                  <option key={level.value} value={level.value} className="bg-gray-800">
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="text-white/70 text-sm mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40 transition-all duration-300"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-gray-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{courses.length}</div>
            <div className="text-white/60 text-sm">My Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{courses.filter(course => course.progress === 100).length}</div>
            <div className="text-white/60 text-sm">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{bookmarkedCourses.length}</div>
            <div className="text-white/60 text-sm">Bookmarked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {courses.filter(course => course.isFeatured).length}
            </div>
            <div className="text-white/60 text-sm">Featured</div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => (
          <div
            key={course.id}
            className="glass-card-advanced overflow-hidden group hover:scale-105 transition-all duration-500 cursor-pointer"
            style={{ 
              animationDelay: `${index * 0.1}s`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            {/* Course Image */}
            <div className="relative h-48 overflow-hidden">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-white/50" />
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {course.isFeatured && (
                  <div className="px-2 py-1 bg-yellow-500/90 text-yellow-900 text-xs font-bold rounded-full backdrop-blur-sm">
                    FEATURED
                  </div>
                )}
                {course.isEnrolled && (
                  <div className="px-2 py-1 bg-green-500/90 text-green-900 text-xs font-bold rounded-full backdrop-blur-sm">
                    ENROLLED
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleBookmark(course.id)
                  }}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                >
                  <Heart className={`w-4 h-4 ${bookmarkedCourses.includes(course.id) ? 'text-red-400 fill-red-400' : 'text-white'}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleShare(course.id)
                  }}
                  className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors duration-200"
                >
                  <Share2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Course Content */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-bold text-white text-lg mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors duration-300">
                  {course.title}
                </h3>
                <p className="text-white/70 text-sm line-clamp-2 mb-3">
                  {course.description}
                </p>
                
                {/* Instructor */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white/70 text-sm">{course.instructor}</span>
                </div>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {course.tags.slice(0, 3).map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-full backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                  {course.tags.length > 3 && (
                    <span className="px-2 py-1 bg-white/10 text-white/60 text-xs rounded-full backdrop-blur-sm">
                      +{course.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-white/60 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>{course.rating}</span>
                    <span>({course.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    <span>{course.students.toLocaleString()}</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full border backdrop-blur-sm ${getLevelColor(course.level)}`}>
                  {course.level.toUpperCase()}
                </div>
              </div>

              {/* Progress for enrolled courses */}
              {course.isEnrolled && course.progress !== undefined && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Price and CTA */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-white">
                      {formatPrice(course.price)}
                    </span>
                    {course.originalPrice && course.originalPrice > course.price && (
                      <span className="text-sm text-white/50 line-through">
                        {formatPrice(course.originalPrice)}
                      </span>
                    )}
                  </div>
                  {course.certificate && (
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <Award className="w-3 h-3" />
                      <span>Certificate</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEnroll(course.id)
                  }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                    course.isEnrolled
                      ? 'glass-button-secondary flex items-center gap-2'
                      : 'glass-button-primary'
                  }`}
                >
                  {course.isEnrolled ? (
                    <>
                      {course.progress === 100 ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Review
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4" />
                          Continue
                        </>
                      )}
                    </>
                  ) : (
                    'Enroll Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && !loading && (
        <div className="glass-card-advanced p-16 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-blue-300" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">No Enrolled Courses</h3>
          <p className="text-white/70 mb-6 max-w-md mx-auto">
            You haven't enrolled in any courses yet. Browse our course catalog to start your learning journey!
          </p>
          <button
            onClick={() => window.location.href = '/courses'}
            className="glass-button-primary hover:scale-105 transition-all duration-300"
          >
            Browse All Courses
          </button>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import PreviewModal from './PreviewModal'
import { 
  X, 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  TrendingUp, 
  Award, 
  Target,
  Play,
  Calendar,
  User,
  DollarSign,
  Eye,
  Edit,
  BarChart3,
  CheckCircle,
  FileText,
  Video,
  Download,
  Globe,
  Monitor,
  Smartphone,
  Heart,
  Share2
} from 'lucide-react'
import api from '../lib/api'

interface Lesson {
  title: string
  description: string
  duration: number
  videoUrl?: string
  order: number
  isPreview: boolean
}

interface Course {
  _id: string
  title: string
  description: string
  category: { name: string; _id: string }
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
  requirements: string[]
  whatYouLearn: string[]
  targetAudience: string[]
  lessons: Lesson[]
  instructor: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface CourseViewModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (course: Course) => void
  courseId: string | null
}

export default function CourseViewModal({ isOpen, onClose, onEdit, courseId }: CourseViewModalProps) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'details'>('overview')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return

      setLoading(true)
      setImageLoaded(false)
      setError(null)
      
      try {
        const response = await api.get(`/teacher/courses/${courseId}`)
        setCourse(response.data.course)
      } catch (error: any) {
        console.error('Failed to fetch course:', error)
        setError(error.response?.data?.message || 'Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    if (isOpen && courseId) {
      fetchCourse()
    }
  }, [isOpen, courseId])

  const handleEditClick = () => {
    if (course) {
      onEdit(course)
      onClose()
    }
  }

  const handlePreviewClick = () => {
    if (course) {
      setShowPreviewModal(true)
    }
  }

  if (!isOpen || !courseId) return null

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-white ml-4">Loading course...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center max-w-md">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">Course Not Found</h3>
              <p className="text-gray-300 mb-4">{error || 'This course could not be loaded'}</p>
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-left">
                <h4 className="text-white font-medium mb-2">Possible reasons:</h4>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• The course doesn't exist</li>
                  <li>• You don't own this course</li>
                  <li>• The course has been deleted</li>
                  <li>• Authentication issue</li>
                  <li>• Server error occurred</li>
                </ul>
              </div>
              
              <Button
                onClick={onClose}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-t-2xl overflow-hidden">
          {course.thumbnail ? (
            <>
              <img 
                src={`http://localhost:3003${course.thumbnail}`} 
                alt={course.title}
                className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  setImageLoaded(false)
                }}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse">
                    <BookOpen className="w-16 h-16 text-white/30" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-24 h-24 text-white/30" />
            </div>
          )}
          
          {/* Gradient Overlay for better text visibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Status Badges */}
          <div className="absolute top-4 right-4 flex gap-2">
            {course.published && (
              <Badge className="bg-green-500/20 text-green-400 border-green-400/30 backdrop-blur-sm">
                Published
              </Badge>
            )}
            {course.approvedByAdmin && (
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30 backdrop-blur-sm">
                Approved
              </Badge>
            )}
            {!course.published && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-400/30 backdrop-blur-sm">
                Draft
              </Badge>
            )}
          </div>

          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 left-4 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </Button>

          {/* Course Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{course.title}</h1>
            <div className="flex items-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{course.instructor.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{new Date(course.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{course.enrolledCount}</div>
              <div className="text-sm text-gray-400">Students</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-2xl font-bold text-white">{course.rating.average.toFixed(1)}</span>
              </div>
              <div className="text-sm text-gray-400">Rating ({course.rating.count})</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{course.totalLessons}</div>
              <div className="text-sm text-gray-400">Lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{Math.round(course.duration / 60)}h</div>
              <div className="text-sm text-gray-400">Duration</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="bg-blue-500/20 border-blue-400 text-blue-300 hover:bg-blue-400/30 hover:border-blue-300 hover:text-blue-200 transition-all duration-200"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit Course
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviewClick}
              className="bg-purple-500/20 border-purple-400 text-purple-300 hover:bg-purple-400/30 hover:border-purple-300 hover:text-purple-200 transition-all duration-200"
            >
              <Eye className="w-4 h-4 mr-1" />
              Preview
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-white border-b-2 border-blue-400 bg-white/5'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'curriculum'
                ? 'text-white border-b-2 border-blue-400 bg-white/5'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Curriculum
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-white border-b-2 border-blue-400 bg-white/5'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Details
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">About this course</h3>
                <p className="text-gray-300 leading-relaxed">{course.description}</p>
              </div>

              {/* What You'll Learn */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">What you'll learn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.whatYouLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Who this course is for</h3>
                <div className="space-y-2">
                  {course.targetAudience.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Course Content</h3>
              {course.lessons.length > 0 ? (
                <div className="space-y-3">
                  {course.lessons.map((lesson, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <span className="text-purple-400 text-sm font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{lesson.title}</h4>
                            <p className="text-gray-400 text-sm mt-1">{lesson.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.isPreview && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                              Preview
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{lesson.duration}min</span>
                          </div>
                          {lesson.videoUrl && (
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No lessons added yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Course Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Course Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Category</span>
                      <span className="text-white">{course.category.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Level</span>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                        {course.level}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Price</span>
                      <div className="flex items-center gap-2">
                        {course.isFree ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-400/30">
                            Free
                          </Badge>
                        ) : (
                          <span className="text-white font-medium">${course.price}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Status</span>
                      <div className="flex gap-2">
                        <Badge className={course.published ? "bg-green-500/20 text-green-400 border-green-400/30" : "bg-orange-500/20 text-orange-400 border-orange-400/30"}>
                          {course.published ? 'Published' : 'Draft'}
                        </Badge>
                        {course.approvedByAdmin && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                            Approved
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Requirements</h3>
                  <div className="space-y-2">
                    {course.requirements.length > 0 ? (
                      course.requirements.map((req, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{req}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No requirements specified</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-sm text-gray-400">Created</div>
                        <div className="text-white">{new Date(course.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-sm text-gray-400">Last Updated</div>
                        <div className="text-white">{new Date(course.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <PreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        courseId={courseId}
      />
    </div>
  )
}

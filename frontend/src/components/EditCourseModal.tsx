import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { X, Plus, Trash2, BookOpen, DollarSign, Clock, Target, Users, Video, Upload, FileText, Image } from 'lucide-react'
import api from '../lib/api'

interface Lesson {
  title: string
  description: string
  duration: number
  videoUrl?: string
  videoFile?: File
  order: number
  isPreview: boolean
}

interface CourseFormData {
  title: string
  description: string
  category: { name: string; _id: string }
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  price: number
  isFree: boolean
  totalLessons: number
  duration: number
  requirements: string[]
  whatYouLearn: string[]
  targetAudience: string[]
  thumbnail?: File
  thumbnailUrl?: string
  lessons: Lesson[]
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
  createdAt: string
}

interface EditCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (course: Course) => void
  course: Course | null
}

export default function EditCourseModal({ isOpen, onClose, onSuccess, course }: EditCourseModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: { name: '', _id: '' },
    level: 'Beginner',
    price: 0,
    isFree: false,
    totalLessons: 0,
    duration: 0,
    requirements: [''],
    whatYouLearn: [''],
    targetAudience: [''],
    lessons: []
  })

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level as 'Beginner' | 'Intermediate' | 'Advanced',
        price: course.price,
        isFree: course.isFree,
        totalLessons: course.totalLessons,
        duration: course.duration,
        requirements: [''],
        whatYouLearn: [''],
        targetAudience: [''],
        thumbnailUrl: course.thumbnail,
        lessons: []
      })
    }
  }, [course])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories')
        setCategories(response.data.categories || [])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!course) return

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      
      // Add basic course info
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('category', formData.category._id)
      formDataToSend.append('level', formData.level)
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append('isFree', formData.isFree.toString())
      formDataToSend.append('totalLessons', formData.totalLessons.toString())
      formDataToSend.append('duration', formData.duration.toString())

      // Add arrays
      const filteredRequirements = formData.requirements.filter(req => req.trim() !== '')
      const filteredWhatYouLearn = formData.whatYouLearn.filter(item => item.trim() !== '')
      const filteredTargetAudience = formData.targetAudience.filter(item => item.trim() !== '')

      formDataToSend.append('requirements', JSON.stringify(filteredRequirements))
      formDataToSend.append('whatYouLearn', JSON.stringify(filteredWhatYouLearn))
      formDataToSend.append('targetAudience', JSON.stringify(filteredTargetAudience))

      // Add thumbnail if changed
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail)
      }

      // Add lessons
      formDataToSend.append('lessons', JSON.stringify(formData.lessons))

      const response = await api.put(`/teacher/courses/${course._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      onSuccess(response.data.course)
      onClose()
    } catch (error) {
      console.error('Failed to update course:', error)
    } finally {
      setLoading(false)
    }
  }

  const addArrayItem = (field: 'requirements' | 'whatYouLearn' | 'targetAudience') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'requirements' | 'whatYouLearn' | 'targetAudience', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const updateArrayItem = (field: 'requirements' | 'whatYouLearn' | 'targetAudience', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addLesson = () => {
    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, {
        title: '',
        description: '',
        duration: 0,
        order: prev.lessons.length,
        isPreview: false
      }]
    }))
  }

  const updateLesson = (index: number, field: keyof Lesson, value: any) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, i) => 
        i === index ? { ...lesson, [field]: value } : lesson
      )
    }))
  }

  const removeLesson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== index)
    }))
  }

  if (!isOpen || !course) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 rounded-2xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <BookOpen className="w-6 h-6 mr-2 text-purple-400" />
              Edit Course
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">Course Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter course title"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">Category</label>
                <Select
                  value={formData.category._id}
                  onValueChange={(value) => {
                    const category = categories.find(cat => cat._id === value)
                    if (category) {
                      setFormData(prev => ({ ...prev, category: { name: category.name, _id: category._id } }))
                    }
                  }}
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id} className="text-white">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">Level</label>
                <Select
                  value={formData.level}
                  onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => 
                    setFormData(prev => ({ ...prev, level: value }))
                  }
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    <SelectItem value="Beginner" className="text-white">Beginner</SelectItem>
                    <SelectItem value="Intermediate" className="text-white">Intermediate</SelectItem>
                    <SelectItem value="Advanced" className="text-white">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">Price ($)</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                    disabled={formData.isFree}
                  />
                  <Button
                    type="button"
                    variant={formData.isFree ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, isFree: !prev.isFree, price: prev.isFree ? 0 : prev.price }))}
                    className={formData.isFree ? "bg-green-600 text-white" : "border-white/20 text-white"}
                  >
                    <DollarSign className="w-4 h-4 mr-1" />
                    Free
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-green-300 mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter course description"
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 min-h-[100px]"
                required
              />
            </div>
          </div>

          {/* Course Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Course Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">Total Lessons</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.totalLessons}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalLessons: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-green-300 mb-2">Duration (hours)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Requirements</h3>
            {formData.requirements.map((requirement, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={requirement}
                  onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                  placeholder="Enter requirement"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
                {formData.requirements.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('requirements')}
              className="border-white/20 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Requirement
            </Button>
          </div>

          {/* What You'll Learn */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">What You'll Learn</h3>
            {formData.whatYouLearn.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={item}
                  onChange={(e) => updateArrayItem('whatYouLearn', index, e.target.value)}
                  placeholder="Enter learning outcome"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
                {formData.whatYouLearn.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('whatYouLearn', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('whatYouLearn')}
              className="border-white/20 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Learning Outcome
            </Button>
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Target Audience</h3>
            {formData.targetAudience.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={item}
                  onChange={(e) => updateArrayItem('targetAudience', index, e.target.value)}
                  placeholder="Enter target audience"
                  className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                />
                {formData.targetAudience.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('targetAudience', index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('targetAudience')}
              className="border-white/20 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Target Audience
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-white/20 text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {loading ? 'Updating...' : 'Update Course'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

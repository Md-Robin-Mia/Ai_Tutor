import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
// import { Label } from '../components/ui/label'
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
  publishNow: boolean
}

interface CreateCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (course: any) => void
}

export default function CreateCourseModal({ isOpen, onClose, onSuccess }: CreateCourseModalProps) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([])
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    category: { name: '', _id: '' },
    level: 'Beginner',
    price: 0,
    isFree: true,
    totalLessons: 1,
    duration: 1,
    requirements: [''],
    whatYouLearn: [''],
    targetAudience: [''],
    lessons: [
      {
        title: '',
        description: '',
        duration: 10,
        videoUrl: '',
        videoFile: undefined,
        order: 1,
        isPreview: true
      }
    ],
    publishNow: false
  })

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/teacher/categories')
        setCategories(response.data.categories)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    if (isOpen) {
      fetchCategories()
    }
  }, [isOpen])

  const handleInputChange = (field: keyof CourseFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayFieldChange = (field: 'requirements' | 'whatYouLearn' | 'targetAudience', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayFieldItem = (field: 'requirements' | 'whatYouLearn' | 'targetAudience') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayFieldItem = (field: 'requirements' | 'whatYouLearn' | 'targetAudience', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  // Lesson management functions
  const handleLessonChange = (index: number, field: keyof Lesson, value: any) => {
    setFormData(prev => ({
      ...prev,
      lessons: prev.lessons.map((lesson, i) => 
        i === index ? { ...lesson, [field]: value } : lesson
      )
    }))
  }

  const addLesson = () => {
    const newLesson: Lesson = {
      title: '',
      description: '',
      duration: 10,
      videoUrl: '',
      videoFile: undefined,
      order: formData.lessons.length + 1,
      isPreview: false
    }
    setFormData(prev => ({
      ...prev,
      lessons: [...prev.lessons, newLesson],
      totalLessons: prev.lessons.length + 1
    }))
  }

  const removeLesson = (index: number) => {
    setFormData(prev => {
      const newLessons = prev.lessons.filter((_, i) => i !== index)
      return {
        ...prev,
        lessons: newLessons.map((lesson, i) => ({ ...lesson, order: i + 1 })),
        totalLessons: newLessons.length
      }
    })
  }

  const handleVideoUpload = (index: number, file: File) => {
    handleLessonChange(index, 'videoFile', file)
    // Create a temporary URL for preview
    const tempUrl = URL.createObjectURL(file)
    handleLessonChange(index, 'videoUrl', tempUrl)
  }

  const handleThumbnailUpload = (file: File) => {
    handleInputChange('thumbnail', file)
    // Create a temporary URL for preview
    const tempUrl = URL.createObjectURL(file)
    handleInputChange('thumbnailUrl', tempUrl)
  }

  const removeThumbnail = () => {
    if (formData.thumbnailUrl) {
      URL.revokeObjectURL(formData.thumbnailUrl)
    }
    handleInputChange('thumbnail', undefined)
    handleInputChange('thumbnailUrl', undefined)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate basic course information
      if (!formData.title.trim()) {
        alert('Please enter a course title.')
        return
      }
      
      if (!formData.description.trim()) {
        alert('Please enter a course description.')
        return
      }
      
      if (!formData.category._id) {
        alert('Please select a category.')
        return
      }
      
      // Validate that if there are lessons, they have titles and videos
      if (formData.lessons.length > 0) {
        const invalidLessons = formData.lessons.filter(lesson => !lesson.title.trim() || !lesson.videoFile)
        if (invalidLessons.length > 0) {
          alert('Please ensure all lessons have titles and video files uploaded.')
          return
        }
      }

      // Create FormData for file uploads
      const formDataToSend = new FormData()
      
      // Add basic course data
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('categoryId', formData.category._id)
      formDataToSend.append('level', formData.level)
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append('isFree', formData.isFree.toString())
      formDataToSend.append('totalLessons', formData.totalLessons.toString())
      formDataToSend.append('duration', formData.duration.toString())
      formDataToSend.append('publishNow', formData.publishNow.toString())
      
      // Add thumbnail if provided
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail)
      }
      
      // Add arrays
      formDataToSend.append('requirements', JSON.stringify(formData.requirements.filter(req => req.trim() !== '')))
      formDataToSend.append('whatYouLearn', JSON.stringify(formData.whatYouLearn.filter(item => item.trim() !== '')))
      formDataToSend.append('targetAudience', JSON.stringify(formData.targetAudience.filter(item => item.trim() !== '')))
      
      // Add lessons and video files
      formData.lessons.forEach((lesson, index) => {
        formDataToSend.append(`lessons[${index}][title]`, lesson.title)
        formDataToSend.append(`lessons[${index}][description]`, lesson.description)
        formDataToSend.append(`lessons[${index}][duration]`, lesson.duration.toString())
        formDataToSend.append(`lessons[${index}][order]`, lesson.order.toString())
        formDataToSend.append(`lessons[${index}][isPreview]`, lesson.isPreview.toString())
        
        if (lesson.videoFile) {
          formDataToSend.append(`lessonVideos[${index}]`, lesson.videoFile)
        }
      })
      
      // Also send lessons as JSON string for backup
      formDataToSend.append('lessons', JSON.stringify(formData.lessons.map(lesson => ({
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        order: lesson.order,
        isPreview: lesson.isPreview
      }))))

      const response = await api.post('/teacher/courses', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      
      onSuccess(response.data.course)
      onClose()
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: { name: '', _id: '' },
        level: 'Beginner',
        price: 0,
        isFree: true,
        totalLessons: 1,
        duration: 1,
        requirements: [''],
        whatYouLearn: [''],
        targetAudience: [''],
        thumbnail: undefined,
        thumbnailUrl: undefined,
        lessons: [
          {
            title: '',
            description: '',
            duration: 10,
            videoUrl: '',
            videoFile: undefined,
            order: 1,
            isPreview: true
          }
        ],
        publishNow: false
      })
    } catch (error: any) {
      console.error('Failed to create course:', error)
      alert(error.response?.data?.message || 'Failed to create course. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex-shrink-0 sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
                <p className="text-gray-600">Fill in the details to create your course</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Course Title *</label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter course title"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category">Category *</label>
                <Select
                  value={formData.category._id}
                  onValueChange={(value) => {
                    const category = categories.find(cat => cat._id === value)
                    handleInputChange('category', category || { name: '', _id: '' })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <SelectItem value="no-categories" disabled>
                        No categories available
                      </SelectItem>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category._id} value={category._id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="level">Level *</label>
                <Select
                  value={formData.level}
                  onValueChange={(value: 'Beginner' | 'Intermediate' | 'Advanced') => 
                    handleInputChange('level', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="duration">Duration (hours) *</label>
                <Input
                  id="duration"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseFloat(e.target.value))}
                  placeholder="Course duration in hours"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description">Description *</label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your course content and objectives"
                rows={4}
                required
                className="w-full"
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Course Thumbnail</label>
              <div className="flex items-start gap-4">
                {formData.thumbnailUrl ? (
                  <div className="relative">
                    <img 
                      src={formData.thumbnailUrl} 
                      alt="Course thumbnail" 
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeThumbnail}
                      className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                    <Image className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500">No thumbnail</span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="file"
                      id="thumbnail"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          // Validate file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            alert('Thumbnail size should be less than 5MB')
                            return
                          }
                          // Validate file type
                          if (!file.type.startsWith('image/')) {
                            alert('Please select an image file')
                            return
                          }
                          handleThumbnailUpload(file)
                        }
                      }}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('thumbnail')?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {formData.thumbnailUrl ? 'Change Thumbnail' : 'Upload Thumbnail'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload a course thumbnail (JPG, PNG, or GIF). Max size: 5MB. Recommended: 640x360 pixels.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Pricing
            </h3>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={formData.isFree}
                  onChange={(e) => handleInputChange('isFree', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="isFree">Free Course</label>
              </div>
              
              {!formData.isFree && (
                <div className="space-y-2">
                  <label htmlFor="price">Price ($) *</label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    placeholder="0.00"
                    required={!formData.isFree}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Publishing */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              Publishing
            </h3>
            
            <div className="flex items-center gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="publishNow"
                  checked={formData.publishNow}
                  onChange={(e) => handleInputChange('publishNow', e.target.checked)}
                  className="rounded border-gray-300 w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                />
                <label htmlFor="publishNow" className="text-sm font-medium text-gray-700">
                  Publish course immediately
                </label>
              </div>
              
              <div className="text-xs text-gray-500">
                {formData.publishNow 
                  ? "Course will be visible to students after admin approval" 
                  : "Course will be saved as draft and can be published later"}
              </div>
            </div>
          </div>

          {/* Course Structure */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-500" />
              Course Structure
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="totalLessons">Total Lessons *</label>
                <Input
                  id="totalLessons"
                  type="number"
                  min="1"
                  value={formData.totalLessons}
                  onChange={(e) => handleInputChange('totalLessons', parseInt(e.target.value))}
                  placeholder="Number of lessons"
                  required
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Lessons Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Video className="w-5 h-5 text-red-500" />
                Course Lessons
              </h3>
              <Button
                type="button"
                variant="outline"
                onClick={addLesson}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Lesson
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.lessons.map((lesson, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">Lesson {lesson.order}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={lesson.isPreview}
                          onChange={(e) => handleLessonChange(index, 'isPreview', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <label className="text-sm text-gray-600">Preview Lesson</label>
                      </div>
                    </div>
                    {formData.lessons.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLesson(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-2 min-w-0">
                      <label htmlFor={`lesson-title-${index}`} className="text-sm font-medium text-gray-700">Lesson Title</label>
                      <Input
                        id={`lesson-title-${index}`}
                        value={lesson.title}
                        onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                        placeholder="Enter lesson title"
                        required
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2 min-w-0">
                      <label htmlFor={`lesson-duration-${index}`} className="text-sm font-medium text-gray-700">Duration (minutes)</label>
                      <Input
                        id={`lesson-duration-${index}`}
                        type="number"
                        min="1"
                        value={lesson.duration}
                        onChange={(e) => handleLessonChange(index, 'duration', parseInt(e.target.value))}
                        placeholder="Duration in minutes"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Lesson Description</label>
                    <Textarea
                      value={lesson.description}
                      onChange={(e) => handleLessonChange(index, 'description', e.target.value)}
                      placeholder="Describe what students will learn in this lesson"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Video Upload</label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              handleVideoUpload(index, file)
                            }
                          }}
                          className="hidden"
                          id={`video-upload-${index}`}
                        />
                        <label
                          htmlFor={`video-upload-${index}`}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">
                            {lesson.videoFile ? lesson.videoFile.name : 'Choose video file'}
                          </span>
                        </label>
                      </div>
                      
                      {lesson.videoUrl && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Video className="w-4 h-4" />
                          <span>Video uploaded</span>
                        </div>
                      )}
                    </div>
                    
                    {lesson.videoUrl && lesson.videoFile && (
                      <div className="mt-2">
                        <video
                          src={lesson.videoUrl}
                          className="w-full max-w-md rounded-lg"
                          controls
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-500" />
              Requirements
            </h3>
            
            <div className="space-y-3">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => handleArrayFieldChange('requirements', index, e.target.value)}
                    placeholder="Enter a requirement"
                    className="flex-1"
                  />
                  {formData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayFieldItem('requirements', index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayFieldItem('requirements')}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Requirement
              </Button>
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              What Students Will Learn
            </h3>
            
            <div className="space-y-3">
              {formData.whatYouLearn.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayFieldChange('whatYouLearn', index, e.target.value)}
                    placeholder="What students will learn"
                    className="flex-1"
                  />
                  {formData.whatYouLearn.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayFieldItem('whatYouLearn', index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayFieldItem('whatYouLearn')}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Learning Outcome
              </Button>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Target Audience
            </h3>
            
            <div className="space-y-3">
              {formData.targetAudience.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => handleArrayFieldChange('targetAudience', index, e.target.value)}
                    placeholder="Target audience"
                    className="flex-1"
                  />
                  {formData.targetAudience.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayFieldItem('targetAudience', index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => addArrayFieldItem('targetAudience')}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Target Audience
              </Button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            
            {!formData.publishNow ? (
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700"
                disabled={loading}
              >
                {loading ? 'Saving Draft...' : 'Save as Draft'}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleInputChange('publishNow', false)}
                  className="flex-1"
                  disabled={loading}
                >
                  Save as Draft
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                  disabled={loading}
                >
                  {loading ? 'Publishing Course...' : 'Publish Course'}
                </Button>
              </>
            )}
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

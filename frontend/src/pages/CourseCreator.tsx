import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Upload, 
  Save, 
  Eye, 
  Video, 
  FileText, 
  File, 
  Edit3,
  ChevronDown,
  ChevronRight,
  Play,
  Clock,
  Users
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

interface Course {
  title: string
  description: string
  shortDescription: string
  thumbnail: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  language: string
  price: number
  isFree: boolean
  tags: string[]
  requirements: string[]
  whatYouLearn: string[]
  targetAudience: string[]
}

interface Module {
  id: string
  title: string
  description: string
  order: number
  lessons: Lesson[]
  isExpanded: boolean
}

interface Lesson {
  id: string
  title: string
  type: 'video' | 'pdf' | 'text' | 'assignment'
  content: string
  videoUrl?: string
  pdfUrl?: string
  assignmentInstructions?: string
  duration: number
  order: number
  isPreview: boolean
  resources: Array<{
    name: string
    url: string
    type: 'pdf' | 'link' | 'download'
  }>
}

interface Category {
  _id: string
  name: string
  slug: string
}

export default function CourseCreator() {
  const navigate = useNavigate()
  const { courseId } = useParams()
  const [isEditing, setIsEditing] = useState(!!courseId)
  const [activeTab, setActiveTab] = useState('basic')
  const [saving, setSaving] = useState(false)
  
  const [course, setCourse] = useState<Course>({
    title: '',
    description: '',
    shortDescription: '',
    thumbnail: '',
    category: '',
    level: 'beginner',
    language: 'English',
    price: 0,
    isFree: true,
    tags: [],
    requirements: [''],
    whatYouLearn: [''],
    targetAudience: ['']
  })

  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      title: 'Introduction',
      description: 'Getting started with the course',
      order: 0,
      lessons: [],
      isExpanded: true
    }
  ])

  const [categories, setCategories] = useState<Category[]>([])
  const [thumbnailPreview, setThumbnailPreview] = useState('')
  const [draggedItem, setDraggedItem] = useState<{ type: 'module' | 'lesson', moduleId: string, lessonId?: string } | null>(null)

  useEffect(() => {
    fetchCategories()
    if (isEditing) {
      fetchCourse()
    }
  }, [courseId, isEditing])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/courses/instructor/my-courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      setCourse(data)
      setModules(data.modules || [])
      if (data.thumbnail) {
        setThumbnailPreview(data.thumbnail)
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    }
  }

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: `Module ${modules.length + 1}`,
      description: '',
      order: modules.length,
      lessons: [],
      isExpanded: true
    }
    setModules([...modules, newModule])
  }

  const updateModule = (moduleId: string, field: keyof Module, value: any) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, [field]: value } : module
    ))
  }

  const deleteModule = (moduleId: string) => {
    setModules(modules.filter(module => module.id !== moduleId))
  }

  const toggleModuleExpanded = (moduleId: string) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, isExpanded: !module.isExpanded } : module
    ))
  }

  const addLesson = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId)
    if (!module) return

    const newLesson: Lesson = {
      id: Date.now().toString(),
      title: `Lesson ${module.lessons.length + 1}`,
      type: 'video',
      content: '',
      duration: 0,
      order: module.lessons.length,
      isPreview: false,
      resources: []
    }

    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, lessons: [...module.lessons, newLesson] }
        : module
    ))
  }

  const updateLesson = (moduleId: string, lessonId: string, field: keyof Lesson, value: any) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? {
            ...module,
            lessons: module.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
            )
          }
        : module
    ))
  }

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, lessons: module.lessons.filter(lesson => lesson.id !== lessonId) }
        : module
    ))
  }

  const handleDragStart = (e: React.DragEvent, type: 'module' | 'lesson', moduleId: string, lessonId?: string) => {
    setDraggedItem({ type, moduleId, lessonId })
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetModuleId: string, targetLessonId?: string) => {
    e.preventDefault()
    
    if (!draggedItem) return

    const newModules = [...modules]
    
    if (draggedItem.type === 'module') {
      // Reorder modules
      const draggedIndex = newModules.findIndex(m => m.id === draggedItem.moduleId)
      const targetIndex = newModules.findIndex(m => m.id === targetModuleId)
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [draggedModule] = newModules.splice(draggedIndex, 1)
        newModules.splice(targetIndex, 0, draggedModule)
        
        // Update order
        newModules.forEach((module, index) => {
          module.order = index
        })
      }
    } else if (draggedItem.type === 'lesson' && draggedItem.lessonId) {
      // Reorder lessons within or between modules
      const sourceModule = newModules.find(m => m.id === draggedItem.moduleId)
      const targetModule = newModules.find(m => m.id === targetModuleId)
      
      if (sourceModule && targetModule) {
        const draggedLesson = sourceModule.lessons.find(l => l.id === draggedItem.lessonId)
        
        if (draggedLesson) {
          // Remove from source
          sourceModule.lessons = sourceModule.lessons.filter(l => l.id !== draggedItem.lessonId)
          
          // Add to target
          if (targetLessonId) {
            // Insert before specific lesson
            const targetIndex = targetModule.lessons.findIndex(l => l.id === targetLessonId)
            targetModule.lessons.splice(targetIndex, 0, draggedLesson)
          } else {
            // Add to end
            targetModule.lessons.push(draggedLesson)
          }
          
          // Update orders
          sourceModule.lessons.forEach((lesson, index) => {
            lesson.order = index
          })
          targetModule.lessons.forEach((lesson, index) => {
            lesson.order = index
          })
        }
      }
    }
    
    setModules(newModules)
    setDraggedItem(null)
  }

  const addArrayItem = (field: 'requirements' | 'whatYouLearn' | 'targetAudience') => {
    setCourse({
      ...course,
      [field]: [...course[field], '']
    })
  }

  const updateArrayItem = (field: 'requirements' | 'whatYouLearn' | 'targetAudience', index: number, value: string) => {
    const newArray = [...course[field]]
    newArray[index] = value
    setCourse({
      ...course,
      [field]: newArray
    })
  }

  const removeArrayItem = (field: 'requirements' | 'whatYouLearn' | 'targetAudience', index: number) => {
    setCourse({
      ...course,
      [field]: course[field].filter((_, i) => i !== index)
    })
  }

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
      const newTag = (e.target as HTMLInputElement).value.trim()
      if (!course.tags.includes(newTag)) {
        setCourse({
          ...course,
          tags: [...course.tags, newTag]
        })
      }
      (e.target as HTMLInputElement).value = ''
    }
  }

  const removeTag = (tagToRemove: string) => {
    setCourse({
      ...course,
      tags: course.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const saveCourse = async (publish: boolean = false) => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const courseData = {
        ...course,
        modules,
        published: publish
      }

      let response
      if (isEditing) {
        response = await fetch(`/api/courses/${courseId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ course: courseData })
        })
      } else {
        response = await fetch('/api/courses', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ course: courseData })
        })
      }

      if (response.ok) {
        const savedCourse = await response.json()
        navigate(`/admin/courses/${savedCourse._id}`)
      }
    } catch (error) {
      console.error('Error saving course:', error)
    } finally {
      setSaving(false)
    }
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />
      case 'pdf': return <File className="w-4 h-4" />
      case 'text': return <FileText className="w-4 h-4" />
      case 'assignment': return <Edit3 className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Course' : 'Create New Course'}
              </h1>
              <p className="text-sm text-gray-600">
                Build your course with our intuitive course creator
              </p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => saveCourse(false)} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button onClick={() => saveCourse(true)} disabled={saving}>
                <Eye className="w-4 h-4 mr-2" />
                {saving ? 'Publishing...' : 'Publish Course'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Title *
                      </label>
                      <Input
                        value={course.title}
                        onChange={(e) => setCourse({ ...course, title: e.target.value })}
                        placeholder="Enter course title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Short Description
                      </label>
                      <Input
                        value={course.shortDescription}
                        onChange={(e) => setCourse({ ...course, shortDescription: e.target.value })}
                        placeholder="Brief description (max 500 characters)"
                        maxLength={500}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Description *
                      </label>
                      <Textarea
                        value={course.description}
                        onChange={(e) => setCourse({ ...course, description: e.target.value })}
                        placeholder="Detailed course description"
                        rows={6}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <Select value={course.category} onValueChange={(value) => setCourse({ ...course, category: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category._id} value={category._id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Level *
                        </label>
                        <Select value={course.level} onValueChange={(value: any) => setCourse({ ...course, level: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <Select value={course.language} onValueChange={(value) => setCourse({ ...course, language: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                          <SelectItem value="German">German</SelectItem>
                          <SelectItem value="Chinese">Chinese</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags
                      </label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {course.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                      <Input
                        placeholder="Press Enter to add tags"
                        onKeyDown={addTag}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What students will learn
                      </label>
                      {course.whatYouLearn.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            value={item}
                            onChange={(e) => updateArrayItem('whatYouLearn', index, e.target.value)}
                            placeholder="Learning outcome"
                          />
                          {course.whatYouLearn.length > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeArrayItem('whatYouLearn', index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => addArrayItem('whatYouLearn')}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Learning Outcome
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Requirements
                      </label>
                      {course.requirements.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            value={item}
                            onChange={(e) => updateArrayItem('requirements', index, e.target.value)}
                            placeholder="Course requirement"
                          />
                          {course.requirements.length > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeArrayItem('requirements', index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => addArrayItem('requirements')}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Requirement
                      </Button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                      </label>
                      {course.targetAudience.map((item, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <Input
                            value={item}
                            onChange={(e) => updateArrayItem('targetAudience', index, e.target.value)}
                            placeholder="Target audience"
                          />
                          {course.targetAudience.length > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeArrayItem('targetAudience', index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button size="sm" variant="outline" onClick={() => addArrayItem('targetAudience')}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Target Audience
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Thumbnail</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {thumbnailPreview ? (
                        <div className="relative">
                          <img
                            src={thumbnailPreview}
                            alt="Course thumbnail"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() => setThumbnailPreview('')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <div className="text-sm text-gray-600">
                            <label className="cursor-pointer text-blue-600 hover:text-blue-500">
                              Upload thumbnail
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleThumbnailUpload}
                              />
                            </label>
                            <p className="mt-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Modules</span>
                        <span className="font-medium">{modules.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Lessons</span>
                        <span className="font-medium">
                          {modules.reduce((total, module) => total + module.lessons.length, 0)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Duration</span>
                        <span className="font-medium">
                          {modules.reduce((total, module) => 
                            total + module.lessons.reduce((moduleTotal, lesson) => 
                              moduleTotal + lesson.duration, 0
                            ), 0
                          )} minutes
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Curriculum Tab */}
          <TabsContent value="curriculum" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Course Curriculum</h3>
              <Button onClick={addModule}>
                <Plus className="w-4 h-4 mr-2" />
                Add Module
              </Button>
            </div>

            <div className="space-y-4">
              {modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="cursor-move"
                          draggable
                          onDragStart={(e) => handleDragStart(e, 'module', module.id)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, module.id)}
                        >
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleModuleExpanded(module.id)}
                        >
                          {module.isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        <div>
                          <Input
                            value={module.title}
                            onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                            className="text-lg font-medium border-none p-0 focus-visible:ring-0"
                            placeholder="Module title"
                          />
                          <Input
                            value={module.description}
                            onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                            className="text-sm text-gray-600 border-none p-0 focus-visible:ring-0 mt-1"
                            placeholder="Module description"
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {module.lessons.length} lessons
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addLesson(module.id)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Lesson
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteModule(module.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {module.isExpanded && (
                    <CardContent className="space-y-2">
                      {module.lessons.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No lessons yet. Add your first lesson to get started.</p>
                        </div>
                      ) : (
                        module.lessons.map((lesson, index) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                            draggable
                            onDragStart={(e) => handleDragStart(e, 'lesson', module.id, lesson.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, module.id, lesson.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                              <div className="flex items-center space-x-2">
                                {getLessonIcon(lesson.type)}
                                <div>
                                  <Input
                                    value={lesson.title}
                                    onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                                    className="font-medium border-none p-0 focus-visible:ring-0"
                                    placeholder="Lesson title"
                                  />
                                  <div className="flex items-center space-x-4 mt-1">
                                    <Select
                                      value={lesson.type}
                                      onValueChange={(value: any) => updateLesson(module.id, lesson.id, 'type', value)}
                                    >
                                      <SelectTrigger className="w-32 h-8 border-none p-0 focus-visible:ring-0">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="video">Video</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="pdf">PDF</SelectItem>
                                        <SelectItem value="assignment">Assignment</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                                      <Clock className="w-4 h-4" />
                                      <Input
                                        type="number"
                                        value={lesson.duration}
                                        onChange={(e) => updateLesson(module.id, lesson.id, 'duration', parseInt(e.target.value))}
                                        className="w-16 border-none p-0 focus-visible:ring-0"
                                        placeholder="0"
                                        min="0"
                                      />
                                      <span>min</span>
                                    </div>
                                    {lesson.isPreview && (
                                      <Badge variant="secondary">Preview</Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateLesson(module.id, lesson.id, 'isPreview', !lesson.isPreview)}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                {lesson.isPreview ? 'Hide' : 'Preview'}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteLesson(module.id, lesson.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={course.isFree}
                    onChange={(e) => setCourse({ ...course, isFree: e.target.checked })}
                    className="rounded"
                  />
                  <label htmlFor="isFree" className="text-sm font-medium text-gray-700">
                    This course is free
                  </label>
                </div>

                {!course.isFree && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Price
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500">$</span>
                      <Input
                        type="number"
                        value={course.price}
                        onChange={(e) => setCourse({ ...course, price: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    id="allowComments"
                    defaultChecked
                    className="rounded"
                  />
                  <label htmlFor="allowComments" className="text-sm font-medium text-gray-700">
                    Allow comments and discussions
                  </label>
                </div>

                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    id="allowReviews"
                    defaultChecked
                    className="rounded"
                  />
                  <label htmlFor="allowReviews" className="text-sm font-medium text-gray-700">
                    Allow student reviews and ratings
                  </label>
                </div>

                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    id="certificate"
                    defaultChecked
                    className="rounded"
                  />
                  <label htmlFor="certificate" className="text-sm font-medium text-gray-700">
                    Issue certificate on completion
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

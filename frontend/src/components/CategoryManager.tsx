import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  FolderOpen, 
  BookOpen, 
  Code, 
  Palette, 
  Music, 
  Globe, 
  Calculator,
  Microscope,
  Brush,
  Dumbbell,
  Briefcase,
  Heart,
  X,
  Check
} from 'lucide-react'
import api from '../lib/api'

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  icon: string
  color: string
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface CategoryFormData {
  name: string
  description: string
  icon: string
  color: string
}

const ICONS = [
  { name: 'BookOpen', icon: BookOpen, label: 'Book' },
  { name: 'Code', icon: Code, label: 'Code' },
  { name: 'Palette', icon: Palette, label: 'Art' },
  { name: 'Music', icon: Music, label: 'Music' },
  { name: 'Globe', icon: Globe, label: 'Language' },
  { name: 'Calculator', icon: Calculator, label: 'Math' },
  { name: 'Microscope', icon: Microscope, label: 'Science' },
  { name: 'Brush', icon: Brush, label: 'Design' },
  { name: 'Dumbbell', icon: Dumbbell, label: 'Fitness' },
  { name: 'Briefcase', icon: Briefcase, label: 'Business' },
  { name: 'Heart', icon: Heart, label: 'Health' },
  { name: 'FolderOpen', icon: FolderOpen, label: 'General' }
]

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16'
]

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [myCategories, setMyCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: 'BookOpen',
    color: '#3B82F6'
  })

  useEffect(() => {
    fetchCategories()
    fetchMyCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/teacher/categories')
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyCategories = async () => {
    try {
      const response = await api.get('/teacher/categories/my')
      setMyCategories(response.data.categories || [])
    } catch (error) {
      console.error('Failed to fetch my categories:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('Submitting category data:', formData)
      
      // Health check removed since it's redundant and can cause rate limit issues
      
      if (editingCategory) {
        // Update existing category
        const response = await api.put(`/teacher/categories/${editingCategory._id}`, formData)
        console.log('Category update response:', response.data)
      } else {
        // Create new category
        const response = await api.post('/teacher/categories', formData)
        console.log('Category creation response:', response.data)
      }

      // Reset form and refresh data
      setFormData({ name: '', description: '', icon: 'BookOpen', color: '#3B82F6' })
      setEditingCategory(null)
      setShowCreateModal(false)
      fetchCategories()
      fetchMyCategories()
    } catch (error: any) {
      console.error('Failed to save category:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      console.error('Error headers:', error.response?.headers)
      
      let errorMessage = 'Failed to save category'
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response?.data?.message || `Server error: ${error.response.status}`
        const errorDetails = error.response?.data?.errors ? error.response.data.errors.join(', ') : ''
        alert(`${errorMessage}${errorDetails ? '\n\nDetails: ' + errorDetails : ''}`)
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'No response from server. Please check your connection.'
        alert(errorMessage)
      } else {
        // Something else happened
        errorMessage = error.message || 'An unexpected error occurred'
        alert(errorMessage)
      }
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      color: category.color
    })
    setShowCreateModal(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return
    }

    try {
      await api.delete(`/teacher/categories/${categoryId}`)
      fetchCategories()
      fetchMyCategories()
    } catch (error: any) {
      console.error('Failed to delete category:', error)
      alert(error.response?.data?.message || 'Failed to delete category')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', description: '', icon: 'BookOpen', color: '#3B82F6' })
    setEditingCategory(null)
    setShowCreateModal(false)
  }

  const renderIcon = (iconName: string, className = "w-5 h-5") => {
    const iconData = ICONS.find(i => i.name === iconName)
    const IconComponent = iconData?.icon || BookOpen
    return <IconComponent className={className} />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-purple-400" />
            Category Management
          </h3>
          <p className="text-green-300 text-sm mt-1">Create and manage course categories</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* My Categories */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
        <div className="p-6 border-b border-white/10">
          <h4 className="text-lg font-medium text-white">My Categories</h4>
          <p className="text-gray-400 text-sm mt-1">Categories you've created</p>
        </div>
        <div className="p-6">
          {myCategories.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">You haven't created any categories yet</p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                variant="outline" 
                className="mt-4"
              >
                Create Your First Category
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myCategories.map((category) => (
                <div key={category._id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        {renderIcon(category.icon, "w-4 h-4")}
                      </div>
                      <div>
                        <h5 className="font-medium text-white">{category.name}</h5>
                        {category.description && (
                          <p className="text-xs text-gray-400 mt-1">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(category)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(category._id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className="text-xs"
                      style={{ backgroundColor: category.color + '20', color: category.color }}
                    >
                      Active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Available Categories */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
        <div className="p-6 border-b border-white/10">
          <h4 className="text-lg font-medium text-white">All Available Categories</h4>
          <p className="text-gray-400 text-sm mt-1">Categories you can use for your courses</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <div key={category._id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: category.color + '20' }}
                  >
                    {renderIcon(category.icon)}
                  </div>
                  <div>
                    <h5 className="font-medium text-white">{category.name}</h5>
                    {category.description && (
                      <p className="text-xs text-gray-400 mt-1">{category.description}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Create New Category'}
                </h3>
                <Button variant="ghost" size="sm" onClick={resetForm}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter category name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this category (optional)"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {ICONS.map((icon) => (
                      <button
                        key={icon.name}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: icon.name }))}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          formData.icon === icon.name
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <icon.icon className="w-4 h-4 mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color }))}
                        className={`h-8 rounded-lg border-2 transition-all ${
                          formData.color === color
                            ? 'border-gray-800 scale-110'
                            : 'border-gray-300 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-200 flex-shrink-0">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit(e);
                  }}
                >
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

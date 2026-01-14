import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { X, Users } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'

interface CreateStudyGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateStudyGroupModal({ isOpen, onClose, onSuccess }: CreateStudyGroupModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    topic: '',
    maxMembers: 10
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { token, user } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Enhanced authentication debugging
      console.log('=== CREATE STUDY GROUP DEBUG ===')
      console.log('Token exists:', !!token)
      console.log('Token length:', token?.length || 0)
      console.log('User exists:', !!user)
      console.log('User details:', user)
      console.log('Form data:', formData)
      
      if (!token) {
        console.log('❌ No token found - user not authenticated')
        throw new Error('Please login to create a study group')
      }
      
      if (!user) {
        console.log('❌ No user found - authentication incomplete')
        throw new Error('User authentication incomplete. Please login again.')
      }

      console.log('✅ Authentication looks good, making API call...')

      const response = await api.post('/collaboration/groups', formData)
      
      console.log('✅ API call successful')
      console.log('Response status:', response.status)
      console.log('Response data:', response.data)

      // Reset form
      setFormData({
        name: '',
        subject: '',
        topic: '',
        maxMembers: 10
      })

      onClose()
      onSuccess()
    } catch (error: any) {
      console.error('❌ Create group error:', error)
      console.error('Error details:', {
        code: error.code,
        response: error.response,
        message: error.message,
        status: error.response?.status
      })
      
      // Handle different error types
      if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        setError('Network error. Please check your connection and try again.')
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Your session may have expired. Please login again.')
      } else if (error.response?.status === 404) {
        setError('Study group service not available. Please check if the backend server is running.')
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.')
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to create study group')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxMembers' ? parseInt(value) || 10 : value
    }))
  }

  if (!isOpen) return null

  // Show authentication status at the top of the modal
  const showAuthWarning = !token || !user

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-20">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20 shadow-2xl mt-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Create Study Group
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="pt-8 p-6 pb-12">
          {/* Authentication Warning */}
          {showAuthWarning && (
            <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-300 text-sm">
              <p className="mb-2">⚠️ You need to be logged in to create a study group.</p>
              <p>Please <a href="/login" className="underline hover:text-yellow-200">login here</a> first, then try again.</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/80 text-sm">Group Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter group name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={showAuthWarning}
                className="w-full px-4 py-3 bg-white/25 border-2 border-white/50 rounded-xl text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:bg-white/35 hover:border-white/60 transition-all duration-300 shadow-xl backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-white/80 text-sm">Subject</Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                placeholder="e.g., Mathematics, Physics, Computer Science"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={showAuthWarning}
                className="w-full px-4 py-3 bg-white/25 border-2 border-white/50 rounded-xl text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:bg-white/35 hover:border-white/60 transition-all duration-300 shadow-xl backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic" className="text-white/80 text-sm">Topic/Focus</Label>
              <Input
                id="topic"
                name="topic"
                type="text"
                placeholder="e.g., Calculus, Organic Chemistry, Web Development"
                value={formData.topic}
                onChange={handleChange}
                required
                disabled={showAuthWarning}
                className="w-full px-4 py-3 bg-white/25 border-2 border-white/50 rounded-xl text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:bg-white/35 hover:border-white/60 transition-all duration-300 shadow-xl backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxMembers" className="text-white/80 text-sm">Maximum Members</Label>
              <Input
                id="maxMembers"
                name="maxMembers"
                type="number"
                min="2"
                max="50"
                value={formData.maxMembers}
                onChange={handleChange}
                required
                disabled={showAuthWarning}
                className="w-full px-4 py-3 bg-white/25 border-2 border-white/50 rounded-xl text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:bg-white/35 hover:border-white/60 transition-all duration-300 shadow-xl backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex gap-3 pt-6 border-t border-white/20">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 hover:text-white hover:border-white/60 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-white/20 hover:backdrop-blur-sm font-medium py-3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:from-blue-500 hover:to-purple-600 disabled:opacity-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 py-3"
              >
                {isLoading ? 'Creating...' : 'Create Group'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

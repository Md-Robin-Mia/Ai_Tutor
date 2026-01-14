import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Spinner } from '../components/ui/spinner'
import { AnimatedLink } from '../components/ui/animated-link'
import '../styles/dashboard-theme.css'
import { 
  User, 
  Mail, 
  Phone, 
  School, 
  BookOpen, 
  Users, 
  Settings, 
  Globe, 
  Bell, 
  Moon,
  Camera,
  Edit3,
  Save,
  X,
  Check,
  Star,
  Award,
  TrendingUp,
  Calendar,
  MapPin,
  Link2,
  Shield,
  Zap
} from 'lucide-react'

interface UserProfile {
  name: string
  email: string
  role: 'student' | 'teacher' | 'parent' | 'admin'
  phone?: string
  bio?: string
  school?: string
  grade?: string
  subjects?: string[]
  preferences: {
    language: string
    notifications: boolean
    darkMode: boolean
  }
  profilePicture?: string
}

export default function ProfilePage() {
  const { user, token, setAuth } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'preferences'>('overview')
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [uploadingPicture, setUploadingPicture] = useState(false)

  const [profile, setProfile] = useState<UserProfile>({
    name: user?.name || '',
    email: user?.email || '',
    role: (user?.role as 'student' | 'teacher' | 'parent' | 'admin') || 'student',
    phone: '',
    bio: '',
    school: '',
    grade: '',
    subjects: [],
    preferences: {
      language: 'English',
      notifications: true,
      darkMode: false
    }
  })

  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage first, then fall back to profile preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    return savedDarkMode || profile.preferences.darkMode
  })
  
  // Sync dark mode with profile preferences and initialize on mount
  useEffect(() => {
    const shouldBeDarkMode = profile.preferences.darkMode
    setDarkMode(shouldBeDarkMode)
    
    if (shouldBeDarkMode) {
      document.body.classList.add('dark-mode')
      localStorage.setItem('darkMode', 'true')
    } else {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('darkMode', 'false')
    }
  }, [profile.preferences.darkMode])
  
  // Initialize dark mode on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    if (savedDarkMode) {
      document.body.classList.add('dark-mode')
    }
  }, [])
  
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    
    // Save to localStorage for persistence
    localStorage.setItem('darkMode', newDarkMode.toString())
    
    // Update profile preferences
    handleInputChange('preferences', { ...profile.preferences, darkMode: newDarkMode })
    
    // Apply dark mode to document body immediately
    if (newDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  }

  const [originalProfile, setOriginalProfile] = useState<UserProfile>({ ...profile })

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubjectToggle = (subject: string) => {
    setProfile(prev => ({
      ...prev,
      subjects: prev.subjects?.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...(prev.subjects || []), subject]
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage('')

    try {
      // Simulate API call - in real app, this would call your backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update auth store with new user data
      const updatedUser = {
        ...user,
        id: user?.id || '', // Ensure id is always a string
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        bio: profile.bio,
        role: (user?.role as 'student' | 'teacher' | 'parent' | 'admin' | 'instructor' | 'super-admin') || 'student' // Ensure role is never undefined
      }
      
      if (token) {
        setAuth(token, updatedUser)
      }
      setOriginalProfile({ ...profile })
      setIsEditing(false)
      setMessage('Profile updated successfully!')
      setMessageType('success')
    } catch (error) {
      setMessage('Failed to update profile. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setProfile({ ...originalProfile })
    setIsEditing(false)
    setMessage('')
  }

  const handleEdit = () => {
    setOriginalProfile({ ...profile })
    setIsEditing(true)
    setMessage('')
  }

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file')
      setMessageType('error')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size should be less than 5MB')
      setMessageType('error')
      return
    }

    setUploadingPicture(true)
    setMessage('')

    try {
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file)
      setProfilePicture(previewUrl)

      // In a real app, you would upload to server here
      // For now, we'll just simulate the upload
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setMessage('Profile picture updated successfully!')
      setMessageType('success')
      
      // Update profile with new picture URL
      setProfile(prev => ({
        ...prev,
        profilePicture: previewUrl
      }))
    } catch (error) {
      setMessage('Failed to upload profile picture')
      setMessageType('error')
    } finally {
      setUploadingPicture(false)
    }
  }

  const availableSubjects = [
    'Mathematics', 'Science', 'English', 'History', 
    'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Art', 'Music', 'Physical Education', 'Geography'
  ]

  const roleSpecificFields = () => {
    switch (profile.role) {
      case 'student':
        return (
          <>
            <div className="relative">
              <label className="block text-sm font-bold text-black mb-3 flex items-center">
                <School className="w-4 h-4 mr-2 text-blue-700" />
                School
              </label>
              <input
                type="text"
                value={profile.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                placeholder="Enter your school name"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-bold text-black mb-3 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-purple-700" />
                Grade
              </label>
              <input
                type="text"
                value={profile.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                placeholder="e.g., 10th Grade, Freshman, etc."
              />
            </div>
          </>
        )
      case 'teacher':
        return (
          <>
            <div className="relative">
              <label className="block text-sm font-bold text-black mb-3 flex items-center">
                <School className="w-4 h-4 mr-2 text-blue-700" />
                School/Institution
              </label>
              <input
                type="text"
                value={profile.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                placeholder="Enter your institution name"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-bold text-black mb-3 flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-purple-700" />
                Subjects Taught
              </label>
              <div className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3">
                  {availableSubjects.map(subject => (
                    <label key={subject} className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.subjects?.includes(subject)}
                        onChange={() => handleSubjectToggle(subject)}
                        disabled={!isEditing}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 disabled:opacity-50 rounded"
                      />
                      <span className="text-sm text-gray-900 font-semibold">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </>
        )
      case 'parent':
        return (
          <>
            <div className="relative">
              <label className="block text-sm font-bold text-black mb-3 flex items-center">
                <Users className="w-4 h-4 mr-2 text-green-700" />
                Children's School
              </label>
              <input
                type="text"
                value={profile.school}
                onChange={(e) => handleInputChange('school', e.target.value)}
                disabled={!isEditing}
                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-300 hover:border-gray-300 bg-white/80 backdrop-blur-sm"
                placeholder="Enter your children's school name"
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden ${darkMode ? 'dark-mode' : ''}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up delay-1000"></div>
      <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up delay-2000"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10" style={{paddingTop: '100px'}}>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <AnimatedLink 
                to="/student-dashboard" 
                animation="slide"
                className="flex items-center space-x-2 px-4 py-2 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to Dashboard</span>
              </AnimatedLink>
              <div className="h-8 w-px bg-white/20"></div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 text-gradient">Profile</h1>
                <p className="text-white/70">Manage your personal information and preferences</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  className="px-6 py-2.5 quiz-glass-button bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2 hover-lift glow-blue"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleCancel}
                    className="px-6 py-2.5 quiz-glass-button bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2 hover-lift"
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="px-6 py-2.5 quiz-glass-button bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center space-x-2 hover-lift glow-green"
                    disabled={loading}
                  >
                    {loading ? (
                      <Spinner size="sm" variant="default" className="text-white" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-center space-x-2 card-glass border-white/20 ${
            messageType === 'success' 
              ? 'bg-green-400/20 text-green-300 border-green-400/30' 
              : 'bg-red-400/20 text-red-300 border-red-400/30'
          }`}>
            <span className="text-xl">
              {messageType === 'success' ? '✅' : '❌'}
            </span>
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Profile Content */}
        <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Picture Section */}
              <div className="lg:col-span-1">
                <div className="relative group">
                  {/* Enhanced glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition duration-1000 group-hover:duration-300 animate-pulse"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-lg opacity-40 group-hover:opacity-60 transition duration-1000"></div>
                  
                  {/* Main card */}
                  <div className="relative card-glass card-glass-hover rounded-3xl p-8 text-center border-white/20 shadow-2xl transform transition-all duration-500 group-hover:scale-105">
                    
                    {/* Profile avatar with enhanced effects */}
                    <div className="relative mb-8">
                      <div className="w-40 h-40 mx-auto relative">
                        {/* Animated background rings */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping opacity-20"></div>
                        <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse opacity-30"></div>
                        
                        {/* Main avatar circle */}
                        <div className="relative w-full h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-6xl font-bold shadow-2xl transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 glow-blue">
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                        
                        {/* Upload button overlay */}
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                            <label htmlFor="profile-picture-upload" className="cursor-pointer">
                              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors duration-200">
                                {uploadingPicture ? (
                                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <Camera className="w-6 h-6 text-blue-600" />
                                )}
                              </div>
                              <input
                                id="profile-picture-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleProfilePictureUpload}
                                className="hidden"
                                disabled={uploadingPicture}
                              />
                            </label>
                          </div>
                        )}
                        
                        {/* Enhanced status indicator */}
                        <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white/20 animate-bounce glow-green">
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        
                        {/* Decorative elements */}
                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-60 animate-pulse"></div>
                        <div className="absolute -top-1 -right-3 w-6 h-6 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-50 animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>
                    </div>
                    
                    {/* Enhanced name display */}
                    <div className="mb-6">
                      <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-3 leading-tight">
                        {profile.name}
                      </h2>
                      <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto mb-4 glow-blue"></div>
                    </div>
                    
                    {/* Enhanced email display */}
                    <div className="mb-6 p-4 card-glass border-white/20 rounded-2xl">
                      <p className="text-white mb-2 flex items-center justify-center font-bold text-lg">
                        <Mail className="w-6 h-6 mr-3 text-blue-300" />
                        {profile.email}
                      </p>
                    </div>
                    
                    {/* Enhanced role badge */}
                    <div className="flex items-center justify-center mb-6">
                      <div className="relative group/badge">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-50 group-hover/badge:opacity-70 transition duration-300"></div>
                        <div className="relative px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-full text-base font-black shadow-xl transform transition-all duration-300 group-hover/badge:scale-105 glow-blue">
                          {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced animated dots */}
                    <div className="flex justify-center space-x-3 mb-6">
                      <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-bounce shadow-lg glow-blue"></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full animate-bounce shadow-lg glow-purple" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-pink-500 rounded-full animate-bounce shadow-lg" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    
                    {/* Enhanced Stats or additional info */}
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                      <div className="text-center group">
                        <div className="relative flex items-center justify-center h-12">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition duration-300"></div>
                          <div className="relative text-3xl font-black text-blue-300 drop-shadow-lg leading-none">100%</div>
                        </div>
                        <div className="text-sm text-white font-bold mt-2">Complete</div>
                      </div>
                      <div className="text-center group">
                        <div className="relative flex items-center justify-center h-12">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition duration-300"></div>
                          <div className="relative text-3xl font-black text-purple-300 drop-shadow-lg leading-none">A+</div>
                        </div>
                        <div className="text-sm text-white font-bold mt-2">Status</div>
                      </div>
                      <div className="text-center group">
                        <div className="relative flex items-center justify-center h-12">
                          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg blur-lg opacity-30 group-hover:opacity-50 transition duration-300"></div>
                          <div className="relative text-3xl font-black text-green-300 drop-shadow-lg leading-none">✓</div>
                        </div>
                        <div className="text-sm text-white font-bold mt-2">Active</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Sections */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="relative group">
                  {/* Enhanced glow effect */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  
                  {/* Main card */}
                  <div className="relative card-glass card-glass-hover rounded-3xl p-8 border-white/20 shadow-2xl transform transition-all duration-500">
                    
                    {/* Enhanced header */}
                    <div className="flex items-center mb-10 pb-6 border-b border-white/20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-40"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 glow-blue">
                          <User className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <div className="ml-6">
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-purple-200 mb-2">Basic Information</h2>
                        <p className="text-white/80 text-sm font-bold">Manage your personal details and preferences</p>
                      </div>
                    </div>
                  
                    {/* Enhanced form grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="relative group/input">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-2xl opacity-0 group-hover/input:opacity-100 transition duration-300"></div>
                        <label className="relative block text-sm font-black text-white mb-4 flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-md glow-blue">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          disabled={!isEditing}
                          className="relative w-full px-5 py-4 border-2 border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-400 disabled:bg-white/10 disabled:text-white/50 transition-all duration-300 hover:border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 shadow-sm hover:shadow-md font-medium"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div className="relative group/input">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl opacity-0 group-hover/input:opacity-100 transition duration-300"></div>
                        <label className="relative block text-sm font-black text-white mb-4 flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-md glow-purple">
                            <Mail className="w-4 h-4 text-white" />
                          </div>
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          disabled={!isEditing}
                          className="relative w-full px-5 py-4 border-2 border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-400 disabled:bg-white/10 disabled:text-white/50 transition-all duration-300 hover:border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 shadow-sm hover:shadow-md font-medium"
                          placeholder="your.email@example.com"
                        />
                      </div>

                      <div className="relative group/input">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 rounded-2xl opacity-0 group-hover/input:opacity-100 transition duration-300"></div>
                        <label className="relative block text-sm font-black text-white mb-4 flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                            <Phone className="w-4 h-4 text-white" />
                          </div>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          disabled={!isEditing}
                          className="relative w-full px-5 py-4 border-2 border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-400 disabled:bg-white/10 disabled:text-white/50 transition-all duration-300 hover:border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 shadow-sm hover:shadow-md font-medium"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="relative group/input">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-2xl opacity-0 group-hover/input:opacity-100 transition duration-300"></div>
                        <label className="relative block text-sm font-black text-white mb-4 flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                            <Settings className="w-4 h-4 text-white" />
                          </div>
                          Role
                        </label>
                        <input
                          type="text"
                          value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                          disabled
                          className="relative w-full px-5 py-4 border-2 border-white/20 rounded-2xl bg-white/10 backdrop-blur-sm text-white/70 font-black shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Enhanced bio section */}
                    <div className="mt-10 pt-8 border-t border-white/20">
                      <label className="block text-sm font-black text-white mb-4 flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-md">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                        Bio
                      </label>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        rows={4}
                        className="w-full px-5 py-4 border-2 border-white/20 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-400 disabled:bg-white/10 disabled:text-white/50 transition-all duration-300 resize-none hover:border-white/30 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 shadow-sm hover:shadow-md font-medium"
                        placeholder="Tell us about yourself, your interests, and what you're passionate about..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

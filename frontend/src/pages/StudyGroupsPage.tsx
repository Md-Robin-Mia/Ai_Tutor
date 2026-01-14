import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Users, BookOpen, Calendar, MessageSquare, Plus, Search } from 'lucide-react'
import CreateStudyGroupModal from '../components/CreateStudyGroupModal'
import GroupDetailModal from '../components/GroupDetailModal'
import { useAuthStore } from '../store/authStore'

export default function StudyGroupsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [studyGroups, setStudyGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [error, setError] = useState('')
  const { token, user } = useAuthStore()

  // Debug: Log authentication status
  console.log('StudyGroupsPage - Auth Status:', {
    token: !!token,
    tokenLength: token?.length,
    user: !!user,
    userName: user?.name,
    isAuthenticated: !!token && !!user
  });


  // Get unique subjects from study groups for categories
  const categories = ['all', ...Array.from(new Set(studyGroups.map((group: any) => group.subject))).sort()]

  // Fetch study groups from API
  const fetchStudyGroups = async () => {
    try {
      if (!token) {
        console.log('No token found in auth store. User:', user)
        setError('Please login to view study groups')
        setIsLoading(false)
        return
      }

      console.log('Fetching study groups with token:', !!token)
      console.log('User:', user)

      const response = await fetch('/api/collaboration/groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Study groups response status:', response.status)

      if (!response.ok) {
        if (response.status === 401) {
          setError('Your session has expired. Please login again.')
        } else if (response.status === 404) {
          setError('Study group service not available. Please check if the backend server is running.')
        } else if (response.status >= 500) {
          setError('Server error. Please try again later.')
        } else {
          setError('Unable to load study groups. Please try again.')
        }
        setIsLoading(false)
        return
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received')
        setError('Invalid response from server. Please try again.')
        setIsLoading(false)
        return
      }

      let data
      try {
        data = await response.json()
        console.log('Study groups data:', data)
      } catch (jsonError) {
        console.error('JSON parsing error:', jsonError)
        setError('Invalid response format. Please try again.')
        setIsLoading(false)
        return
      }

      setStudyGroups(data.groups || [])
      setError('')
      console.log('Study groups loaded:', data.groups)
      data.groups?.forEach((group: any, index: number) => {
        console.log(`Group ${index}:`, group._id, group.name, group)
      })
    } catch (error: any) {
      console.error('Error fetching study groups:', error)
      setError(error.message || 'Failed to load study groups')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStudyGroups()
  }, [])

  const handleCreateGroupSuccess = () => {
    fetchStudyGroups() // Refresh the groups list
  }

  const handleViewGroup = (groupId: string) => {
    console.log('View button clicked for group:', groupId)
    setSelectedGroupId(groupId)
    setIsDetailModalOpen(true)
    console.log('Modal state set to open, groupId:', groupId, 'isDetailModalOpen:', true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedGroupId('')
  }

  const handleGroupJoined = () => {
    fetchStudyGroups() // Refresh the groups list after joining
  }

  const handleJoinGroup = async (groupId: string) => {
    try {
      console.log('Join button clicked for group:', groupId);
      console.log('Token available:', !!token);
      console.log('User:', user);

      if (!token) {
        setError('Please login to join study groups')
        return
      }

      console.log('Making join request to:', `/api/collaboration/groups/${groupId}/join`);

      const response = await fetch(`/api/collaboration/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Join response status:', response.status);
      console.log('Join response headers:', response.headers);

      if (!response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type')
        console.log('Response content-type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          console.log('Error response data:', errorData);
          throw new Error(errorData.message || 'Failed to join group')
        } else {
          const text = await response.text()
          console.log('Non-JSON error response:', text);
          
          if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.')
          } else if (response.status === 404) {
            throw new Error('Study group not found.')
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.')
          } else {
            throw new Error(`Unable to join group (${response.status}). Please try again.`)
          }
        }
      }

      const responseData = await response.json()
      console.log('Join success response:', responseData);

      fetchStudyGroups() // Refresh the groups list
    } catch (error: any) {
      console.error('Error joining group:', error)
      setError(error.message || 'Failed to join group')
    }
  }

  const filteredGroups = studyGroups.filter((group: any) => {
    const matchesCategory = selectedCategory === 'all' || group.subject === selectedCategory
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.topic.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up delay-1000"></div>
      <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up delay-2000"></div>
      
      <div className="max-w-6xl mx-auto relative z-10 pt-24 pb-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 glow-blue animate-glow-pulse-blue">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 text-gradient">Study Groups</h1>
          <p className="text-lg text-white/80 mb-6">Join collaborative learning communities</p>
          
          {/* Authentication Status Indicator */}
          <div className="mt-4">
            {token && user ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-300 text-sm">Logged in as {user.name}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-full backdrop-blur-sm">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-red-300 text-sm">Not logged in</span>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-12 slide-in-top" style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '20px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
          e.currentTarget.style.backdropFilter = 'blur(25px) saturate(200%)'
          ;(e.currentTarget.style as any).WebkitBackdropFilter = 'blur(25px) saturate(200%)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
          e.currentTarget.style.backdropFilter = 'blur(20px) saturate(180%)'
          ;(e.currentTarget.style as any).WebkitBackdropFilter = 'blur(20px) saturate(180%)'
        }}>
          <CardContent className="p-6" style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)' as any
          }}>
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search study groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/60 transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                  e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.5)'
                  e.currentTarget.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
                  e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={`capitalize quiz-glass-button border-white/20 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white glow-blue'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create New Group Button */}
        <div className="text-center mb-12 mt-8">
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="quiz-glass-button bg-gradient-to-r from-green-400 to-emerald-500 text-white px-8 py-3 hover-lift glow-green animate-glow-pulse-green"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Study Group
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20 animate-pulse">
              <Users className="w-10 h-10 text-white/60" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading study groups...</h3>
          </div>
        )}

        {/* Study Groups Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group: any) => (
              <Card key={group._id} className="card-glass card-glass-hover border-white/20 shadow-2xl quiz-option-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-white mb-2">
                        {group.name}
                      </CardTitle>
                      <span className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-blue-400/20 text-blue-300 border border-blue-400/30">
                        {group.subject}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/60">Topic</div>
                      <div className="font-semibold text-white">{group.topic}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-white/80 text-sm">Study group for {group.subject} focusing on {group.topic}</p>
                  
                  {/* Members */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Users className="w-4 h-4" />
                      <span>{group.members?.length || 0}/{group.maxMembers || 10} members</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 max-w-20 backdrop-blur-sm border border-white/20">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full glow-blue animate-glow-pulse-blue"
                        style={{ width: `${((group.members?.length || 0) / (group.maxMembers || 10)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Moderator */}
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <BookOpen className="w-4 h-4" />
                    <span>Moderator: {group.moderator?.name || 'Unknown'}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => {
                        console.log('View button clicked! Group ID:', group._id)
                        handleViewGroup(group._id)
                      }}
                      variant="outline" 
                      className="flex-1 quiz-glass-button border-white/20 text-white/80 hover:text-white hover-lift"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      onClick={() => handleJoinGroup(group._id)}
                      className="flex-1 quiz-glass-button bg-gradient-to-r from-blue-400 to-purple-500 text-white hover-lift glow-blue"
                      disabled={(group.members?.length || 0) >= (group.maxMembers || 10)}
                    >
                      {(group.members?.length || 0) >= (group.maxMembers || 10) ? 'Full' : 'Join'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Users className="w-10 h-10 text-white/60" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {studyGroups.length === 0 ? 'No study groups yet' : 'No study groups found'}
            </h3>
            <p className="text-white/70 mb-4">
              {studyGroups.length === 0 
                ? 'Be the first to create a study group!' 
                : 'Try adjusting your search or filters'
              }
            </p>
            <Button 
              onClick={() => {
                if (studyGroups.length === 0) {
                  setIsModalOpen(true)
                } else {
                  setSelectedCategory('all')
                  setSearchTerm('')
                }
              }}
              className="quiz-glass-button border-white/20 text-white/80 hover:text-white"
            >
              {studyGroups.length === 0 ? 'Create Study Group' : 'Clear Filters'}
            </Button>
          </div>
        )}

        {/* Create Study Group Modal */}
        <CreateStudyGroupModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleCreateGroupSuccess}
        />

        {/* Group Detail Modal */}
        <GroupDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          groupId={selectedGroupId}
          onJoinGroup={handleGroupJoined}
        />
      </div>
    </div>
  )
}

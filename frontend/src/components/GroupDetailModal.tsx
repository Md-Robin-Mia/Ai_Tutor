import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { 
  X, 
  Users, 
  MessageSquare, 
  Send, 
  Calendar, 
  BookOpen, 
  User, 
  Clock,
  Settings,
  UserPlus,
  UserMinus
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import api from '../lib/api'

interface GroupDetailModalProps {
  isOpen: boolean
  onClose: () => void
  groupId: string
  onJoinGroup?: () => void
}

interface Message {
  _id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  isAIModerated?: boolean
}

interface GroupMember {
  _id: string
  name: string
  email: string
  role?: string
}

interface GroupDetail {
  _id: string
  name: string
  subject: string
  topic: string
  description?: string
  members: GroupMember[]
  moderator: GroupMember
  maxMembers: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  messages?: Message[]
}

export default function GroupDetailModal({ isOpen, onClose, groupId, onJoinGroup }: GroupDetailModalProps) {
  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const { token, user } = useAuthStore()

  // Debug: Log modal state changes
  useEffect(() => {
    console.log('GroupDetailModal - isOpen:', isOpen, 'groupId:', groupId)
  }, [isOpen, groupId])

  // Fetch group details and messages
  useEffect(() => {
    if (isOpen && groupId) {
      fetchGroupDetails()
      fetchMessages()
    }
  }, [isOpen, groupId])

  const fetchGroupDetails = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      console.log('Fetching group details for groupId:', groupId)
      
      const response = await api.get(`/collaboration/groups/${groupId}`)
      console.log('Group details response:', response.data)
      
      setGroup(response.data.group)
    } catch (error: any) {
      console.error('Error fetching group details:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      
      if (error.response?.status === 404) {
        setError('Group not found. It may have been deleted.')
      } else if (error.response?.status === 503) {
        setError('Database not available. Please try again later.')
      } else {
        setError(error.response?.data?.message || 'Failed to load group details')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages for groupId:', groupId)
      
      const response = await api.get(`/collaboration/groups/${groupId}/messages`)
      console.log('Messages response:', response.data)
      
      setMessages(response.data.messages || [])
    } catch (error: any) {
      console.error('Error fetching messages:', error)
      console.error('Error response:', error.response)
      console.error('Error status:', error.response?.status)
      console.error('Error data:', error.response?.data)
      // Don't set error for messages, just log it - messages are optional
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !token) return

    try {
      setIsSendingMessage(true)
      
      const response = await api.post(`/collaboration/groups/${groupId}/messages`, {
        content: newMessage.trim()
      })

      // Add the new message to the list
      const newMsg: Message = {
        _id: response.data.message._id || Date.now().toString(),
        senderId: user!._id,
        senderName: user!.name,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        isAIModerated: response.data.message.isAIModerated || false
      }

      setMessages(prev => [...prev, newMsg])
      setNewMessage('')
    } catch (error: any) {
      console.error('Error sending message:', error)
      setError(error.response?.data?.message || 'Failed to send message')
    } finally {
      setIsSendingMessage(false)
    }
  }

  const handleJoinGroup = async () => {
    if (!token) return

    try {
      setIsJoining(true)
      setError('')

      const response = await api.post(`/collaboration/groups/${groupId}/join`)
      
      // Update group with new member info
      if (response.data.group) {
        setGroup(response.data.group)
      }

      // Call parent callback if provided
      if (onJoinGroup) {
        onJoinGroup()
      }
    } catch (error: any) {
      console.error('Error joining group:', error)
      setError(error.response?.data?.message || 'Failed to join group')
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeaveGroup = async () => {
    if (!token || !user) return

    try {
      setError('')

      const response = await api.post(`/collaboration/groups/${groupId}/leave`)
      
      // Update group without the current user
      if (response.data.group) {
        setGroup(response.data.group)
      }
    } catch (error: any) {
      console.error('Error leaving group:', error)
      setError(error.response?.data?.message || 'Failed to leave group')
    }
  }

  const isUserMember = group?.members.some(member => member._id === user?._id)
  const isUserModerator = group?.moderator._id === user?._id
  const isGroupFull = (group?.members?.length || 0) >= (group?.maxMembers || 10)

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en', { 
      month: 'short', 
      day: 'numeric',
      year: new Date(timestamp).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  if (!isOpen) return null

  // Debug: Always log when modal is about to render
  console.log('GroupDetailModal - Rendering modal, isOpen:', isOpen, 'groupId:', groupId)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Debug overlay */}
      <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded z-50">
        DEBUG: Modal Open - Group ID: {groupId}
      </div>
      <Card className="w-full max-w-4xl max-h-[90vh] bg-white/10 backdrop-blur-md border-white/20 shadow-2xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white">
                {group?.name || 'Study Group'}
              </CardTitle>
              <p className="text-white/70 text-sm">
                {group?.subject} • {group?.topic}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-0 h-[calc(90vh-80px)] overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white/70">Loading group details...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-red-400 mb-4">{error}</p>
                <Button onClick={onClose} variant="outline" className="border-white/20 text-white/80">
                  Close
                </Button>
              </div>
            </div>
          ) : !group ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-white/70 mb-4">Group not found</p>
                <Button onClick={onClose} variant="outline" className="border-white/20 text-white/80">
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full">
              {/* Main Content Area */}
              <div className="flex-1 flex flex-col">
                {/* Group Info Header */}
                <div className="p-6 border-b border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-white/60" />
                      <span className="text-white/80 text-sm">
                        {group.members.length}/{group.maxMembers} members
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white/60" />
                      <span className="text-white/80 text-sm">
                        Created {formatDate(group.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-white/60" />
                      <span className="text-white/80 text-sm">
                        {group.subject}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    {!isUserMember && !isGroupFull && (
                      <Button 
                        onClick={handleJoinGroup}
                        disabled={isJoining}
                        className="bg-gradient-to-r from-blue-400 to-purple-500 text-white"
                      >
                        {isJoining ? 'Joining...' : 'Join Group'}
                      </Button>
                    )}
                    {isUserMember && !isUserModerator && (
                      <Button 
                        onClick={handleLeaveGroup}
                        variant="outline"
                        className="border-white/20 text-white/80 hover:text-white"
                      >
                        Leave Group
                      </Button>
                    )}
                    {isUserModerator && (
                      <Button variant="outline" className="border-white/20 text-white/80 hover:text-white">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Group
                      </Button>
                    )}
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 flex flex-col p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Group Chat</h3>
                  
                  {/* Messages List */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {messages.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/50">No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message._id}
                          className={`flex ${message.senderId === user?._id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.senderId === user?._id
                                ? 'bg-blue-500 text-white'
                                : 'bg-white/20 text-white'
                            }`}
                          >
                            {message.senderId !== user?._id && (
                              <p className="text-xs opacity-75 mb-1">{message.senderName}</p>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-75 mt-1">
                              {formatTime(message.timestamp)}
                            </p>
                            {message.isAIModerated && (
                              <Badge className="mt-1 text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                                AI Moderated
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Message Input */}
                  {isUserMember ? (
                    <form onSubmit={sendMessage} className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
                        disabled={isSendingMessage}
                      />
                      <Button
                        type="submit"
                        disabled={!newMessage.trim() || isSendingMessage}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {isSendingMessage ? (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-white/50 text-sm">Join this group to participate in the conversation</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Members Sidebar */}
              <div className="w-80 border-l border-white/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Members</h3>
                
                <div className="space-y-3">
                  {/* Moderator */}
                  <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{group.moderator.name}</p>
                      <p className="text-yellow-400 text-xs">Moderator</p>
                    </div>
                  </div>

                  {/* Regular Members */}
                  {group.members.map((member) => (
                    <div key={member._id} className="flex items-center gap-3 p-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{member.name}</p>
                        <p className="text-white/50 text-xs">{member.email}</p>
                      </div>
                      {member._id === user?._id && (
                        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                          You
                        </Badge>
                      )}
                    </div>
                  ))}

                  {group.members.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
                      <p className="text-white/50 text-sm">No members yet</p>
                    </div>
                  )}
                </div>

                {/* Group Stats */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <h4 className="text-white font-medium mb-3">Group Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Total Members</span>
                      <span className="text-white">{group.members.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Max Capacity</span>
                      <span className="text-white">{group.maxMembers}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Status</span>
                      <Badge className={group.isActive ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'}>
                        {group.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

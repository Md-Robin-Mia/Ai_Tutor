import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, Clock, Star, GraduationCap, Zap, Target, TrendingUp, ChevronRight, Flame, Trophy, Brain, Sparkles, Award, BarChart3, Calendar, Activity, Lightbulb, Rocket, MessageSquare, Play } from 'lucide-react'
import '../styles/dashboard-theme.css'
import { useAuthStore } from '../store/authStore'
import StudentPurchaseHistory from '../components/StudentPurchaseHistory'
import StudentAchievements from '../components/StudentAchievements'
import StudentProgress from '../components/StudentProgress'
import StudentCourses from '../components/StudentCourses'

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [animatedStats, setAnimatedStats] = useState({ courses: 0, enrolled: 0, progress: 0, completed: 0, streak: 0, points: 0 })
  const [mounted, setMounted] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'courses' | 'progress' | 'achievements' | 'purchases'>('overview')
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(false)
  const { token } = useAuthStore()
  
  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'lesson', title: 'Completed: React Hooks', time: '2 hours ago', icon: Play, color: 'green' },
    { id: 2, type: 'achievement', title: 'Earned: Fast Learner Badge', time: '5 hours ago', icon: Trophy, color: 'yellow' },
    { id: 3, type: 'course', title: 'Started: Machine Learning Basics', time: '1 day ago', icon: BookOpen, color: 'blue' },
    { id: 4, type: 'streak', title: '7 Day Streak Achieved!', time: '2 days ago', icon: Flame, color: 'orange' }
  ])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([
    { id: 1, course: 'Web Development Fundamentals', task: 'Complete Chapter 5', deadline: '2 days', priority: 'high' },
    { id: 2, course: 'React & Modern JavaScript', task: 'Submit Project', deadline: '5 days', priority: 'medium' },
    { id: 3, course: 'Machine Learning Basics', task: 'Quiz #3', deadline: '1 week', priority: 'low' }
  ])

  // Fetch real dashboard data
  const fetchDashboardData = async () => {
    if (!token) return
    
    setDataLoading(true)
    try {
      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
        
        // Update animated stats with real data
        setAnimatedStats({
          courses: data.subjectPerformance?.length || 12,
          enrolled: data.subjectPerformance?.filter((s: any) => s.completion > 0 && s.completion < 100).length || 5,
          progress: Math.round(data.learningTrends?.consistency || 68),
          completed: data.subjectPerformance?.filter((s: any) => s.completion === 100).length || 3,
          streak: data.currentStreak || 7,
          points: data.xp || 2450
        })
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  // Fetch data when component mounts or token changes
  useEffect(() => {
    if (token) {
      fetchDashboardData()
    }
  }, [token])

  // Refresh data periodically for real-time updates
  useEffect(() => {
    if (!token) return
    
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [token])

  const handleStartLearning = () => {
    navigate('/ai-tutor-chat')
  }

  const handleViewCourses = () => {
    navigate('/student-dashboard')
  }

  const handleChatWithAI = () => {
    navigate('/ai-tutor-chat')
  }

  useEffect(() => {
    setMounted(true)
    // Simulate loading and data fetching
    const timer = setTimeout(() => {
      setLoading(false)
      // Animate stats with real data if available, otherwise use defaults
      setTimeout(() => {
        if (dashboardData) {
          setAnimatedStats({
            courses: dashboardData.subjectPerformance?.length || 12,
            enrolled: dashboardData.subjectPerformance?.filter((s: any) => s.completion > 0 && s.completion < 100).length || 5,
            progress: Math.round(dashboardData.learningTrends?.consistency || 68),
            completed: dashboardData.subjectPerformance?.filter((s: any) => s.completion === 100).length || 3,
            streak: dashboardData.currentStreak || 7,
            points: dashboardData.xp || 2450
          })
        } else {
          setAnimatedStats({ 
            courses: 12, 
            enrolled: 5, 
            progress: 68, 
            completed: 3,
            streak: 7,
            points: 2450
          })
        }
      }, 100)
    }, 1500)
    return () => clearTimeout(timer)
  }, [dashboardData])

  if (loading) {
    return (
      <div className="dashboard-layout min-h-screen relative overflow-hidden">
        {/* Static loading background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
          <div className="absolute top-40 right-20 w-64 h-64 bg-gradient-to-r from-pink-400 to-red-400 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mix-blend-screen filter blur-3xl opacity-20"></div>
        </div>
        
        <div className="flex items-center justify-center h-screen relative z-10">
          <div className="glass-loading-card p-8 text-center space-y-8">
            <div className="relative">
              <div className="w-20 h-20 mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping"></div>
                <div className="absolute inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-8 h-8 text-white animate-bounce" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Loading Your Learning Universe
              </h2>
              <p className="text-white/80 text-lg">Preparing your personalized dashboard...</p>
              <div className="flex justify-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-layout min-h-screen relative overflow-hidden">
      {/* Static background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Static gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 w-full" style={{paddingTop: '100px'}}>
        {/* Main CTA Section */}
        <div className="glass-card-advanced p-6 text-center mb-8 w-full">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Ready to Continue Your Journey?
              </h2>
              {dataLoading && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <p className="text-base text-white/80 max-w-2xl mx-auto">
              Join <span className="text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-bold">10,000+ students</span> achieving their learning goals with cutting-edge courses and AI-powered guidance.
              {!dataLoading && dashboardData && (
                <span className="ml-2 text-green-400 text-sm">• Live data</span>
              )}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button 
                onClick={handleStartLearning}
                className="glass-button-primary group relative overflow-hidden text-white px-6 py-3 rounded-xl font-black text-lg transform hover:scale-105 transition-all duration-500"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  Start Learning Now
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
              <button 
                onClick={handleViewCourses}
                className="glass-button-secondary text-white px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300"
              >
                Browse Courses
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-white/60">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span className="text-sm">Expert-led courses</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span className="text-sm">Verified certificates</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                <span className="text-sm">AI-powered learning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-5xl mx-auto">
          <div 
            onClick={handleStartLearning}
            className="glass-card-advanced p-4 cursor-pointer group hover:scale-105 transition-all duration-300 text-center"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-3 shadow-lg group-hover:rotate-12 transition-transform duration-300 mx-auto">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Quick Start</h3>
            <p className="text-blue-300 text-xs mb-3">Jump back into your latest lesson</p>
            <button className="glass-button-primary w-full text-white py-2 px-3 rounded-lg font-semibold transition-all duration-300 text-sm">
              Resume Learning
            </button>
          </div>
          
          <div 
            onClick={handleChatWithAI}
            className="glass-card-advanced p-4 cursor-pointer group hover:scale-105 transition-all duration-300 text-center"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mb-3 shadow-lg group-hover:rotate-12 transition-transform duration-300 mx-auto">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">AI Tutor</h3>
            <p className="text-green-300 text-xs mb-3">Get instant help from your AI assistant</p>
            <button className="glass-button-secondary w-full text-white py-2 px-3 rounded-lg font-semibold transition-all duration-300 text-sm">
              Chat with AI
            </button>
          </div>
          
          <div 
            className="glass-card-advanced p-4 cursor-pointer group hover:scale-105 transition-all duration-300 text-center"
            onClick={() => navigate('/daily-challenge')}
          >
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl mb-3 shadow-lg group-hover:rotate-12 transition-transform duration-300 mx-auto">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Daily Challenge</h3>
            <p className="text-orange-300 text-xs mb-3">Test your knowledge and earn points</p>
            <button className="glass-button-accent w-full text-white py-2 px-3 rounded-lg font-semibold transition-all duration-300 text-sm">
              Start Challenge
            </button>
          </div>
        </div>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-6xl mx-auto">
          <div 
            className="stats-card group interactive-element-advanced cursor-pointer"
            onMouseEnter={() => setHoveredCard('courses')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-white transition-all duration-700">{animatedStats.courses}</div>
            </div>
            <div className="text-blue-300 font-bold text-sm mb-2">Course Library</div>
            <div className="flex items-center gap-2 text-blue-400 text-xs">
              <Target className="w-3 h-3" />
              <span>Explore new horizons</span>
            </div>
            <div className={`text-sm text-blue-400 mt-3 transition-all duration-300 ${hoveredCard === 'courses' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                <span>Discover trending topics</span>
              </div>
            </div>
          </div>

          <div 
            className="stats-card success group interactive-element-advanced cursor-pointer"
            onMouseEnter={() => setHoveredCard('enrolled')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-white transition-all duration-700">{animatedStats.enrolled}</div>
            </div>
            <div className="text-green-300 font-bold text-sm mb-2">Active Enrollments</div>
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <Play className="w-3 h-3" />
              <span>Continue your journey</span>
            </div>
            <div className={`text-sm text-green-400 mt-3 transition-all duration-300 ${hoveredCard === 'enrolled' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                <span>Resume latest lesson</span>
              </div>
            </div>
          </div>

          <div 
            className="stats-card warning group interactive-element-advanced cursor-pointer"
            onMouseEnter={() => setHoveredCard('progress')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-white transition-all duration-700">{animatedStats.progress}%</div>
            </div>
            <div className="text-orange-300 font-bold text-sm mb-2">Learning Progress</div>
            <div className="mb-3">
              <div className="w-full bg-orange-900/30 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-orange-400 to-red-400 h-1.5 rounded-full transition-all duration-1000"
                  style={{ width: `${animatedStats.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-400 text-xs">
              <BarChart3 className="w-3 h-3" />
              <span>Track your growth</span>
            </div>
            <div className={`text-sm text-orange-400 mt-3 transition-all duration-300 ${hoveredCard === 'progress' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                <span>View detailed analytics</span>
              </div>
            </div>
          </div>

          <div 
            className="stats-card group interactive-element-advanced cursor-pointer"
            onMouseEnter={() => setHoveredCard('completed')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="text-2xl font-black text-white transition-all duration-700">{animatedStats.completed}</div>
            </div>
            <div className="text-purple-300 font-bold text-sm mb-2">Achievements</div>
            <div className="flex items-center gap-2 text-purple-400 text-xs">
              <Award className="w-3 h-3" />
              <span>Earn certificates</span>
            </div>
            <div className={`text-sm text-purple-400 mt-3 transition-all duration-300 ${hoveredCard === 'completed' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <div className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3" />
                <span>View your badges</span>
              </div>
            </div>
          </div>
        </div>

        
        {/* Tab Navigation */}
        <div className="mb-8 max-w-3xl mx-auto">
          <div className="glass-tab-navigation flex flex-wrap gap-2 justify-center">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'courses', label: 'Courses', icon: BookOpen },
              { id: 'progress', label: 'Progress', icon: TrendingUp },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'purchases', label: 'Purchases', icon: Star }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedTab === tab.id
                      ? 'glass-button-primary text-white shadow-lg'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="space-y-8 max-w-6xl mx-auto">
            {/* Welcome Section */}
            <div className="glass-card-advanced p-6 text-center">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-4">
                Welcome Back, Student!
              </h2>
              <p className="text-white/80 max-w-2xl mx-auto">
                Here's your learning overview. Track your progress, achievements, and stay motivated on your educational journey.
              </p>
            </div>

            {/* Learning Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass-card-advanced p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-black text-white mb-2">{animatedStats.streak}</div>
                <div className="text-blue-300 font-bold">Day Streak</div>
                <div className="text-blue-400 text-sm mt-2">Keep it going!</div>
              </div>

              <div className="glass-card-advanced p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-black text-white mb-2">{animatedStats.points.toLocaleString()}</div>
                <div className="text-green-300 font-bold">XP Points</div>
                <div className="text-green-400 text-sm mt-2">Level up soon!</div>
              </div>

              <div className="glass-card-advanced p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-black text-white mb-2">24h</div>
                <div className="text-orange-300 font-bold">Learning Time</div>
                <div className="text-orange-400 text-sm mt-2">This week</div>
              </div>

              <div className="glass-card-advanced p-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-black text-white mb-2">{animatedStats.progress}%</div>
                <div className="text-purple-300 font-bold">Completion Rate</div>
                <div className="text-purple-400 text-sm mt-2">Above average!</div>
              </div>
            </div>

            {/* Recent Activity & Upcoming Deadlines */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="glass-card-advanced p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon
                    return (
                      <div key={activity.id} className="glass-card-mini p-3 flex items-center gap-4 hover:scale-105 transition-all duration-300">
                        <div className={`w-10 h-10 bg-gradient-to-br from-${activity.color}-500 to-${activity.color}-600 rounded-xl flex items-center justify-center shadow-lg`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{activity.title}</div>
                          <div className="text-white/60 text-sm">{activity.time}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Upcoming Deadlines */}
              <div className="glass-card-advanced p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  Upcoming Deadlines
                </h3>
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="glass-card-mini p-3 hover:scale-105 transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-white font-medium">{deadline.task}</div>
                          <div className="text-white/60 text-sm">{deadline.course}</div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          deadline.priority === 'high' 
                            ? 'bg-red-500/20 text-red-400' 
                            : deadline.priority === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {deadline.deadline}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card-advanced p-6">
              <h3 className="text-xl font-bold text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={handleStartLearning}
                  className="glass-button-primary p-4 rounded-xl text-white font-medium transition-all duration-300 text-center hover:scale-105"
                >
                  <Rocket className="w-6 h-6 mx-auto mb-2" />
                  Continue Learning
                </button>
                <button 
                  onClick={() => navigate('/courses')}
                  className="glass-button-secondary p-4 rounded-xl text-white font-medium transition-all duration-300 text-center hover:scale-105"
                >
                  <BookOpen className="w-6 h-6 mx-auto mb-2" />
                  Browse Courses
                </button>
                <button 
                  onClick={handleChatWithAI}
                  className="glass-button-accent p-4 rounded-xl text-white font-medium transition-all duration-300 text-center hover:scale-105"
                >
                  <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                  Ask AI Tutor
                </button>
              </div>
            </div>
          </div>
        )}
        {selectedTab === 'courses' && (
          <StudentCourses />
        )}
        {selectedTab === 'progress' && (
          <StudentProgress />
        )}
        {selectedTab === 'achievements' && (
          <StudentAchievements />
        )}
        {selectedTab === 'purchases' && (
          <StudentPurchaseHistory />
        )}
      </div>
    </div>
  )
}

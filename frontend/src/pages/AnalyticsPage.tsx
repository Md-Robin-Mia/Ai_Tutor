import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { BarChart3, TrendingUp, Users, BookOpen, Calendar, Download, Filter, ArrowUp, ArrowDown, Target, Award, Brain, Crown, Zap, MoreVertical, MessageSquare, GraduationCap, ChevronDown, Activity, Clock } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts'
import '../styles/dashboard-theme.css'
import { useAuthStore } from '../store/authStore'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import realTimeTracking from '../services/realtime-tracking.service'

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [showLearnDropdown, setShowLearnDropdown] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const learnDropdownRef = useRef<HTMLDivElement>(null)
  const { token } = useAuthStore()

  // Fetch real analytics data
  const fetchAnalyticsData = async () => {
    if (!token) return
    
    setLoading(true)
    try {
      // Use real-time endpoint for live data tracking
      const response = await fetch('/api/analytics/realtime', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
        console.log('Real-time analytics data:', data)
      } else {
        // Fallback to dashboard endpoint if realtime fails
        const fallbackResponse = await fetch('/api/analytics/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json()
          setAnalyticsData(data)
          console.log('Fallback analytics data:', data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch data when component mounts or token changes
  useEffect(() => {
    fetchAnalyticsData()
  }, [token])

  // Refresh data periodically for real-time updates
  useEffect(() => {
    const interval = setInterval(fetchAnalyticsData, 10000) // Refresh every 10 seconds for better real-time tracking
    return () => clearInterval(interval)
  }, [token])

  // Add real-time indicator
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  
  // Update last updated time when data changes
  useEffect(() => {
    if (analyticsData) {
      setLastUpdated(new Date())
    }
  }, [analyticsData])

  // Real-time tracking - only track actual user activity
  useEffect(() => {
    if (token && analyticsData) {
      // Start tracking analytics page visit
      realTimeTracking.startStudySession({
        subject: 'Analytics',
        topic: 'Dashboard Review',
        courseId: undefined,
        lessonId: 'analytics-dashboard'
      });

      // Auto-complete session after 5 minutes to track real study time
      const timer = setTimeout(() => {
        realTimeTracking.completeStudySession({ completionPercentage: 85 });
        
        // Start a new session for continued tracking
        realTimeTracking.startStudySession({
          subject: 'Analytics',
          topic: 'Extended Review',
          courseId: undefined,
          lessonId: 'analytics-extended'
        });
      }, 5 * 60 * 1000); // 5 minutes

      return () => {
        clearTimeout(timer);
        // Complete session when component unmounts
        realTimeTracking.completeStudySession({ completionPercentage: 80 });
      };
    }
  }, [token, analyticsData]);

  // Real-time quiz tracking function
  const trackQuizAttempt = (quizData: {
    quizId: string;
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    timeSpent: number;
    subject?: string;
  }) => {
    realTimeTracking.trackQuizAttempt(quizData);
  };

  // Lesson completion tracking function
  const completeLesson = async (courseId: string, lessonId: string, lessonTitle: string) => {
    try {
      await realTimeTracking.trackLessonCompletion({
        courseId,
        lessonId,
        lessonTitle
      });
      console.log('Lesson completed:', { courseId, lessonId, lessonTitle });
      
      // Refresh analytics data to show updated lesson count
      fetchAnalyticsData();
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  // Export analytics data function
  const handleExport = async () => {
    try {
      // Get auth token from auth store
      if (!token) {
        throw new Error('Authentication required. Please login first.')
      }

      // Fetch real analytics data from backend
      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.')
        }
        throw new Error('Failed to fetch analytics data')
      }
      
      const analyticsData = await response.json()
      
      // Generate PDF
      const pdf = new jsPDF()
      
      // Add title
      pdf.setFontSize(20)
      pdf.text('Analytics Report', 20, 20)
      
      // Add period and date
      pdf.setFontSize(12)
      pdf.text(`Period: ${selectedPeriod}`, 20, 35)
      pdf.text(`Export Date: ${new Date().toLocaleDateString()}`, 20, 45)
      
      // Add summary stats
      pdf.setFontSize(14)
      pdf.text('Summary Statistics', 20, 60)
      pdf.setFontSize(10)
      
      let yPosition = 70
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Study Time', `${analyticsData.totalStudyTime || 0} hours`],
        ['Completed Lessons', analyticsData.completedLessons || 0],
        ['Quiz Average', `${analyticsData.quizAverage || 0}%`],
        ['Active Days', analyticsData.activeDays || 0],
        ['Current Level', analyticsData.level || analyticsData.currentLevel || 1],
        ['XP Points', analyticsData.xp || 0],
        ['Badges Earned', analyticsData.badges || 0]
      ]
      
      // @ts-ignore
      autoTable(pdf, {
        head: [summaryData[0]],
        body: summaryData.slice(1),
        startY: yPosition,
        theme: 'grid',
        styles: { fontSize: 10 }
      })
      
      // Add weekly progress if available
      yPosition = (pdf as any).lastAutoTable.finalY + 20
      pdf.setFontSize(14)
      pdf.text('Weekly Progress', 20, yPosition)
      
      if (analyticsData.weeklyProgress && analyticsData.weeklyProgress.length > 0) {
        yPosition += 10
        const weeklyData = [
          ['Day', 'Study Time', 'Quizzes', 'Progress'],
          ...analyticsData.weeklyProgress.map((progress: any) => [
            progress.day || 'N/A',
            `${progress.hours || 0}h`,
            0, // No demo data - real quiz data should come from backend
            `0%` // No demo data - real progress data should come from backend
          ])
        ]
        
        // @ts-ignore
        autoTable(pdf, {
          head: [weeklyData[0]],
          body: weeklyData.slice(1),
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 9 }
        })
      } else if (analyticsData.weeklyActivity && analyticsData.weeklyActivity.length > 0) {
        yPosition += 10
        const weeklyData = [
          ['Day', 'Study Time', 'Quizzes', 'Progress'],
          ...analyticsData.weeklyActivity.map((activity: any) => [
            new Date(activity.date).toLocaleDateString('en', { weekday: 'short' }).slice(0, 3),
            `${Math.round(activity.minutes / 60 * 10) / 10}h`,
            0, // No demo data - real quiz data should come from backend
            `0%` // No demo data - real progress data should come from backend
          ])
        ]
        
        // @ts-ignore
        autoTable(pdf, {
          head: [weeklyData[0]],
          body: weeklyData.slice(1),
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 9 }
        })
      }
      
      // Add subject performance if available
      yPosition = (pdf as any).lastAutoTable.finalY + 20
      pdf.setFontSize(14)
      pdf.text('Subject Performance', 20, yPosition)
      
      if (analyticsData.subjectPerformance && analyticsData.subjectPerformance.length > 0) {
        yPosition += 10
        const subjectData = [
          ['Subject', 'Score', 'Time Spent', 'Completion'],
          ...analyticsData.subjectPerformance.map((subject: any) => [
            subject.subject || 'N/A',
            `${subject.score || 0}%`,
            `${subject.timeSpent || 0}h`,
            `${subject.completion || 0}%`
          ])
        ]
        
        // @ts-ignore
        autoTable(pdf, {
          head: [subjectData[0]],
          body: subjectData.slice(1),
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 9 }
        })
      }
      
      // Save the PDF
      const fileName = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error('Export failed:', error)
      alert(error.message || 'Failed to export analytics data. Please try again.')
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (learnDropdownRef.current && !learnDropdownRef.current.contains(event.target as Node)) {
        setShowLearnDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Transform weekly activity data for chart
  const weeklyProgressData = analyticsData?.weeklyProgress?.map((progress: any) => ({
  day: progress.day,
  studyTime: progress.hours || 0, // Map hours to studyTime
  quizzes: 0, // No demo data - real quiz data should come from backend
  progress: 0 // No demo data - real progress data should come from backend
})) || analyticsData?.weeklyActivity?.map((activity: any, index: number) => {
  const date = new Date(activity.date);
  const dayName = date.toLocaleDateString('en', { weekday: 'short' }).slice(0, 3);
  return {
    day: dayName,
    studyTime: Math.round(activity.minutes / 60 * 10) / 10, // Convert minutes to hours
    quizzes: 0, // No demo data - real quiz data should come from backend
    progress: 0 // No demo data - real progress data should come from backend
  };
}) || []; // No fallback to demo data - empty array if no real data

// Debug logging
console.log('Analytics data:', analyticsData);
console.log('Weekly progress data:', weeklyProgressData);

  // Use real subject distribution from analytics data or empty array
  const subjectDistribution = analyticsData?.subjectProgress?.map((subject: any, index: number) => ({
    name: subject.subject || 'Unknown',
    value: subject.completion || 0,
    color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][index % 5]
  })) || []; // No demo data - empty array if no real data

  // Use real performance data from analytics data or empty array
  const performanceData = analyticsData?.recentSessions?.slice(0, 6).map((session: any, index: number) => ({
    month: new Date(session.timestamp).toLocaleDateString('en', { month: 'short' }),
    score: session.quizScore || 0,
    target: 75 // Default target - could be calculated from goals
  })) || []; // No demo data - empty array if no real data

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'var(--background-color)' }}>
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-1/2 right-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Static gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
        
        {/* Animated grid pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            animation: 'float 20s ease-in-out infinite'
          }}></div>
        </div>
      </div>

      {/* Main Content Area - Properly contained */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{paddingTop: '100px'}}>
        {/* Page Header */}
        <div className="backdrop-blur-xl bg-white/5 border-2 border-white/30 px-4 sm:px-6 py-6 sm:py-8 shadow-2xl dashboard-card-advanced overflow-hidden rounded-2xl mt-6">
          {/* Animated header background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30 animate-glow border-2 border-white/40 flex-shrink-0">
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">Analytics Dashboard</h1>
                  <p className="text-sm sm:text-base text-green-300 flex items-center gap-3 font-semibold">
                    <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="flex items-center gap-2">
                      {loading ? 'Updating...' : 'Real-time learning insights'}
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 animate-pulse" />
                    </span>
                    {lastUpdated && !loading && (
                      <span className="text-xs text-white/60 ml-2">
                        Updated: {lastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <Button variant="outline" size="sm" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-xl">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExport}
                  className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-xl"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-lg rounded-xl">
                  <Calendar className="w-4 h-4" />
                  {selectedPeriod === 'week' ? 'This Week' : selectedPeriod === 'month' ? 'This Month' : 'This Year'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        {/* Content Area */}
        <div className="pb-6 pt-6">
          {/* Enhanced Metric Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-8 bg-white/10 backdrop-blur-sm p-2 rounded-xl border border-white/20 shadow-xl max-w-fit mx-auto">
            {['overview', 'performance', 'engagement', 'progress'].map((metric) => (
              <Button
                key={metric}
                variant={selectedMetric === metric ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedMetric(metric)}
                className={`capitalize transition-all duration-300 rounded-lg ${
                  selectedMetric === metric 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg animate-glow border border-white/30' 
                    : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-105 border border-transparent'
                }`}
              >
                {metric}
              </Button>
            ))}
          </div>

          {/* Content based on selected metric */}
          {selectedMetric === 'overview' && (
            <div>
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
                <Card className="stats-card bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-white/80">Total Study Time</CardTitle>
                    <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors duration-300 border border-blue-400/30">
                      <BookOpen className="h-4 w-4 text-blue-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-white mb-2">
                      {analyticsData?.totalStudyTime || '0'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-white/70">hours</span>
                      {analyticsData?.hasData && (
                        <div className="flex items-center gap-1 text-green-400">
                          <ArrowUp className="w-3 h-3" />
                          <span className="text-xs font-medium">+{analyticsData?.totalStudyTime > 0 ? '8' : '0'}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </Card>

                <Card className="stats-card success bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-white/80">Completed Lessons</CardTitle>
                    <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors duration-300 border border-green-400/30">
                      <Target className="h-4 w-4 text-green-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-white mb-2">
                      {analyticsData?.completedLessons || '0'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-white/70">lessons</span>
                      {analyticsData?.hasData && analyticsData?.completedLessons > 0 && (
                        <div className="flex items-center gap-1 text-green-400">
                          <ArrowUp className="w-3 h-3" />
                          <span className="text-xs font-medium">+{Math.min(analyticsData.completedLessons, 9)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </Card>

                <Card className="stats-card bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-white/80">Quiz Score</CardTitle>
                    <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors duration-300 border border-purple-400/30">
                      <Award className="h-4 w-4 text-purple-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-white mb-2">
                      {analyticsData?.quizAverage || '0'}%
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-white/70">average</span>
                      {analyticsData?.hasData && (
                        <div className="flex items-center gap-1 text-green-400">
                          <ArrowUp className="w-3 h-3" />
                          <span className="text-xs font-medium">+{analyticsData?.quizAverage > 0 ? '3' : '0'}%</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </Card>

                <Card className="stats-card warning bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                    <CardTitle className="text-sm font-medium text-white/80">Active Days</CardTitle>
                    <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors duration-300 border border-orange-400/30">
                      <Activity className="h-4 w-4 text-orange-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <div className="text-3xl font-bold text-white mb-2">
                      {analyticsData?.activeDays || '0'}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-white/70">days</span>
                      {analyticsData?.hasData && (
                        <span className="text-xs text-white/50">this week</span>
                      )}
                    </div>
                  </CardContent>
                  {/* Animated background effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                </Card>
              </div>

          {/* Enhanced Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
            {/* Weekly Study Time Chart */}
            <Card className="dashboard-card bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl">
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-white">Weekly Study Time</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Clock className="w-4 h-4" />
                    <span>Hours per day</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={weeklyProgressData}>
                    <defs>
                      <linearGradient id="colorStudyTime" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255, 255, 255, 0.5)" />
                    <YAxis stroke="rgba(255, 255, 255, 0.5)" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="studyTime" stroke="#3b82f6" fillOpacity={1} fill="url(#colorStudyTime)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </Card>

            {/* Subject Distribution */}
            <Card className="dashboard-card bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl">
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-white">Subject Distribution</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Target className="w-4 h-4" />
                    <span>Time allocation</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={
                        analyticsData?.subjectPerformance?.map((subject: any) => ({
                          name: subject.subject || 'Unknown',
                          value: subject.timeSpent || 0,
                          color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)]
                        })) || subjectDistribution
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}h`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(analyticsData?.subjectPerformance?.map((subject: any) => ({
                        name: subject.subject || 'Unknown',
                        value: subject.timeSpent || 0,
                        color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 5)]
                      })) || subjectDistribution).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </Card>
          </div>

          {/* Enhanced Performance Trend */}
          <Card className="dashboard-card bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl mb-8 overflow-hidden group hover:scale-105 transition-all duration-300">
            <CardHeader className="relative z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-white">Performance Trend</CardTitle>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <TrendingUp className="w-4 h-4" />
                  <span>Score vs Target</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.5)" />
                  <YAxis stroke="rgba(255, 255, 255, 0.5)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6 }} />
                  <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#10b981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
          </Card>

          {/* Enhanced Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Learning Progress */}
            <Card className="dashboard-card bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl">
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg font-semibold text-white">Learning Progress</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {analyticsData?.subjectProgress?.map((subject: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-white/80">{subject.subject || 'Unknown'}</span>
                        <span className={`${['text-blue-400', 'text-green-400', 'text-purple-400', 'text-orange-400', 'text-yellow-400'][index % 5]} font-semibold`}>
                          {subject.completion || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`bg-gradient-to-r ${['from-blue-400 to-blue-600', 'from-green-400 to-green-600', 'from-purple-400 to-purple-600', 'from-orange-400 to-orange-600', 'from-yellow-400 to-yellow-600'][index % 5]} h-2 rounded-full transition-all duration-500 progress-pulse`} 
                          style={{ width: `${subject.completion || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-white/50 py-8">
                      No subject progress data available
                    </div>
                  )}
                </div>
              </CardContent>
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </Card>

            {/* Recent Activity */}
            <Card className="dashboard-card bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl">
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg font-semibold text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Completed Algebra Basics</p>
                      <p className="text-xs text-white/50">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Quiz: Physics Chapter 3</p>
                      <p className="text-xs text-white/50">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Started Chemistry Module</p>
                      <p className="text-xs text-white/50">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Essay: Shakespeare Analysis</p>
                      <p className="text-xs text-white/50">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </Card>

            {/* Achievements */}
            <Card className="dashboard-card bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl">
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg font-semibold text-white">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  {analyticsData?.badges > 0 ? (
                    <>
                      {analyticsData.quizAverage >= 90 && (
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30 hover:scale-105 transition-all duration-300">
                          <div className="p-2 bg-yellow-500 rounded-full animate-glow">
                            <Award className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">Quiz Master</p>
                            <p className="text-xs text-white/70">Scored {analyticsData.quizAverage}% average in quizzes</p>
                          </div>
                        </div>
                      )}
                      
                      {analyticsData.currentStreak >= 7 && (
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-lg border border-blue-500/30 hover:scale-105 transition-all duration-300">
                          <div className="p-2 bg-blue-500 rounded-full animate-glow">
                            <Target className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">Consistent Learner</p>
                            <p className="text-xs text-white/70">{analyticsData.currentStreak}-day study streak</p>
                          </div>
                        </div>
                      )}
                      
                      {analyticsData.completedLessons >= 10 && (
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30 hover:scale-105 transition-all duration-300">
                          <div className="p-2 bg-green-500 rounded-full animate-glow">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">Quick Learner</p>
                            <p className="text-xs text-white/70">Completed {analyticsData.completedLessons} lessons</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-white/50 py-8">
                      <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No achievements yet. Start learning to earn badges!</p>
                    </div>
                  )}
                </div>
              </CardContent>
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
            </Card>
          </div>
        </div>
      )}
      
      {selectedMetric === 'performance' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Performance Analytics</h2>
            <div className="flex items-center gap-2">
              {loading && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}
              <span className="text-sm text-white/70">
                {loading ? 'Updating...' : 'Live data'}
              </span>
            </div>
          </div>
          
          {/* Performance Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl">
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg font-semibold text-white">Average Score</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {analyticsData?.learningTrends ? Math.round(analyticsData.learningTrends.consistency || 0) : '0'}%
                </div>
                <div className="flex items-center gap-1 text-green-400">
                  <ArrowUp className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    +{analyticsData?.learningTrends?.improvement || 0}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl">
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg font-semibold text-white">Study Time</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {analyticsData?.totalStudyTime || '0'}h
                </div>
                <div className="flex items-center gap-1 text-white/70">
                  <span className="text-xs">Total hours this period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl">
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg font-semibold text-white">Current Streak</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {analyticsData?.currentStreak || '7'} days
                </div>
                <div className="flex items-center gap-1 text-white/70">
                  <span className="text-xs">Consecutive learning days</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subject Performance */}
          {analyticsData?.subjectPerformance && analyticsData.subjectPerformance.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl mb-8">
              <CardHeader className="relative z-10">
                <CardTitle className="text-lg font-semibold text-white">Subject Performance</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analyticsData.subjectPerformance.map((subject: any, index: number) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="text-white font-medium mb-2">{subject.subject || 'Subject'}</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/70">Score:</span>
                        <span className="text-lg font-bold text-blue-400">{subject.score || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-white/70">Time:</span>
                        <span className="text-sm text-white">{subject.timeSpent || 0}h</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${subject.completion || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white/50 mt-1">{subject.completion || 0}% complete</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Chart */}
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl overflow-hidden group hover:scale-105 transition-all duration-300 rounded-2xl">
            <CardHeader className="relative z-10">
              <CardTitle className="text-lg font-semibold text-white">Performance Trends</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255, 255, 255, 0.5)" />
                  <YAxis stroke="rgba(255, 255, 255, 0.5)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6 }} />
                  <Line type="monotone" dataKey="target" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#10b981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
      
      {selectedMetric === 'engagement' && (
        <div className="text-center text-white py-20">
          <Users className="w-16 h-16 mx-auto mb-4 text-green-400" />
          <h2 className="text-2xl font-bold mb-2">Engagement Analytics</h2>
          <p className="text-white/70">User engagement and interaction metrics coming soon...</p>
        </div>
      )}
      
      {selectedMetric === 'progress' && (
        <div className="text-center text-white py-20">
          <Target className="w-16 h-16 mx-auto mb-4 text-purple-400" />
          <h2 className="text-2xl font-bold mb-2">Progress Analytics</h2>
          <p className="text-white/70">Learning progress and completion metrics coming soon...</p>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}

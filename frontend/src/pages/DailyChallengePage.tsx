import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, Target, Clock, Flame, Star, Zap, Award, Calendar, CheckCircle, Lock, Users, TrendingUp, Brain, Sparkles, Medal, Crown, Gift } from 'lucide-react'
import '../styles/dashboard-theme.css'
import { useAuthStore } from '../store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'

export default function DailyChallengePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null)
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [quizScore, setQuizScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [userStats, setUserStats] = useState({
    streak: 0,
    totalPoints: 0,
    completedChallenges: 0,
    rank: 'Beginner',
    isTeacher: false, // Set to false - quiz creation moved to TeacherDashboard
    boughtTeacherIds: [1, 2], // Student has purchased access to teachers with IDs 1 and 2
    enrolledCourseIds: ['course1', 'course2'] // Student is enrolled in these courses
  })
  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of JavaScript basics',
      difficulty: 'Easy',
      points: 100,
      timeLimit: 15,
      category: 'Programming',
      completed: false,
      locked: false,
      questions: 10,
      icon: Brain,
      teacherId: 1,
      teacherName: 'Dr. Sarah Chen',
      teacherAvatar: '👩‍🏫',
      price: 29.99,
      courseId: 'course1', // Quiz belongs to this course
      courseName: 'JavaScript Basics',
      quizQuestions: [
        {
          question: "What is the correct way to declare a variable in JavaScript?",
          options: ["var myVariable = 5;", "variable myVariable = 5;", "v myVariable = 5;", "declare myVariable = 5;"],
          correct: "var myVariable = 5;"
        },
        {
          question: "Which method is used to add an element to the end of an array?",
          options: ["push()", "pop()", "shift()", "unshift()"],
          correct: "push()"
        },
        {
          question: "What does 'DOM' stand for?",
          options: ["Document Object Model", "Data Object Management", "Dynamic Object Model", "Document Order Model"],
          correct: "Document Object Model"
        }
      ]
    },
    {
      id: 2,
      title: 'React Hooks Mastery',
      description: 'Advanced React concepts and hooks',
      difficulty: 'Medium',
      points: 200,
      timeLimit: 20,
      category: 'Programming',
      completed: false,
      locked: false,
      questions: 15,
      icon: Sparkles,
      teacherId: 2,
      teacherName: 'Prof. Michael Lee',
      teacherAvatar: '👨‍🏫',
      price: 49.99,
      courseId: 'course2', // Quiz belongs to this course
      courseName: 'React Advanced',
      quizQuestions: [
        {
          question: "Which hook is used to manage state in functional components?",
          options: ["useEffect", "useState", "useContext", "useReducer"],
          correct: "useState"
        },
        {
          question: "What is the purpose of useEffect hook?",
          options: ["To manage state", "To handle side effects", "To create context", "To optimize performance"],
          correct: "To handle side effects"
        },
        {
          question: "Which hook is used to access context values?",
          options: ["useContext", "useEffect", "useState", "useReducer"],
          correct: "useContext"
        }
      ]
    },
    {
      id: 3,
      title: 'Data Structures Challenge',
      description: 'Arrays, trees, and graph algorithms',
      difficulty: 'Hard',
      points: 300,
      timeLimit: 30,
      category: 'Computer Science',
      completed: false,
      locked: true,
      questions: 20,
      icon: Target,
      teacherId: 3,
      teacherName: 'Dr. Emily Wang',
      teacherAvatar: '👩‍🏫',
      price: 69.99,
      courseId: 'course3', // Quiz belongs to this course (student not enrolled)
      courseName: 'Data Structures & Algorithms',
      quizQuestions: [
        {
          question: "What is the time complexity of binary search?",
          options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
          correct: "O(log n)"
        },
        {
          question: "Which data structure uses LIFO principle?",
          options: ["Queue", "Stack", "Array", "Linked List"],
          correct: "Stack"
        },
        {
          question: "What is the advantage of a hash table?",
          options: ["Ordered data", "Fast access", "Memory efficient", "Simple implementation"],
          correct: "Fast access"
        }
      ]
    }
  ])
  const [leaderboard, setLeaderboard] = useState([
    { rank: 1, name: 'Alex Chen', points: 2450, streak: 15, badge: Crown },
    { rank: 2, name: 'Sarah Johnson', points: 2380, streak: 12, badge: Medal },
    { rank: 3, name: 'Mike Williams', points: 2290, streak: 10, badge: Award },
    { rank: 4, name: 'Emma Davis', points: 2150, streak: 8, badge: Star },
    { rank: 5, name: 'You', points: userStats.totalPoints, streak: userStats.streak, badge: Trophy, isCurrentUser: true }
  ])
  const { token } = useAuthStore()

  // Filter challenges based on teacher access and course enrollment for students
  const availableChallenges = userStats.isTeacher 
    ? challenges 
    : challenges.filter(challenge => 
        userStats.boughtTeacherIds.includes(challenge.teacherId) && 
        userStats.enrolledCourseIds.includes(challenge.courseId)
      )

  // Calculate completed challenges count
  const completedChallengesCount = availableChallenges.filter(challenge => challenge.completed).length

  useEffect(() => {
    setMounted(true)
    // Simulate loading user stats
    setTimeout(() => {
      setUserStats(prev => ({
        ...prev,
        streak: 7,
        totalPoints: 1850,
        completedChallenges: 23,
        rank: 'Intermediate'
      }))
      setLoading(false)
    }, 1000)
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Beginner': return 'text-gray-600'
      case 'Intermediate': return 'text-blue-600'
      case 'Advanced': return 'text-purple-600'
      case 'Expert': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const startChallenge = (challenge: any) => {
    if (challenge.locked) {
      alert('Complete previous challenges to unlock this one!')
      return
    }
    setSelectedChallenge(challenge)
    setShowQuiz(true)
    setCurrentQuestion(0)
    setSelectedAnswer('')
    setQuizScore(0)
    setQuizCompleted(false)
  }

  const handleQuizAnswer = () => {
    if (selectedAnswer === selectedChallenge.quizQuestions[currentQuestion].correct) {
      setQuizScore(quizScore + 1)
    }

    if (currentQuestion < selectedChallenge.quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer('')
    } else {
      setQuizCompleted(true)
      // Mark the challenge as completed
      setChallenges(prevChallenges => 
        prevChallenges.map(challenge => 
          challenge.id === selectedChallenge.id 
            ? { ...challenge, completed: true }
            : challenge
        )
      )
      // Update user stats
      setUserStats(prevStats => ({
        ...prevStats,
        completedChallenges: prevStats.completedChallenges + 1,
        totalPoints: prevStats.totalPoints + selectedChallenge.points
      }))
    }
  }

  const resetQuiz = () => {
    setShowQuiz(false)
    setCurrentQuestion(0)
    setSelectedAnswer('')
    setQuizScore(0)
    setQuizCompleted(false)
    setSelectedChallenge(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading daily challenges...</p>
        </div>
      </div>
    )
  }

  if (showQuiz && selectedChallenge) {
    if (quizCompleted) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pt-16 px-6 flex items-center justify-center relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up delay-2000"></div>
          
          <div className="max-w-2xl w-full relative z-10">
            <div className="glass-card border-white/20 opacity-100 hover:opacity-100 transition-all duration-500 transform hover:scale-105 p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-spin-slow">
                <Award className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                🎉 Quiz Complete! 🎉
              </h2>
              <div className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-4">
                {quizScore}/{selectedChallenge.quizQuestions.length}
              </div>
              <p className="text-2xl text-white/90 mb-8">
                You earned {selectedChallenge.points} points!
              </p>
              <div className="flex gap-6 justify-center">
                <button 
                  onClick={resetQuiz}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
                >
                  🏠 Back to Challenges
                </button>
                <button 
                  onClick={() => {
                    setCurrentQuestion(0)
                    setQuizScore(0)
                    setQuizCompleted(false)
                    setSelectedAnswer('')
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
                >
                  🔄 Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pt-16 px-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up delay-2000"></div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Quiz Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{selectedChallenge.title}</h2>
                <p className="text-white/80">{selectedChallenge.description}</p>
              </div>
              <Button 
                onClick={resetQuiz}
                variant="outline"
                className="btn-glass hover-lift border-white/20 text-white/80 hover:text-white"
              >
                Exit Quiz
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white/80">
                Question {currentQuestion + 1} of {selectedChallenge.quizQuestions.length}
              </span>
              <span className="text-sm font-medium text-white/80">
                Score: {quizScore}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm border border-white/20">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-3 rounded-full transition-all duration-500 glow-purple animate-glow-pulse"
                style={{ width: `${((currentQuestion + 1) / selectedChallenge.quizQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <Card className="card-glass card-glass-hover border-white/20 shadow-2xl mb-6">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center glow-blue animate-glow-pulse">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-white">
                  {selectedChallenge.quizQuestions[currentQuestion].question}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedChallenge.quizQuestions[currentQuestion].options.map((option, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover-lift ${
                    selectedAnswer === option
                      ? 'border-blue-400 bg-blue-500/20 backdrop-blur-sm glow-blue'
                      : 'border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/30'
                  }`}
                  onClick={() => setSelectedAnswer(option)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      selectedAnswer === option
                        ? 'border-blue-400 bg-blue-400 glow-blue'
                        : 'border-white/40'
                    }`}>
                      {selectedAnswer === option && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <span className="text-lg font-medium text-white/90">{option}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => {
                if (currentQuestion > 0) {
                  setCurrentQuestion(currentQuestion - 1)
                  setSelectedAnswer('')
                }
              }}
              disabled={currentQuestion === 0}
              className="btn-glass hover-lift border-white/20 text-white/80 hover:text-white disabled:opacity/50 disabled:cursor-not-allowed"
            >
              Previous
            </Button>
            <Button
              onClick={handleQuizAnswer}
              disabled={!selectedAnswer}
              className="px-8 btn-glass hover-lift glow-purple text-white disabled:opacity/50 disabled:cursor-not-allowed"
            >
              {currentQuestion === selectedChallenge.quizQuestions.length - 1 ? 'Complete' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 pt-16 px-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up"></div>
      <div className="absolute top-40 right-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up delay-1000"></div>
      <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float-up delay-2000"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Flame className="text-orange-400" />
            Daily Challenges
          </h1>
          <p className="text-white/80">Complete daily challenges to earn points and maintain your streak!</p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <Flame className="text-orange-400 w-8 h-8" />
              <span className="text-2xl font-bold text-white">{userStats.streak}</span>
            </div>
            <p className="text-white/80 text-sm">Day Streak</p>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="text-yellow-400 w-8 h-8" />
              <span className="text-2xl font-bold text-white">{userStats.totalPoints}</span>
            </div>
            <p className="text-white/80 text-sm">Total Points</p>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-400 w-8 h-8" />
              <span className="text-2xl font-bold text-white">{userStats.completedChallenges}</span>
            </div>
            <p className="text-white/80 text-sm">Completed</p>
          </div>
          
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-2">
              <Award className="text-purple-400 w-8 h-8" />
              <span className={`text-2xl font-bold ${getRankColor(userStats.rank)}`}>{userStats.rank}</span>
            </div>
            <p className="text-white/80 text-sm">Current Rank</p>
          </div>
        </div>

        {/* Daily Progress Card */}
        <div className="glass-card p-6 mb-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover-lift group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center glow-green animate-glow-pulse group-hover:animate-bounce transition-all duration-300">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">Today's Progress</h3>
                <p className="text-white/80 group-hover:text-white/100 transition-colors duration-300">Complete all daily challenges to maintain your streak!</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-gradient-green group-hover:scale-110 transition-transform duration-300">
                {completedChallengesCount}/{availableChallenges.length}
              </div>
              <p className="text-white/80 text-sm mt-1 group-hover:text-white/100 transition-colors duration-300">Available Challenges Completed</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-white/10 rounded-full h-4 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-colors duration-300">
              <div 
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-4 rounded-full transition-all duration-500 glow-green animate-glow-pulse group-hover:from-green-300 group-hover:to-emerald-400 transition-all duration-300"
                style={{ width: `${(completedChallengesCount / availableChallenges.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Challenges Section */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Target className="text-blue-400" />
                Today's Challenges
              </h2>
              
              <div className="space-y-4">
                {availableChallenges.map((challenge) => {
                  const IconComponent = challenge.icon
                  const hasTeacherAccess = userStats.isTeacher || userStats.boughtTeacherIds.includes(challenge.teacherId)
                  const hasCourseAccess = userStats.isTeacher || userStats.enrolledCourseIds.includes(challenge.courseId)
                  const hasAccess = hasTeacherAccess && hasCourseAccess
                  return (
                    <div
                      key={challenge.id}
                      className={`border rounded-xl p-6 transition-all duration-300 ${
                        !hasAccess || challenge.locked 
                          ? 'border-white/20 bg-white/5 opacity-75' 
                          : 'border-white/30 bg-white/10 hover:bg-white/20 cursor-pointer hover:border-white/40 hover-lift'
                      }`}
                      onClick={() => hasAccess && startChallenge(challenge)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg ${!hasAccess || challenge.locked ? 'bg-white/10' : 'bg-blue-500/20'}`}>
                              <IconComponent className={`w-6 h-6 ${!hasAccess || challenge.locked ? 'text-white/40' : 'text-blue-400'}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-white">{challenge.title}</h3>
                              <p className="text-sm text-white/70">{challenge.description}</p>
                              {/* Teacher Info */}
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-lg">{challenge.teacherAvatar}</span>
                                <div>
                                  <p className="text-xs text-white/80">Created by {challenge.teacherName}</p>
                                  <p className="text-xs text-white/60">Course: {challenge.courseName}</p>
                                  {!hasAccess && (
                                    <p className="text-xs text-yellow-400 font-medium">
                                      🔒 {hasTeacherAccess ? 'Enroll in course to access' : 'Purchase teacher access & enroll in course'}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`px-3 py-1 rounded-full font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                              {challenge.difficulty}
                            </span>
                            <span className="flex items-center gap-1 text-white/60">
                              <Clock className="w-4 h-4" />
                              {challenge.timeLimit} min
                            </span>
                            <span className="flex items-center gap-1 text-white/60">
                              <Brain className="w-4 h-4" />
                              {challenge.questions} questions
                            </span>
                            <span className="flex items-center gap-1 text-yellow-400 font-medium">
                              <Star className="w-4 h-4" />
                              {challenge.points} pts
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          {!hasAccess ? (
                            <Lock className="text-yellow-400 w-6 h-6" />
                          ) : challenge.completed ? (
                            <CheckCircle className="text-green-400 w-6 h-6" />
                          ) : (
                            <Zap className="text-blue-400 w-6 h-6" />
                          )}
                        </div>
                      </div>
                      
                      {!hasAccess && (
                        <div className="mt-4 pt-4 border-t border-white/20">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!hasTeacherAccess && !hasCourseAccess) {
                                alert(`Purchase access to ${challenge.teacherName}'s courses and enroll in ${challenge.courseName} for $${challenge.price}`)
                              } else if (!hasCourseAccess) {
                                alert(`Enroll in ${challenge.courseName} to access this quiz`)
                              }
                            }}
                            className="w-full py-2 px-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-medium hover:from-yellow-500 hover:to-orange-600 transition-all duration-300"
                          >
                            {!hasTeacherAccess && !hasCourseAccess 
                              ? `Purchase & Enroll - $${challenge.price}` 
                              : 'Enroll in Course'
                            }
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Leaderboard Section */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="text-green-400" />
                Leaderboard
              </h2>
              
              <div className="space-y-3">
                {leaderboard.map((user) => {
                  const IconComponent = user.badge
                  return (
                    <div
                      key={user.rank}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                        user.isCurrentUser 
                          ? 'bg-blue-500/20 border border-blue-400/30' 
                          : 'hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-sm font-bold text-white">
                        {user.rank}
                      </div>
                      
                      <IconComponent className={`w-5 h-5 ${
                        user.rank === 1 ? 'text-yellow-400' :
                        user.rank === 2 ? 'text-gray-300' :
                        user.rank === 3 ? 'text-orange-400' :
                        user.isCurrentUser ? 'text-blue-400' :
                        'text-white/40'
                      }`} />
                      
                      <div className="flex-1">
                        <p className="font-medium text-white text-sm">
                          {user.name}
                          {user.isCurrentUser && <span className="text-blue-400 ml-1">(You)</span>}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-white/60">
                          <span>{user.points} pts</span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {user.streak}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <button className="w-full mt-4 py-2 px-4 btn-glass hover-lift text-white text-sm font-medium">
                View Full Leaderboard
              </button>
            </div>

            {/* Rewards Section */}
            <div className="glass-card p-6 mt-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Gift className="text-purple-400" />
                Milestone Rewards
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                  <Trophy className="text-yellow-400 w-5 h-5" />
                  <div>
                    <p className="font-medium text-white text-sm">7-Day Streak</p>
                    <p className="text-xs text-white/70">Unlock bonus challenges</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-purple-500/20 rounded-lg border border-purple-400/30">
                  <Crown className="text-purple-400 w-5 h-5" />
                  <div>
                    <p className="font-medium text-white text-sm">30-Day Streak</p>
                    <p className="text-xs text-white/70">Exclusive badge & 500 bonus points</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
                  <Star className="text-blue-400 w-5 h-5" />
                  <div>
                    <p className="font-medium text-white text-sm">100 Challenges</p>
                    <p className="text-xs text-white/70">Master rank & premium features</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Available Teachers Section */}
            {!userStats.isTeacher && (
              <div className="glass-card p-6 mt-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Users className="text-blue-400" />
                  Available Teachers & Courses
                </h2>
                
                <div className="space-y-3">
                  {[
                    { id: 1, name: 'Dr. Sarah Chen', avatar: '👩‍🏫', price: 29.99, courses: 5, rating: 4.8, purchased: userStats.boughtTeacherIds.includes(1), courseIds: ['course1'], enrolledCourses: ['JavaScript Basics'] },
                    { id: 2, name: 'Prof. Michael Lee', avatar: '👨‍🏫', price: 49.99, courses: 8, rating: 4.9, purchased: userStats.boughtTeacherIds.includes(2), courseIds: ['course2'], enrolledCourses: ['React Advanced'] },
                    { id: 3, name: 'Dr. Emily Wang', avatar: '👩‍🏫', price: 69.99, courses: 12, rating: 4.7, purchased: userStats.boughtTeacherIds.includes(3), courseIds: ['course3'], enrolledCourses: [] }
                  ].map((teacher) => (
                    <div
                      key={teacher.id}
                      className={`p-3 rounded-lg border transition-all duration-300 ${
                        teacher.purchased 
                          ? 'bg-green-500/20 border-green-400/30' 
                          : 'bg-white/10 border-white/20 hover:bg-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{teacher.avatar}</span>
                        <div className="flex-1">
                          <p className="font-medium text-white text-sm">{teacher.name}</p>
                          <div className="flex items-center gap-3 text-xs text-white/60">
                            <span>{teacher.courses} courses</span>
                            <span>⭐ {teacher.rating}</span>
                            <span className="text-yellow-400 font-medium">${teacher.price}</span>
                          </div>
                          <div className="text-xs text-white/60 mt-1">
                            Enrolled in: {teacher.enrolledCourses.length > 0 ? teacher.enrolledCourses.join(', ') : 'No courses'}
                          </div>
                        </div>
                        {teacher.purchased ? (
                          <CheckCircle className="text-green-400 w-5 h-5" />
                        ) : (
                          <button 
                            onClick={() => alert(`Purchase access to ${teacher.name}'s courses for $${teacher.price}`)}
                            className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
                          >
                            Purchase
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

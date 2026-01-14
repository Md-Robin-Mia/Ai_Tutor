import { useState, useEffect } from 'react'
import { Award, Star, Target, Zap, Flame, BookOpen, Users, Calendar, Lock, CheckCircle, Crown, Sparkles, Gem, Medal, Ribbon, GraduationCap, Brain, Sunrise, Moon } from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'learning' | 'social' | 'streak' | 'milestone' | 'special'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  progress: number
  maxProgress: number
  isUnlocked: boolean
  unlockedAt?: string
  points: number
}

export default function StudentAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Mock achievements data
  const mockAchievements: Achievement[] = [
    {
      id: 'first_course',
      title: 'Course Explorer',
      description: 'Enroll in your first course',
      icon: 'Target',
      category: 'milestone',
      rarity: 'common',
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
      unlockedAt: '2024-01-15',
      points: 10
    },
    {
      id: 'first_lesson',
      title: 'Lesson Starter',
      description: 'Complete your first lesson',
      icon: 'BookOpen',
      category: 'learning',
      rarity: 'common',
      progress: 1,
      maxProgress: 1,
      isUnlocked: true,
      unlockedAt: '2024-01-16',
      points: 15
    },
    {
      id: 'week_streak',
      title: 'Week Warrior',
      description: 'Maintain a 7-day learning streak',
      icon: 'Flame',
      category: 'streak',
      rarity: 'rare',
      progress: 5,
      maxProgress: 7,
      isUnlocked: false,
      points: 50
    },
    {
      id: 'ten_courses',
      title: 'Course Collector',
      description: 'Enroll in 10 different courses',
      icon: 'GraduationCap',
      category: 'milestone',
      rarity: 'rare',
      progress: 3,
      maxProgress: 10,
      isUnlocked: false,
      points: 75
    },
    {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Connect with 5 other students',
      icon: 'Users',
      category: 'social',
      rarity: 'common',
      progress: 2,
      maxProgress: 5,
      isUnlocked: false,
      points: 25
    },
    {
      id: 'speed_learner',
      title: 'Speed Learner',
      description: 'Complete 5 lessons in one day',
      icon: 'Zap',
      category: 'learning',
      rarity: 'epic',
      progress: 2,
      maxProgress: 5,
      isUnlocked: false,
      points: 100
    },
    {
      id: 'perfect_score',
      title: 'Perfect Score',
      description: 'Get 100% on 10 different quizzes',
      icon: 'CheckCircle',
      category: 'learning',
      rarity: 'epic',
      progress: 3,
      maxProgress: 10,
      isUnlocked: false,
      points: 150
    },
    {
      id: 'early_bird',
      title: 'Early Bird',
      description: 'Complete 3 lessons before 9 AM',
      icon: 'Sunrise',
      category: 'special',
      rarity: 'rare',
      progress: 1,
      maxProgress: 3,
      isUnlocked: false,
      points: 60
    },
    {
      id: 'night_owl',
      title: 'Night Owl',
      description: 'Complete 3 lessons after 10 PM',
      icon: 'Moon',
      category: 'special',
      rarity: 'rare',
      progress: 2,
      maxProgress: 3,
      isUnlocked: false,
      points: 60
    },
    {
      id: 'knowledge_master',
      title: 'Knowledge Master',
      description: 'Complete 50 lessons total',
      icon: 'Brain',
      category: 'milestone',
      rarity: 'legendary',
      progress: 12,
      maxProgress: 50,
      isUnlocked: false,
      points: 500
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setAchievements(mockAchievements)
      setLoading(false)
    }, 1000)
  }, [])

  const renderIcon = (iconName: string, className: string = "w-8 h-8") => {
    const iconMap: { [key: string]: JSX.Element } = {
      'Target': <Target className={className} />,
      'BookOpen': <BookOpen className={className} />,
      'Flame': <Flame className={className} />,
      'GraduationCap': <GraduationCap className={className} />,
      'Users': <Users className={className} />,
      'Zap': <Zap className={className} />,
      'CheckCircle': <CheckCircle className={className} />,
      'Sunrise': <Sunrise className={className} />,
      'Moon': <Moon className={className} />,
      'Brain': <Brain className={className} />,
      'Medal': <Medal className={className} />,
      'Award': <Award className={className} />,
      'Star': <Star className={className} />,
      'Trophy': <Award className={className} />
    }
    return iconMap[iconName] || <Medal className={className} />
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-600/30 to-gray-700/30 border-gray-500/40 shadow-gray-500/20'
      case 'rare':
        return 'from-blue-600/30 to-cyan-600/30 border-blue-500/40 shadow-blue-500/20'
      case 'epic':
        return 'from-purple-600/30 to-pink-600/30 border-purple-500/40 shadow-purple-500/20'
      case 'legendary':
        return 'from-yellow-600/30 to-orange-600/30 border-yellow-500/40 shadow-yellow-500/20'
      default:
        return 'from-gray-600/30 to-gray-700/30 border-gray-500/40 shadow-gray-500/20'
    }
  }

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'linear-gradient(135deg, #6b7280, #4b5563)'
      case 'rare':
        return 'linear-gradient(135deg, #3b82f6, #06b6d4)'
      case 'epic':
        return 'linear-gradient(135deg, #a855f7, #ec4899)'
      case 'legendary':
        return 'linear-gradient(135deg, #eab308, #f97316)'
      default:
        return 'linear-gradient(135deg, #6b7280, #4b5563)'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning':
        return <BookOpen className="w-4 h-4" />
      case 'social':
        return <Users className="w-4 h-4" />
      case 'streak':
        return <Flame className="w-4 h-4" />
      case 'milestone':
        return <Target className="w-4 h-4" />
      case 'special':
        return <Star className="w-4 h-4" />
      default:
        return <Medal className="w-4 h-4" />
    }
  }

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory)

  const categories = [
    { value: 'all', label: 'All Achievements', icon: <Medal className="w-4 h-4" /> },
    { value: 'learning', label: 'Learning', icon: <BookOpen className="w-4 h-4" /> },
    { value: 'social', label: 'Social', icon: <Users className="w-4 h-4" /> },
    { value: 'streak', label: 'Streak', icon: <Flame className="w-4 h-4" /> },
    { value: 'milestone', label: 'Milestone', icon: <Target className="w-4 h-4" /> },
    { value: 'special', label: 'Special', icon: <Star className="w-4 h-4" /> }
  ]

  const totalPoints = achievements.reduce((sum, a) => sum + (a.isUnlocked ? a.points : 0), 0)
  const unlockedCount = achievements.filter(a => a.isUnlocked).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card-advanced p-6 animate-pulse">
              <div className="h-20 bg-white/10 rounded-xl backdrop-blur-sm"></div>
            </div>
          ))}
        </div>
        <div className="glass-card-advanced p-8 animate-pulse">
          <div className="h-64 bg-white/10 rounded-xl backdrop-blur-sm"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card-advanced p-6 group hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-all duration-500 group-hover:shadow-yellow-500/50">
                <Medal className="w-7 h-7 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <div className="text-3xl font-black text-white">{unlockedCount}</div>
            </div>
            <div className="text-yellow-300 font-bold text-sm mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Achievements Unlocked
            </div>
            <div className="flex items-center gap-2 text-yellow-400 text-xs">
              <Target className="w-3 h-3" />
              <span>{Math.round((unlockedCount / achievements.length) * 100)}% Complete</span>
            </div>
          </div>
        </div>

        <div className="glass-card-advanced p-6 group hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-all duration-500 group-hover:shadow-purple-500/50">
                <Star className="w-7 h-7 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <div className="text-3xl font-black text-white">{totalPoints}</div>
            </div>
            <div className="text-purple-300 font-bold text-sm mb-2 flex items-center gap-2">
              <Gem className="w-4 h-4" />
              Total Points
            </div>
            <div className="flex items-center gap-2 text-purple-400 text-xs">
              <Zap className="w-3 h-3" />
              <span>Keep earning!</span>
            </div>
          </div>
        </div>

        <div className="glass-card-advanced p-6 group hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-all duration-500 group-hover:shadow-green-500/50">
                <Award className="w-7 h-7 text-white" />
                <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-400 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <div className="text-3xl font-black text-white">{achievements.length - unlockedCount}</div>
            </div>
            <div className="text-green-300 font-bold text-sm mb-2 flex items-center gap-2">
              <Medal className="w-4 h-4" />
              Locked
            </div>
            <div className="flex items-center gap-2 text-green-400 text-xs">
              <Lock className="w-3 h-3" />
              <span>Keep trying!</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements List */}
      <div className="glass-card-advanced p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Medal className="w-5 h-5 text-white" />
            </div>
            Achievements
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          </h2>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
                  selectedCategory === category.value
                    ? 'glass-button-primary text-white shadow-lg shadow-white/20'
                    : 'text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm'
                }`}
              >
                {category.icon}
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className={`glass-card-mini p-6 group hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden ${
                achievement.isUnlocked ? 'opacity-100' : 'opacity-60'
              }`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              {/* Animated background particles */}
              {achievement.isUnlocked && (
                <>
                  <div className="absolute top-2 right-2 w-1 h-1 bg-yellow-400 rounded-full animate-ping"></div>
                  <div className="absolute top-8 right-8 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute bottom-4 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
                </>
              )}
              
              {/* Hover overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-500 border-2 relative overflow-hidden ${
                    achievement.isUnlocked 
                      ? `bg-gradient-to-br ${getRarityColor(achievement.rarity)}` 
                      : 'bg-gray-800/50 border-gray-600/50'
                  }`}>
                    <div className="text-white">
                      {renderIcon(achievement.icon, "w-8 h-8")}
                    </div>
                    {achievement.isUnlocked && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Sparkles className="w-2 h-2 text-yellow-900" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {achievement.isUnlocked ? (
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30 backdrop-blur-sm">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center border border-gray-500/30 backdrop-blur-sm">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                    <div className={`text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm border ${
                      achievement.isUnlocked
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                    }`}>
                      {achievement.rarity.toUpperCase()}
                    </div>
                  </div>
                </div>

                <h3 className={`font-bold text-lg mb-2 transition-all duration-300 ${
                  achievement.isUnlocked 
                    ? 'text-white group-hover:text-yellow-300' 
                    : 'text-gray-400'
                }`}>
                  {achievement.title}
                </h3>
                
                <p className={`text-sm mb-4 ${
                  achievement.isUnlocked ? 'text-white/70' : 'text-gray-500'
                }`}>
                  {achievement.description}
                </p>

                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={achievement.isUnlocked ? 'text-white/60' : 'text-gray-500'}>
                        Progress
                      </span>
                      <span className={`font-bold ${
                        achievement.isUnlocked ? 'text-white/80' : 'text-gray-400'
                      }`}>
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                          achievement.isUnlocked 
                            ? `bg-gradient-to-r ${getRarityColor(achievement.rarity)}` 
                            : 'bg-gray-600'
                        }`}
                        style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                      >
                        {achievement.isUnlocked && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className={`flex items-center gap-1 ${
                      achievement.isUnlocked ? 'text-white/60' : 'text-gray-500'
                    }`}>
                      {getCategoryIcon(achievement.category)}
                      <span className="capitalize">{achievement.category}</span>
                    </div>
                    <div className={`flex items-center gap-1 ${
                      achievement.isUnlocked ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      <Star className="w-3 h-3" />
                      <span className="font-bold">{achievement.points} pts</span>
                    </div>
                  </div>

                  {achievement.isUnlocked && achievement.unlockedAt && (
                    <div className="flex items-center gap-1 text-xs text-green-400 pt-2 border-t border-white/10">
                      <Calendar className="w-3 h-3" />
                      <span>Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Header({ darkMode, language, onToggleNotifications }: {
  darkMode: boolean
  language: 'en' | 'bn'
  onToggleNotifications: () => void
}) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const motivationalQuotes = {
    en: [
      "Every expert was once a beginner",
      "Progress is progress, no matter how small",
      "Your potential is limitless",
      "Learning is a journey, not a destination"
    ],
    bn: [
      "প্রতিটি বিশেষজ্ঞ একসময় নতুন ছিলেন",
      "অগ্রগতি অগ্রগতিই, যতই ছোট",
      "আপনার সম্ভাব্যতা অসীম",
      "শেখা একটি যাত্রা, গন্তব্য নয়"
    ]
  }

  const randomQuote = motivationalQuotes[language === 'en' ? 'en' : 'bn'][Math.floor(Math.random() * 4)]

  return (
    <header className={`h-20 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b flex items-center justify-between px-6`}>
      {/* Left Section - Welcome Message */}
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className={`text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}>
              {language === 'en' ? `Welcome back, ${user?.name || 'Student'}!` : `স্বাগতম, ${user?.name || 'শিক্ষার্থী'}!`}
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm italic`}>
              "{randomQuote}"
            </p>
          </div>
        </div>
      </div>

      {/* Center Section - Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'en' ? 'Search topics, lessons...' : 'বিষয়, পাঠ খুঁজুন...'}
            className={`w-full px-4 py-2 pl-10 rounded-lg border ${
              darkMode
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            🔍
          </span>
        </div>
      </div>

      {/* Right Section - Controls */}
      <div className="flex items-center space-x-4">
        {/* AI Chat Direct Link */}
        <button
          onClick={() => {
            console.log('💬 AI Chat button clicked')
            navigate('/ai-tutor-chat')
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span>💬</span>
            <span>{language === 'en' ? 'AI Chat' : 'AI চ্যাট'}</span>
          </span>
        </button>

        {/* Tutor Link */}
        <button
          onClick={() => {
            console.log('🤖 Tutor button clicked')
            // Ensure course 1 exists in localStorage
            const adminCourses = JSON.parse(localStorage.getItem('adminCourses') || '[]')
            const course1Exists = adminCourses.some(course => course.id === 1)
            
            if (!course1Exists) {
              console.log('📝 Creating Course 1 in localStorage')
              const course1 = {
                id: 1,
                title: "Complete AI Tutor Course",
                instructor: "AI Teaching Assistant",
                duration: "3 hours",
                lessons: 8,
                description: "Master the art of AI-assisted learning"
              }
              localStorage.setItem('adminCourses', JSON.stringify([course1]))
            }
            
            // Navigate to learn page which will redirect to chat
            navigate('/learn/1')
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              : 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span>🤖</span>
            <span>{language === 'en' ? 'Tutor' : 'টিউটর'}</span>
          </span>
        </button>

        {/* Study Streak */}
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
          darkMode ? 'bg-gray-800' : 'bg-orange-50'
        }`}>
          <span className="text-lg">🔥</span>
          <div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {language === 'en' ? 'Streak' : 'স্ট্রিক'}
            </div>
            <div className={`font-bold ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>
              7 Days
            </div>
          </div>
        </div>

        {/* Notifications */}
        <button
          onClick={onToggleNotifications}
          className={`relative p-2 rounded-lg transition-all ${
            darkMode
              ? 'hover:bg-gray-800 text-gray-300'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          <span className="text-xl">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Export Report */}
        <button className={`px-4 py-2 rounded-lg font-medium transition-all ${
          darkMode
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
        }`}>
          <span className="flex items-center space-x-2">
            <span>📊</span>
            <span>{language === 'en' ? 'Export' : 'রপোর্ট'}</span>
          </span>
        </button>

        {/* Accessibility */}
        <button className={`p-2 rounded-lg transition-all ${
          darkMode
            ? 'hover:bg-gray-800 text-gray-300'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        title={language === 'en' ? 'Accessibility Mode' : 'অভিগম্য মোড'}
        >
          <span className="text-xl">♿</span>
        </button>
      </div>
    </header>
  )
}

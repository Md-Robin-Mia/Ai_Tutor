import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

interface SidebarItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
}

export default function Sidebar({ darkMode, language, onToggleDarkMode, onToggleLanguage }: {
  darkMode: boolean
  language: 'en' | 'bn'
  onToggleDarkMode: () => void
  onToggleLanguage: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const menuItems: SidebarItem[] = [
    { id: 'dashboard', label: language === 'en' ? 'Dashboard' : 'ড্যাশবোর্ড', icon: '🏠', path: '/student-dashboard' },
    { id: 'courses', label: language === 'en' ? 'Courses' : 'কোর্স', icon: '📚', path: '/courses' },
    { id: 'quizzes', label: language === 'en' ? 'Quizzes' : 'কুইজ', icon: '📝', path: '/quiz', badge: 3 },
    { id: 'progress', label: language === 'en' ? 'Progress' : 'অগ্রগতি', icon: '📊', path: '/progress' },
    { id: 'achievements', label: language === 'en' ? 'Achievements' : 'অর্জন', icon: '🏆', path: '/achievements' },
    { id: 'settings', label: language === 'en' ? 'Settings' : 'সেটিংস', icon: '⚙️', path: '/settings' },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className={`w-64 h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} border-r ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
      {/* User Profile Section */}
      <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg`}>
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {user?.name || 'Student'}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {language === 'en' ? 'Level 5' : 'লেভেল ৫'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : darkMode
                    ? 'text-gray-300 hover:bg-gray-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive(item.path)
                      ? 'bg-white/20 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Controls */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="space-y-3">
          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all ${
              darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>🌐</span>
              <span className="text-sm font-medium">
                {language === 'en' ? 'Language' : 'ভাষা'}
              </span>
            </span>
            <span className="text-sm font-bold">
              {language === 'en' ? 'EN' : 'BN'}
            </span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all ${
              darkMode
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="flex items-center space-x-2">
              <span>{darkMode ? '🌙' : '☀️'}</span>
              <span className="text-sm font-medium">
                {darkMode ? (language === 'en' ? 'Dark Mode' : 'ডার্ক মোড') : (language === 'en' ? 'Light Mode' : 'লাইট মোড')}
              </span>
            </span>
            <div className={`w-12 h-6 rounded-full transition-all ${
              darkMode ? 'bg-blue-600' : 'bg-gray-300'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-all transform ${
                darkMode ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

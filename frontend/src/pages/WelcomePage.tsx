import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { useAuthStore } from '../store/authStore'
import WelcomeTopBar from '../components/WelcomeTopBar'
import '../styles/dashboard-theme.css'
import { useState, useEffect } from 'react'

export default function WelcomePage() {
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSeeFeatures = () => {
    if (token) {
      navigate('/youtube-summarizer')
    } else {
      localStorage.setItem('intendedDestination', '/youtube-summarizer')
      navigate('/register')
    }
  }

  const handleStartLearning = () => {
    if (token) {
      navigate('/ai-tutor-chat')
    } else {
      navigate('/login')
    }
  }

  if (!mounted) return null

  return (
    <div className="welcome-glass-container">
      {/* Welcome Top Bar */}
      <WelcomeTopBar />
      
      {/* Floating Decorative Elements */}
      <div className="welcome-float-element floating-orb-1"></div>
      <div className="welcome-float-element floating-orb-2"></div>
      <div className="welcome-float-element floating-orb-3"></div>
      <div className="welcome-float-element floating-orb-4"></div>

      {/* Main Content */}
      <main className="welcome-content flex flex-col items-center justify-center px-6 py-20 text-center" style={{paddingTop: '120px'}}>
        {/* Y Combinator Badge */}
        <div className="mb-8 animate-fadeIn">
          <span className="welcome-badge">
            <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
            Backed by RAM
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="welcome-title text-5xl md:text-7xl font-bold mb-6 max-w-4xl animate-slideInTop">
          AI Tutor for the Modern Learner
        </h1>
        
        {/* Sub-headline */}
        <p className="welcome-subtitle text-xl md:text-2xl mb-12 animate-slideInTop" style={{animationDelay: '0.2s'}}>
          Transform your learning materials into interactive AI-powered lessons, quizzes, and personalized study experiences
        </p>
        
        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 mb-16 animate-slideInTop" style={{animationDelay: '0.4s'}}>
          <button 
            className="welcome-button-glass group text-lg px-10 py-5 rounded-2xl font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden"
            onClick={handleSeeFeatures}
          >
            <span className="relative z-10 flex items-center gap-3">
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Explore Features
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button 
            className="welcome-button-primary group text-lg px-10 py-5 rounded-2xl font-semibold transition-all duration-500 transform hover:scale-105 hover:shadow-2xl relative overflow-hidden"
            onClick={handleStartLearning}
          >
            <span className="relative z-10 flex items-center gap-3">
              <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Start Learning Free
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>

        {/* Social Proof */}
        <div className="welcome-social-proof animate-slideInTop" style={{animationDelay: '0.6s'}}>
          <div className="flex -space-x-3 mb-4">
            <div className="welcome-avatar w-12 h-12 text-lg font-bold border-2 border-white/20 shadow-lg">A</div>
            <div className="welcome-avatar w-12 h-12 text-lg font-bold border-2 border-white/20 shadow-lg" style={{background: 'var(--gradient-secondary)'}}>B</div>
            <div className="welcome-avatar w-12 h-12 text-lg font-bold border-2 border-white/20 shadow-lg" style={{background: 'var(--gradient-success)'}}>C</div>
            <div className="welcome-avatar w-12 h-12 text-lg font-bold border-2 border-white/20 shadow-lg" style={{background: 'var(--gradient-warning)'}}>D</div>
            <div className="welcome-avatar w-12 h-12 text-lg font-bold border-2 border-white/20 shadow-lg" style={{background: 'var(--gradient-error)'}}>E</div>
            <div className="w-12 h-12 rounded-full bg-gray-700 border-2 border-white/20 shadow-lg flex items-center justify-center text-white font-bold text-sm">
              +99
            </div>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-semibold text-white text-lg mb-1">
              Trusted by <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">2,000,000+</span> learners worldwide
            </span>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>98% Success</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl w-full animate-slideInTop" style={{animationDelay: '0.8s'}}>
          <div className="group text-center transform transition-all duration-500 hover:scale-105">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:from-indigo-600 group-hover:via-purple-700 group-hover:to-pink-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Smart Learning</h3>
            <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">AI-powered personalized learning experience that adapts to your unique learning style and pace</p>
          </div>
          <div className="group text-center transform transition-all duration-500 hover:scale-105">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 via-cyan-600 to-blue-600 flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:from-green-600 group-hover:via-cyan-700 group-hover:to-blue-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:bg-gradient-to-r group-hover:from-green-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">Advanced Analytics</h3>
            <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">Track your progress and performance with detailed insights and personalized recommendations</p>
          </div>
          <div className="group text-center transform transition-all duration-500 hover:scale-105">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-600 to-orange-600 flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:from-pink-600 group-hover:via-rose-700 group-hover:to-orange-700 relative overflow-hidden">
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-3 group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-rose-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">24/7 AI Support</h3>
            <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">Get help whenever you need it with our intelligent AI assistant available round the clock</p>
          </div>
        </div>
      </main>
    </div>
  )
}

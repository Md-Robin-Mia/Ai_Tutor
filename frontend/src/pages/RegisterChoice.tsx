import { useNavigate } from 'react-router-dom'
import { AnimatedLink } from '../components/ui/animated-link'
import { GraduationCap, Users, ArrowLeft } from 'lucide-react'

export default function RegisterChoice() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e293b 75%, #0f172a 100%)',
      position: 'relative',
      minHeight: '100vh'
    }}>
      {/* Static Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full" style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.2))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          filter: 'blur(40px)'
        }}></div>
        <div className="absolute top-20 right-20 w-24 h-24 rounded-full" style={{
          background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.3), rgba(239, 68, 68, 0.2))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          filter: 'blur(35px)'
        }}></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 rounded-full" style={{
          background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3), rgba(16, 185, 129, 0.2))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          filter: 'blur(45px)'
        }}></div>
        <div className="absolute bottom-32 right-16 w-28 h-28 rounded-full" style={{
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.2))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          filter: 'blur(30px)'
        }}></div>
      </div>
      
      <div className="flex items-center justify-center w-full max-w-6xl mx-auto relative z-10 px-4">
        <div className="w-full max-w-2xl">
          {/* Back Button */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300 hover:scale-105"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '12px 20px',
                cursor: 'pointer',
                WebkitBackdropFilter: 'blur(10px)'
              }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full" style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <GraduationCap className="w-12 h-12 text-blue-400" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4" style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #60a5fa 25%, #a78bfa 50%, #60a5fa 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              textShadow: '0 0 40px rgba(102, 126, 234, 0.3)'
            }}>Choose Your Path</h1>
            <p className="text-xl text-gray-400" style={{
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}>
              Select how you'd like to join our learning community
            </p>
          </div>

          {/* Registration Options */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Student Option */}
            <AnimatedLink 
              to="/student-register" 
              animation="slide"
              className="group block p-8 rounded-2xl transition-all duration-500 hover:scale-105"
              style={{
                background: 'rgba(25, 25, 46, 0.8)',
                backdropFilter: 'blur(35px) saturate(180%)',
                WebkitBackdropFilter: 'blur(35px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '20px',
                boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                textDecoration: 'none'
              }}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 3s linear infinite'
              }}></div>
              
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.1))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <Users className="w-10 h-10 text-blue-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">Student</h2>
                
                <ul className="text-gray-300 space-y-2 text-left mb-6">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Access AI-powered learning tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Track your progress and analytics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Personalized study recommendations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Interactive quizzes and assessments</span>
                  </li>
                </ul>
                
                <div className="relative z-10 flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" />
                  </svg>
                  <span>Register as Student</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </AnimatedLink>

            {/* Teacher Option */}
            <AnimatedLink 
              to="/teacher-register" 
              animation="slide"
              className="group block p-8 rounded-2xl transition-all duration-500 hover:scale-105"
              style={{
                background: 'rgba(25, 25, 46, 0.8)',
                backdropFilter: 'blur(35px) saturate(180%)',
                WebkitBackdropFilter: 'blur(35px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '20px',
                boxShadow: '0 16px 64px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                textDecoration: 'none'
              }}
            >
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(16, 185, 129, 0.1) 50%, transparent 70%)',
                backgroundSize: '200% 200%',
                animation: 'shimmer 3s linear infinite'
              }}></div>
              
              <div className="relative z-10 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(34, 197, 94, 0.1))',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <GraduationCap className="w-10 h-10 text-green-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">Teacher</h2>
                
                <ul className="text-gray-300 space-y-2 text-left mb-6">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Create and manage courses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Upload video lessons</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Track student progress</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Earn from your expertise</span>
                  </li>
                </ul>
                
                <div className="relative z-10 flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Register as Teacher</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </AnimatedLink>
          </div>

          {/* Footer Info */}
          <div className="text-center mt-12">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <AnimatedLink 
                to="/login" 
                animation="slide"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-300"
              >
                Sign in here
              </AnimatedLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

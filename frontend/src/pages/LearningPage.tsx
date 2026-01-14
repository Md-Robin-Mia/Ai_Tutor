import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useNavigate, useParams } from 'react-router-dom'
import '../styles/dashboard-theme.css'

interface LearningStep {
  stepNumber: number
  title: string
  content: string
}

interface UserMessage {
  id: string
  type: 'text' | 'image' | 'audio' | 'pdf' | 'file'
  content: string
  fileName?: string
  timestamp: Date
}

interface TutorResponse {
  id: string
  content: string
  timestamp: Date
}

export default function LearningPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { courseId } = useParams()
  const topic = searchParams.get('topic') || 'Mathematics'
  const mode = searchParams.get('mode') || 'normal'
  
  // If courseId is present, load course data
  const [courseData, setCourseData] = useState<any>(null)
  
  useEffect(() => {
    if (courseId) {
      console.log('🎯 LearningPage: courseId =', courseId)
      
      // Load course from localStorage
      const adminCourses = JSON.parse(localStorage.getItem('adminCourses') || '[]')
      console.log('📚 Available courses:', adminCourses.length)
      
      const course = adminCourses.find((c: any) => c.id === parseInt(courseId))
      console.log('🔍 Found course:', course)
      
      if (course) {
        setCourseData(course)
        console.log('✅ Loaded course:', course)
        
        // Set learning context based on course data
        if (course.title) {
          // Update the learning steps to be course-specific
          updateLearningStepsForCourse(course)
        }
        
        // Auto-redirect to AI tutor chat for course learning
        console.log('🔄 Redirecting to /ai-tutor-chat...')
        navigate('/ai-tutor-chat')
      } else {
        // If course not found, create default course with ID 1 and redirect anyway
        console.log('⚠️ Course not found, creating default course')
        if (courseId === '1') {
          const defaultCourse = {
            id: 1,
            title: "AI Tutor Fundamentals",
            instructor: "AI Assistant",
            duration: "2 hours",
            lessons: 6,
            description: "Learn the fundamentals of AI-powered tutoring"
          }
          setCourseData(defaultCourse)
          console.log('✅ Created default course:', defaultCourse)
          
          // Always redirect to AI tutor chat
          console.log('🔄 Redirecting to /ai-tutor-chat...')
          navigate('/ai-tutor-chat')
        }
      }
    }
  }, [courseId, navigate])
  
  const [currentStep, setCurrentStep] = useState(1)
  const [learningStarted, setLearningStarted] = useState(true)
  const [interactiveMode, setInteractiveMode] = useState(true)
  const [userMessages, setUserMessages] = useState<UserMessage[]>([])
  const [tutorResponses, setTutorResponses] = useState<TutorResponse[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [showUploadOptions, setShowUploadOptions] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [allMessages, setAllMessages] = useState<(UserMessage | TutorResponse)[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [showLanguageOptions, setShowLanguageOptions] = useState(false)
  
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  
  // Function to update learning steps based on course
  const updateLearningStepsForCourse = (course: any) => {
    // This function can customize learning content based on the course
    console.log('Customizing learning for course:', course.title)
    // For now, we'll keep the default steps but they could be customized here
  }
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight
    }
  }, [allMessages, isTyping])
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const learningSteps: LearningStep[] = [
    {
      stepNumber: 1,
      title: "Introduction & Big Picture",
      content: `Subject: Mathematics
Topic: Mathematics
Step 1 of 6

Mathematics is the abstract science of number, quantity, and space.

**Key Facts:**
• Mathematics uses symbols and notation to represent relationships
• It includes arithmetic, algebra, geometry, and calculus
• Mathematical principles apply to natural sciences, engineering, and social sciences
• It provides tools for problem-solving and logical reasoning

**Applications:**
• Physics and engineering calculations
• Computer science algorithms
• Economic modeling
• Statistical analysis

**Historical Development:**
• Originated from practical needs in counting and measurement
• Developed through ancient Greek and Islamic mathematics
• Evolved into modern formal systems
• Continues to expand with new discoveries`
    },
    {
      stepNumber: 2,
      title: "Core Concepts Explained",
      content: `Subject: Mathematics
Topic: Mathematics
Step 2 of 6

**Core Concepts:**

**Numbers and Operations**
• Natural numbers: 1, 2, 3, ...
• Integers: ..., -2, -1, 0, 1, 2, ...
• Rational numbers: fractions and decimals
• Irrational numbers: π, √2, e
• Basic operations: addition, subtraction, multiplication, division

**Algebraic Structures**
• Variables and constants
• Equations and inequalities
• Functions and relations
• Polynomials
• Systems of equations

**Geometric Principles**
• Points, lines, planes
• Angles and measurements
• Shapes and figures
• Area and volume calculations
• Coordinate systems

**Mathematical Logic**
• Propositions and truth values
• Logical operators
• Proof techniques
• Set theory
• Mathematical induction`
    },
    {
      stepNumber: 3,
      title: "Deep Explanation with Examples",
      content: `Subject: Mathematics
Topic: Mathematics
Step 3 of 6

**Examples:**

**Arithmetic Example**
Problem: Calculate 25 × 4 + 18 ÷ 3
Solution:
1. Multiply: 25 × 4 = 100
2. Divide: 18 ÷ 3 = 6
3. Add: 100 + 6 = 106
Answer: 106

**Algebra Example**
Problem: Solve 3x + 7 = 22
Solution:
1. Subtract 7: 3x = 15
2. Divide by 3: x = 5
Answer: x = 5

**Geometry Example**
Problem: Find the area of a rectangle with length 8 and width 5
Solution:
1. Formula: Area = length × width
2. Calculate: 8 × 5 = 40
Answer: 40 square units

**Logic Example**
Problem: If all squares are rectangles and some rectangles are red, can we conclude that some squares are red?
Solution:
This cannot be determined from the given information. The red rectangles might not be squares.
Answer: Cannot be determined`
    },
    {
      stepNumber: 4,
      title: "Common Mistakes & Clarifications",
      content: `Subject: Mathematics
Topic: Mathematics
Step 4 of 6

**Common Mistakes:**

**Order of Operations Errors**
• Incorrect: 2 + 3 × 4 = 20
• Correct: 2 + 3 × 4 = 14 (multiply first)
• Rule: Follow PEMDAS (Parentheses, Exponents, Multiplication/Division, Addition/Subtraction)

**Sign Errors in Algebra**
• Incorrect: 3x = 15 → x = 15 + 3
• Correct: 3x = 15 → x = 15 ÷ 3
• Rule: Apply inverse operations to isolate variables

**Geometry Misconceptions**
• Incorrect: All rectangles are squares
• Correct: All squares are rectangles, but not all rectangles are squares
• Rule: Understand subset relationships

**Logic Fallacies**
• Incorrect: Assuming correlation implies causation
• Correct: Correlation does not necessarily imply causation
• Rule: Distinguish between correlation and causation

**Calculation Errors**
• Incorrect: √(9 + 16) = √9 + √16 = 3 + 4 = 7
• Correct: √(9 + 16) = √25 = 5
• Rule: Square root does not distribute over addition`
    },
    {
      stepNumber: 5,
      title: "Practice Questions + Guidance",
      content: `Subject: Mathematics
Topic: Mathematics
Step 5 of 6

**Practice Questions:**

**Question 1: Arithmetic**
Calculate: 15 + 6 × 2 - 8 ÷ 4
Answer: 25

**Question 2: Algebra**
Solve for x: 4x - 9 = 11
Answer: x = 5

**Question 3: Geometry**
Find the perimeter of a square with side length 7.
Answer: 28 units

**Question 4: Logic**
If all mammals are warm-blooded and some warm-blooded animals are birds, can we conclude that some mammals are birds?
Answer: Cannot be determined

**Question 5: Number Theory**
Identify the prime factors of 30.
Answer: 2, 3, 5

**Question 6: Fractions**
Calculate: 2/3 + 1/4
Answer: 11/12

**Question 7: Exponents**
Evaluate: 2³ × 3²
Answer: 72

**Question 8: Equations**
Solve: 2(x + 3) = 14
Answer: x = 4`
    },
    {
      stepNumber: 6,
      title: "Summary, Tips & Confidence Boost",
      content: `Subject: Mathematics
Topic: Mathematics
Step 6 of 6

**Summary:**

**Key Concepts Covered**
• Number systems and operations
• Algebraic structures and equations
• Geometric principles and measurements
• Mathematical logic and proof techniques

**Important Rules**
• Order of operations (PEMDAS)
• Properties of equality
• Geometric formulas
• Logical reasoning principles

**Applications**
• Problem-solving strategies
• Analytical thinking
• Pattern recognition
• Logical deduction

**Common Errors to Avoid**
• Incorrect order of operations
• Sign mistakes in algebra
• Misapplication of formulas
• Logical fallacies

**Study Recommendations**
• Practice fundamental operations
• Understand underlying principles
• Apply concepts to varied problems
• Review and verify solutions`
    }
  ]

  const handleStartLearning = () => {
    setLearningStarted(true)
    setInteractiveMode(true)
    setCurrentStep(1)
  }

  const handleStartChatMode = () => {
    setLearningStarted(true)
    setInteractiveMode(true)
    setCurrentStep(1)
  }

  const handleNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    } else {
      navigate('/student-dashboard')
    }
  }

  const handleBackToDashboard = () => {
    navigate('/student-dashboard')
  }

  // ChatGPT-style Interactive Functions
  const handleSendMessage = () => {
    console.log('Sending message:', currentMessage)
    if (currentMessage.trim()) {
      const newUserMessage: UserMessage = {
        id: Date.now().toString(),
        type: 'text',
        content: currentMessage,
        timestamp: new Date()
      }
      
      console.log('Adding user message:', newUserMessage)
      setUserMessages(prev => [...prev, newUserMessage])
      setAllMessages(prev => [...prev, newUserMessage])
      setCurrentMessage('')
      setIsTyping(true)
      
      // Simulate AI tutor response
      setTimeout(() => {
        const tutorResponse: TutorResponse = {
          id: (Date.now() + 1).toString(),
          content: generateTutorResponse(currentMessage),
          timestamp: new Date()
        }
        console.log('Adding tutor response:', tutorResponse)
        setTutorResponses(prev => [...prev, tutorResponse])
        setAllMessages(prev => [...prev, tutorResponse])
        setIsTyping(false)
      }, 1500)
    }
  }

  const generateTutorResponse = (userMessage: string): string => {
    console.log('Generating response for:', userMessage)
    
    // Direct, concise responses - no follow-up questions
    const responses = [
      `Let me explain this clearly.`,
      `Here's how this works.`,
      `This is what you need to know.`,
      `I can help with that.`,
      `Here's the answer to your question.`
    ]
    
    // Subject-specific responses
    if (userMessage.toLowerCase().includes('mathematics') || userMessage.toLowerCase().includes('math')) {
      return responses[Math.floor(Math.random() * responses.length)] + ` Mathematics involves numbers, quantities, shapes, and patterns.`
    }
    
    if (userMessage.toLowerCase().includes('science')) {
      return responses[Math.floor(Math.random() * responses.length)] + ` Science is the systematic study of the natural world.`
    }
    
    if (userMessage.toLowerCase().includes('history')) {
      return responses[Math.floor(Math.random() * responses.length)] + ` History is the study of past events and civilizations.`
    }
    
    if (userMessage.toLowerCase().includes('english') || userMessage.toLowerCase().includes('literature')) {
      return responses[Math.floor(Math.random() * responses.length)] + ` English involves communication and written works.`
    }
    
    if (userMessage.toLowerCase().includes('physics')) {
      return responses[Math.floor(Math.random() * responses.length)] + ` Physics is the study of matter and energy.`
    }
    
    if (userMessage.toLowerCase().includes('chemistry')) {
      return responses[Math.floor(Math.random() * responses.length)] + ` Chemistry is the science of matter and its changes.`
    }
    
    if (userMessage.toLowerCase().includes('biology')) {
      return responses[Math.floor(Math.random() * responses.length)] + ` Biology is the study of living organisms.`
    }
    
    // Generic response
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const handleFileUpload = (type: 'image' | 'audio' | 'pdf' | 'file', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const newUserMessage: UserMessage = {
        id: Date.now().toString(),
        type,
        content: `Uploaded ${type}: ${file.name}`,
        fileName: file.name,
        timestamp: new Date()
      }
      
      setUserMessages(prev => [...prev, newUserMessage])
      setAllMessages(prev => [...prev, newUserMessage])
      setIsTyping(true)
      
      // Simulate AI tutor response to file
      setTimeout(() => {
        const tutorResponse: TutorResponse = {
          id: (Date.now() + 1).toString(),
          content: generateFileResponse(type, file.name),
          timestamp: new Date()
        }
        setTutorResponses(prev => [...prev, tutorResponse])
        setAllMessages(prev => [...prev, tutorResponse])
        setIsTyping(false)
      }, 2000)
    }
  }

  const generateFileResponse = (type: string, fileName: string): string => {
    // Direct file responses - no follow-up questions
    const responses = {
      image: `I can see you've shared an image: ${fileName}. I can help you understand what this shows.`,
      audio: `I've received your audio message: ${fileName}. I can help you with what you asked.`,
      pdf: `Thanks for sharing the PDF: ${fileName}. I can help you work through this document.`,
      file: `I've received your file: ${fileName}. I can help you understand this content.`
    }
    
    return responses[type as keyof typeof responses]
  }

  const toggleInteractiveMode = () => {
    setInteractiveMode(!interactiveMode)
  }

  // Voice Recording Functions
  const startRecording = async () => {
    try {
      // Check if microphone is available
      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasMicrophone = devices.some(device => device.kind === 'audioinput')
      
      if (!hasMicrophone) {
        // No microphone found, fallback to file upload
        audioInputRef.current?.click()
        return
      }

      // Try to access microphone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        chunks.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(blob)
        handleVoiceMessage(blob, audioUrl)
        stream.getTracks().forEach(track => track.stop())
      }

      setMediaRecorder(recorder)
      recorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer and store it
      const timer: NodeJS.Timeout = setInterval(() => {
        setRecordingTime((prev: number) => prev + 1)
      }, 1000)
      
      // Store timer to clear it later
      ;(recorder as any).timer = timer
    } catch (error) {
      console.error('Microphone access error:', error)
      
      // Check the specific error
      const err = error as Error
      if (err.name === 'NotAllowedError') {
        // User denied microphone access
        if (confirm('Microphone access was denied. Would you like to upload an audio file instead?')) {
          audioInputRef.current?.click()
        }
      } else if (err.name === 'NotFoundError') {
        // No microphone found
        alert('No microphone found. Please connect a microphone or upload an audio file.')
        audioInputRef.current?.click()
      } else {
        // Other error
        if (confirm('Could not access microphone. Would you like to upload an audio file instead?')) {
          audioInputRef.current?.click()
        }
      }
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      setIsRecording(false)
      
      // Clear timer
      if ((mediaRecorder as any).timer) {
        clearInterval((mediaRecorder as any).timer)
      }
      
      setRecordingTime(0)
    }
  }

  const handleVoiceMessage = (blob: Blob, audioUrl: string) => {
    const newUserMessage: UserMessage = {
      id: Date.now().toString(),
      type: 'audio',
      content: 'Voice message',
      fileName: `recording_${Date.now()}.webm`,
      timestamp: new Date()
    }
    
    setUserMessages(prev => [...prev, newUserMessage])
    setAllMessages(prev => [...prev, newUserMessage])
    setIsTyping(true)
    
    // Simulate AI tutor response to voice message
    setTimeout(() => {
      const tutorResponse: TutorResponse = {
        id: (Date.now() + 1).toString(),
        content: 'I received your voice message. I can help you with what you asked.',
        timestamp: new Date()
      }
      setTutorResponses(prev => [...prev, tutorResponse])
      setAllMessages(prev => [...prev, tutorResponse])
      setIsTyping(false)
    }, 2000)
  }

  const currentStepData = learningSteps[currentStep - 1]

  if (!learningStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🤖</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {courseData ? `📚 ${courseData.title}` : (mode === 'revision' ? '📚 AI Revision Mode' : '📖 AI Learning Mode')}
              </h1>
              <p className="text-gray-600">
                {courseData ? `${courseData.instructor} • ${courseData.duration} • ${courseData.lessons} lessons` : topic}
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">📖 Learning Context</h3>
              <div className="space-y-2 text-blue-700">
                <p><strong>Topic:</strong> {topic}</p>
                <p><strong>Mode:</strong> {mode === 'revision' ? 'Revision' : 'Learning'}</p>
                <p><strong>Your AI Tutor:</strong> ChatGPT-style teaching</p>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-green-800 mb-3">🎯 Your AI Tutor Experience</h3>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Behaves like ChatGPT - friendly and conversational</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Explains concepts deeply but clearly</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Uses simple, student-friendly language</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Exactly 6 steps - never more, never less</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Encouraging and supportive throughout</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleStartLearning}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                {mode === 'revision' ? 'Start Revision' : 'Start Learning'}
              </button>
              <button
                onClick={handleStartChatMode}
                className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                🤖 Chat with AI Tutor
              </button>
              <button
                onClick={handleBackToDashboard}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-full z-10">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              AI
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">AI Tutor</h2>
              <p className="text-xs text-gray-500">Learning Assistant</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto">
          <nav className="space-y-2">
            <button className="w-full text-left px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium flex items-center gap-2">
              💬 Chat
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2">
              📚 Learn
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2">
              📖 Practice
            </button>
            <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2">
              📊 Progress
            </button>
            
            {/* Language Options */}
            <div className="pt-2 mt-2 border-t border-gray-200">
              <button
                onClick={() => setShowLanguageOptions(!showLanguageOptions)}
                className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2"
              >
                🌐 {selectedLanguage}
                <span className="ml-auto text-xs">
                  {showLanguageOptions ? '▼' : '▶'}
                </span>
              </button>
              
              {showLanguageOptions && (
                <div className="mt-1 space-y-1">
                  <button
                    onClick={() => {
                      setSelectedLanguage('English')
                      setShowLanguageOptions(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                      selectedLanguage === 'English' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLanguage('Spanish')
                      setShowLanguageOptions(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                      selectedLanguage === 'Spanish' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🇪🇸 Spanish
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLanguage('French')
                      setShowLanguageOptions(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                      selectedLanguage === 'French' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🇫🇷 French
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLanguage('German')
                      setShowLanguageOptions(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                      selectedLanguage === 'German' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🇩🇪 German
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLanguage('Chinese')
                      setShowLanguageOptions(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                      selectedLanguage === 'Chinese' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🇨🇳 Chinese
                  </button>
                  <button
                    onClick={() => {
                      setSelectedLanguage('Hindi')
                      setShowLanguageOptions(false)
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 text-sm ${
                      selectedLanguage === 'Hindi' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🇮🇳 Hindi
                  </button>
                </div>
              )}
            </div>
            
            <button className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2">
              ⚙️ Settings
            </button>
          </nav>
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              👤
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Student</p>
              <p className="text-xs text-gray-500">Online</p>
            </div>
            <button
              onClick={handleBackToDashboard}
              className="text-gray-400 hover:text-gray-600"
            >
              ⚡
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 fixed top-0 right-0 left-64 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white">
                🤖
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-800">AI Tutor</h1>
                <p className="text-sm text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Online - Ready to help
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                🔍
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                ⋮
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 pt-32 pb-32" ref={chatMessagesRef}>
          <div className="max-w-4xl mx-auto">
            {allMessages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                  🤖
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to AI Tutor</h3>
                <p className="text-gray-600 mb-4">I'm here to help you learn any subject. Ask me anything!</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">Mathematics</span>
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">Science</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm">History</span>
                  <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">English</span>
                </div>
              </div>
            )}
            
            <div className="space-y-4 pb-4">
              {allMessages.map((message, index) => {
                // Check if it's a user message or tutor response
                const isUserMessage = 'type' in message
                
                if (isUserMessage) {
                  return (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-lg">
                        <div className="bg-blue-600 text-white p-4 rounded-2xl rounded-br-sm shadow-sm">
                          {message.type === 'text' && message.content}
                          {message.type === 'image' && <span>📷 {message.content}</span>}
                          {message.type === 'audio' && <span>🎤 {message.content}</span>}
                          {message.type === 'pdf' && <span>📄 {message.content}</span>}
                          {message.type === 'file' && <span>📎 {message.content}</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div key={message.id} className="flex justify-start">
                      <div className="max-w-lg">
                        <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-sm shadow-sm">
                          <p className="text-gray-800 whitespace-pre-line">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                }
              })}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-lg">
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-bl-sm shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-4 fixed bottom-0 right-0 left-64 z-30">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <button
                onClick={() => setShowUploadOptions(!showUploadOptions)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-all"
              >
                📎
              </button>
              
              <div className="flex-1 relative">
                <textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={1}
                />
              </div>
              
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-lg transition-all ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isRecording ? '🔴' : '🎤'}
              </button>
              
              {isRecording && (
                <span className="text-sm text-red-500 font-medium">
                  {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                </span>
              )}
              
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim()}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            
            {/* Upload Options Dropdown */}
            {showUploadOptions && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-30">
                <div className="space-y-1">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      handleFileUpload('image', e)
                      setShowUploadOptions(false)
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
                  >
                    📷 Send Image
                  </button>

                  <input
                    ref={audioInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      handleFileUpload('audio', e)
                      setShowUploadOptions(false)
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => audioInputRef.current?.click()}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
                  >
                    🎵 Upload Audio
                  </button>

                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      handleFileUpload('pdf', e)
                      setShowUploadOptions(false)
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => pdfInputRef.current?.click()}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
                  >
                    📄 Send PDF
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => {
                      handleFileUpload('file', e)
                      setShowUploadOptions(false)
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm flex items-center gap-2"
                  >
                    📎 Send File
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

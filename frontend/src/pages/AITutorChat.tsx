import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Search, Settings, BookOpen, GraduationCap, TrendingUp, Clock, MessageSquare, Brain, Paperclip, Mic, Smile, MoreVertical, Zap, ChevronDown, Volume2, X, Check, Crown, Sparkles, CreditCard, Bitcoin, Lock, Shield, User, AlertCircle, Wifi, WifiOff } from 'lucide-react'
import '../styles/dashboard-theme.css'
import { generateAIResponse, validateApiKey, type ChatMessage } from '../services/openai'

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

export default function AITutorChat() {
  
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [allMessages, setAllMessages] = useState<(UserMessage | TutorResponse)[]>([])
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardErrors, setCardErrors] = useState({ cardNumber: '', expiryDate: '', cvv: '' })
  const [cardBrand, setCardBrand] = useState('')
  const [showLearnDropdown, setShowLearnDropdown] = useState(false)
  const [userProfile, setUserProfile] = useState({
    isPro: false,
    subscriptionEnd: null as Date | null,
    planType: 'free' as 'free' | 'pro'
  })
  const [isRecording, setIsRecording] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isApiConfigured, setIsApiConfigured] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState('')
  
  const chatMessagesRef = useRef<HTMLDivElement>(null)
  const learnDropdownRef = useRef<HTMLDivElement>(null)

  // Check API configuration on component mount
  useEffect(() => {
    const configured = validateApiKey()
    setIsApiConfigured(configured)
    if (!configured) {
      setApiError('OpenAI API key not configured. Please add your API key to the .env file.')
    }
  }, [])

  // Load chat history and user profile from localStorage on component mount
  useEffect(() => {
    try {
      // Load messages
      const savedMessages = localStorage.getItem('aiTutorChatMessages')
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages)
        // Convert string dates back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
        setAllMessages(messagesWithDates)
      }
      
      // Load user profile
      const savedProfile = localStorage.getItem('aiTutorUserProfile')
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile)
        const profileWithDates = {
          ...parsedProfile,
          subscriptionEnd: parsedProfile.subscriptionEnd ? new Date(parsedProfile.subscriptionEnd) : null
        }
        
        // Note: Removed automatic subscription expiry check to prevent Pro status from being removed when navigating pages
        
        setUserProfile(profileWithDates)
      }
      setProfileLoaded(true)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }, [])

  // Save user profile to localStorage whenever it changes (but only after initial load)
  useEffect(() => {
    if (profileLoaded) {
      try {
        localStorage.setItem('aiTutorUserProfile', JSON.stringify(userProfile))
      } catch (error) {
        console.error('Error saving user profile:', error)
      }
    }
  }, [userProfile, profileLoaded])

  // Check subscription expiry on component mount and periodically
  // Note: Removed automatic subscription check to prevent Pro status from being removed periodically

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

  // Check if subscription is expiring soon (7 days or less)
  const isExpiringSoon = () => {
    if (!userProfile.isPro || !userProfile.subscriptionEnd) return false
    const now = new Date()
    const timeUntilExpiry = userProfile.subscriptionEnd.getTime() - now.getTime()
    const daysUntilExpiry = Math.ceil(timeUntilExpiry / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0
  }

  // Get days until expiry
  const getDaysUntilExpiry = () => {
    if (!userProfile.isPro || !userProfile.subscriptionEnd) return null
    const now = new Date()
    const timeUntilExpiry = userProfile.subscriptionEnd.getTime() - now.getTime()
    return Math.ceil(timeUntilExpiry / (1000 * 60 * 60 * 24))
  }
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      setTimeout(() => {
        chatMessagesRef.current?.scrollTo({
          top: chatMessagesRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }, 100)
    }
  }, [allMessages, isTyping])

  const handleSendMessage = async () => {
    console.log('Sending message:', currentMessage)
    if (currentMessage.trim() || attachedFile) {
      const messageContent = currentMessage || `Shared file: ${attachedFile?.name}`
      
      const newUserMessage: UserMessage = {
        id: `user_${Date.now()}_${Math.random()}`,
        type: attachedFile ? 'file' : 'text',
        content: messageContent,
        fileName: attachedFile?.name,
        timestamp: new Date()
      }
      
      console.log('Adding user message:', newUserMessage)
      setAllMessages(prev => [...prev, newUserMessage])
      
      // Clear input immediately like ChatGPT
      setCurrentMessage('')
      setAttachedFile(null)
      setApiError(null)
      
      // Immediate scroll to bottom after adding user message
      setTimeout(() => {
        chatMessagesRef.current?.scrollTo({
          top: chatMessagesRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }, 50)
      
      setIsTyping(true)
      
      try {
        if (!isApiConfigured) {
          throw new Error('OpenAI API key not configured. Please add your API key to the .env file.')
        }

        // Prepare chat history for API
        const chatHistory: ChatMessage[] = allMessages
          .filter(msg => msg.id !== newUserMessage.id) // Exclude the message we just added
          .map(msg => ({
            role: ('user' in msg ? 'user' : 'assistant') as 'user' | 'assistant',
            content: msg.content
          }))
          .slice(-10) // Keep last 10 messages for context

        // Add current message
        chatHistory.push({
          role: 'user',
          content: messageContent
        })

        // Create a placeholder response for streaming
        const placeholderResponse: TutorResponse = {
          id: `tutor_${Date.now()}_${Math.random()}`,
          content: '',
          timestamp: new Date()
        }
        setAllMessages(prev => [...prev, placeholderResponse])
        setStreamingResponse('')

        // Generate AI response with streaming
        const fullResponse = await generateAIResponse(
          chatHistory,
          (chunk) => {
            setStreamingResponse(prev => prev + chunk)
            setAllMessages(prev => 
              prev.map(msg => 
                msg.id === placeholderResponse.id 
                  ? { ...msg, content: (msg.content || '') + chunk }
                  : msg
              )
            )
          }
        )

        // Final update to ensure we have the complete response
        setAllMessages(prev => 
          prev.map(msg => 
            msg.id === placeholderResponse.id 
              ? { ...msg, content: fullResponse }
              : msg
          )
        )
        
        setStreamingResponse('')
        
      } catch (error) {
        console.error('Error generating response:', error)
        const errorMessage: TutorResponse = {
          id: `error_${Date.now()}_${Math.random()}`,
          content: `❌ **Error**: ${error instanceof Error ? error.message : 'Failed to generate response. Please try again.'}`,
          timestamp: new Date()
        }
        setAllMessages(prev => [...prev, errorMessage])
        setApiError(error instanceof Error ? error.message : 'Unknown error occurred')
      } finally {
        setIsTyping(false)
        
        // Scroll to bottom after response
        setTimeout(() => {
          chatMessagesRef.current?.scrollTo({
            top: chatMessagesRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }, 100)
      }
    }
  }


  const handleFileRemove = () => {
    setAttachedFile(null)
  }

  const handleVoiceRecording = () => {
    if (!isRecording) {
      // Start recording
      setIsRecording(true)
      // Simulate recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false)
        // Simulate voice to text conversion
        setCurrentMessage("This is a sample voice message converted to text")
      }, 3000)
    } else {
      // Stop recording
      setIsRecording(false)
    }
  }

  const handlePayment = (method: string) => {
    console.log(`Opening checkout for ${method}`)
    setSelectedPaymentMethod(method)
    setShowPricingModal(false)
    setShowCheckoutModal(true)
  }

  const validateCardNumber = (number: string) => {
    // Remove spaces and dashes
    const cleanNumber = number.replace(/[\s-]/g, '')
    
    // Check if it's numeric and has correct length (13-19 digits)
    if (!/^\d+$/.test(cleanNumber)) {
      return 'Card number must contain only digits'
    }
    
    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return 'Card number must be 13-19 digits'
    }
    
    // Luhn algorithm check
    let sum = 0
    let isEven = false
    
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10)
      
      if (isEven) {
        digit *= 2
        if (digit > 9) {
          digit -= 9
        }
      }
      
      sum += digit
      isEven = !isEven
    }
    
    if (sum % 10 !== 0) {
      return 'Invalid card number'
    }
    
    return ''
  }

  const validateExpiryDate = (date: string) => {
    // Check format MM/YY
    if (!/^\d{2}\/\d{2}$/.test(date)) {
      return 'Expiry date must be in MM/YY format'
    }
    
    const [month, year] = date.split('/')
    const monthNum = parseInt(month, 10)
    const yearNum = parseInt(year, 10)
    
    if (monthNum < 1 || monthNum > 12) {
      return 'Invalid month'
    }
    
    const currentYear = new Date().getFullYear() % 100
    const currentMonth = new Date().getMonth() + 1
    
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return 'Card has expired'
    }
    
    return ''
  }

  const validateCVV = (cvv: string) => {
    if (!/^\d+$/.test(cvv)) {
      return 'CVV must contain only digits'
    }
    
    if (cvv.length !== 3 && cvv.length !== 4) {
      return 'CVV must be 3 or 4 digits'
    }
    
    return ''
  }

  const handleCardNumberChange = (value: string) => {
    // Format with spaces every 4 digits
    const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim()
    setCardNumber(formatted)
    
    // Detect card brand
    const brand = detectCardBrand(formatted)
    setCardBrand(brand)
    
    const error = validateCardNumber(formatted)
    setCardErrors(prev => ({ ...prev, cardNumber: error }))
  }

  const handleExpiryDateChange = (value: string) => {
    // Auto-format as MM/YY
    let formatted = value.replace(/\D/g, '')
    if (formatted.length >= 2) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4)
    }
    setExpiryDate(formatted)
    
    const error = validateExpiryDate(formatted)
    setCardErrors(prev => ({ ...prev, expiryDate: error }))
  }

  const handleCvvChange = (value: string) => {
    const formatted = value.replace(/\D/g, '').slice(0, 4)
    setCvv(formatted)
    
    const error = validateCVV(formatted)
    setCardErrors(prev => ({ ...prev, cvv: error }))
  }

  const detectCardBrand = (number: string) => {
    const cleanNumber = number.replace(/[\s-]/g, '')
    
    // Visa: starts with 4
    if (/^4/.test(cleanNumber)) {
      return 'visa'
    }
    
    // Mastercard: starts with 51-55 or 2221-2720
    if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
      return 'mastercard'
    }
    
    // American Express: starts with 34 or 37
    if (/^3[47]/.test(cleanNumber)) {
      return 'amex'
    }
    
    // Discover: starts with 6011, 65, 644-649
    if (/^6011/.test(cleanNumber) || /^65/.test(cleanNumber) || /^6[4-9]/.test(cleanNumber)) {
      return 'discover'
    }
    
    // JCB: starts with 3528-3589
    if (/^35[2-8][0-9]/.test(cleanNumber)) {
      return 'jcb'
    }
    
    // Diners Club: starts with 36, 38, 39
    if (/^3[6-9]/.test(cleanNumber)) {
      return 'diners'
    }
    
    return ''
  }

  const getCardBrandLogo = (brand: string) => {
    switch (brand) {
      case 'visa':
        return 'VISA'
      case 'mastercard':
        return 'MC'
      case 'amex':
        return 'AMEX'
      case 'discover':
        return 'DISC'
      case 'jcb':
        return 'JCB'
      case 'diners':
        return 'DC'
      default:
        return ''
    }
  }

  const getCardBrandColor = (brand: string) => {
    switch (brand) {
      case 'visa':
        return 'text-blue-600'
      case 'mastercard':
        return 'text-red-600'
      case 'amex':
        return 'text-blue-500'
      case 'discover':
        return 'text-orange-600'
      case 'jcb':
        return 'text-red-500'
      case 'diners':
        return 'text-blue-700'
      default:
        return 'text-gray-400'
    }
  }

  const validatePayment = () => {
    const cardError = validateCardNumber(cardNumber)
    const expiryError = validateExpiryDate(expiryDate)
    const cvvError = validateCVV(cvv)
    
    setCardErrors({
      cardNumber: cardError,
      expiryDate: expiryError,
      cvv: cvvError
    })
    
    return !cardError && !expiryError && !cvvError
  }

  const handleCompletePayment = () => {
    console.log('Payment button clicked, method:', selectedPaymentMethod)
    console.log('Card details:', { cardNumber, expiryDate, cvv })
    
    if (selectedPaymentMethod === 'stripe') {
      if (!validatePayment()) {
        console.log('Payment validation failed')
        // Show error message in chat
        const errorMessage: TutorResponse = {
          id: `tutor_${Date.now()}_${Math.random()}`,
          content: 'Please fix the card details before completing payment. Check for any error messages in the payment form.',
          timestamp: new Date()
        }
        setAllMessages(prev => [...prev, errorMessage])
        return
      }
    }
    
    console.log('Payment validation passed, processing payment...')
    
    // Process payment
    setShowCheckoutModal(false)
    
    // Update user profile to Pro for 1 month
    const subscriptionEnd = new Date()
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1)
    
    const updatedProfile = {
      isPro: true,
      subscriptionEnd: subscriptionEnd,
      planType: 'pro' as 'free' | 'pro'
    }
    
    console.log('Updating user profile:', updatedProfile)
    setUserProfile(updatedProfile)
    
    const successMessage: TutorResponse = {
      id: `tutor_${Date.now()}_${Math.random()}`,
      content: `🎉 Congratulations! 🎉\n\nWelcome to AI Tutor Pro! Your payment of $19.00 was successful and your subscription is now active.\n\n✨ You now have access to:\n• Unlimited AI tutoring sessions\n• Advanced AI responses\n• Voice & video capabilities\n• All subjects & levels\n• File upload support\n• Priority customer support\n\nYour Pro subscription is valid until: ${subscriptionEnd.toLocaleDateString()}\n\nThank you for upgrading! Let's start your enhanced learning journey! 🚀`,
      timestamp: new Date()
    }
    
    console.log('Adding success message:', successMessage)
    setAllMessages(prev => {
      console.log('Current messages:', prev.length)
      const newMessages = [...prev, successMessage]
      console.log('New messages count:', newMessages.length)
      
      // Also add a simple test message
      const testMessage: TutorResponse = {
        id: `test_${Date.now()}`,
        content: 'Payment completed successfully! Welcome to Pro!',
        timestamp: new Date()
      }
      newMessages.push(testMessage)
      
      return newMessages
    })
    
    // Clear form
    setCardNumber('')
    setExpiryDate('')
    setCvv('')
    setCardBrand('')
    setCardErrors({ cardNumber: '', expiryDate: '', cvv: '' })
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--background-color)' }}>
      {/* Subtle background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Static gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
      </div>
      {/* Enhanced Sidebar */}
      <div className="w-80 backdrop-blur-xl bg-white/5 border-2 border-white/50 flex flex-col fixed top-24 left-5 bottom-5 z-10 shadow-2xl dashboard-card-advanced rounded-2xl">
        {/* Sidebar Header */}
        <div className="p-6 border-b-2 border-white/50 flex-shrink-0 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-xl shadow-blue-500/30 border-2 border-white/60">
              <Bot className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-white text-xl mb-1">AI Tutor</h2>
              <p className="text-xs font-semibold flex items-center gap-2">
                {isApiConfigured ? (
                  <>
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span className="text-blue-300">Online</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    <span className="text-red-300">API Not Configured</span>
                  </>
                )}
              </p>
            </div>
            <button className="p-3 text-white/60 rounded-xl">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex-1 p-3">
          <nav className="space-y-2">
            <button className="w-full text-left px-3 py-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white rounded-2xl font-semibold flex items-center gap-3 backdrop-blur-sm border border-white/20 shadow-lg">
              <MessageSquare className="w-5 h-5" />
              Chat
              <span className="ml-auto bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Active</span>
            </button>
            <div className="relative" ref={learnDropdownRef}>
              <button 
                onClick={() => setShowLearnDropdown(!showLearnDropdown)}
                className="w-full text-left px-3 py-4 text-white/80 rounded-2xl flex items-center gap-3 backdrop-blur-sm border border-transparent hover:text-white hover:bg-white/10"
              >
                <BookOpen className="w-5 h-5" />
                <span className="flex-1">Learn</span>
                <ChevronDown className={`w-4 h-4 opacity-50 transition-transform duration-200 ${showLearnDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showLearnDropdown && (
                <div className="absolute left-0 right-0 mt-1 bg-gray-800 border border-white/20 rounded-xl shadow-2xl z-[100] overflow-hidden">
                  <div className="py-2 max-h-96 overflow-y-auto">
                    <button 
                      onClick={() => {
                        const mathMessage: TutorResponse = {
                          id: `math_${Date.now()}_${Math.random()}`,
                          content: `Let's start with Mathematics! I can help you with:\n\n📚 **Topics I cover:**\n• Algebra & Geometry\n• Calculus & Trigonometry\n• Statistics & Probability\n• Word Problems & Equations\n\nWhat specific math topic would you like to learn about today?`,
                          timestamp: new Date()
                        }
                        setAllMessages(prev => [...prev, mathMessage])
                        setShowLearnDropdown(false)
                      }}
                      className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-blue-400 text-sm">∑</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Mathematics</p>
                        <p className="text-xs text-white/60">Algebra, Calculus, Statistics</p>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => {
                        const scienceMessage: TutorResponse = {
                          id: `science_${Date.now()}_${Math.random()}`,
                          content: `Great choice! Science is fascinating! I can help you with:\n\n🔬 **Science Topics:**\n• Physics (Mechanics, Electricity, Waves)\n• Chemistry (Atoms, Reactions, Compounds)\n• Biology (Cells, Genetics, Evolution)\n• Earth Science & Astronomy\n\nWhich area of science interests you most?`,
                          timestamp: new Date()
                        }
                        setAllMessages(prev => [...prev, scienceMessage])
                        setShowLearnDropdown(false)
                      }}
                      className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-green-400 text-sm">⚗</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Science</p>
                        <p className="text-xs text-white/60">Physics, Chemistry, Biology</p>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => {
                        const historyMessage: TutorResponse = {
                          id: `history_${Date.now()}_${Math.random()}`,
                          content: `Let's explore History together! I can help you with:\n\n📜 **History Topics:**\n• Ancient Civilizations\n• World Wars & Modern History\n• American History\n• Cultural & Social History\n\nWhat historical period or event would you like to learn about?`,
                          timestamp: new Date()
                        }
                        setAllMessages(prev => [...prev, historyMessage])
                        setShowLearnDropdown(false)
                      }}
                      className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400 text-sm">📚</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">History</p>
                        <p className="text-xs text-white/60">Ancient, Modern, Cultural</p>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => {
                        const englishMessage: TutorResponse = {
                          id: `english_${Date.now()}_${Math.random()}`,
                          content: `Excellent! English Language Arts is fundamental! I can help with:\n\n✍️ **English Topics:**\n• Grammar & Writing\n• Literature Analysis\n• Poetry & Drama\n• Essay Writing & Composition\n\nWhat aspect of English would you like to work on?`,
                          timestamp: new Date()
                        }
                        setAllMessages(prev => [...prev, englishMessage])
                        setShowLearnDropdown(false)
                      }}
                      className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-orange-400 text-sm">📝</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">English</p>
                        <p className="text-xs text-white/60">Grammar, Literature, Writing</p>
                      </div>
                    </button>
                    
                    <button 
                      onClick={() => {
                        const programmingMessage: TutorResponse = {
                          id: `programming_${Date.now()}_${Math.random()}`,
                          content: `Programming is an amazing skill! I can teach you:\n\n💻 **Programming Topics:**\n• Python, JavaScript, Java\n• Web Development (HTML/CSS/JS)\n• Data Structures & Algorithms\n• Debugging & Problem Solving\n\nWhich programming language or concept interests you?`,
                          timestamp: new Date()
                        }
                        setAllMessages(prev => [...prev, programmingMessage])
                        setShowLearnDropdown(false)
                      }}
                      className="w-full text-left px-4 py-3 text-white/80 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3"
                    >
                      <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-cyan-400 text-sm">{`</>`}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Programming</p>
                        <p className="text-xs text-white/60">Python, JavaScript, Web Dev</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button className="w-full text-left px-3 py-4 text-white/80 rounded-2xl flex items-center gap-3 backdrop-blur-sm border border-transparent">
              <TrendingUp className="w-5 h-5" />
              <span className="flex-1">Progress</span>
              <TrendingUp className="w-4 h-4 opacity-50" />
            </button>
            <button 
              onClick={() => !userProfile.isPro && setShowPricingModal(true)}
              className={`w-full text-left px-3 py-4 rounded-2xl font-semibold flex items-center gap-3 backdrop-blur-sm border shadow-lg ${
                userProfile.isPro && isExpiringSoon()
                  ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border-orange-400/30 animate-pulse'
                  : userProfile.isPro
                  ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-400/30' 
                  : 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-white border-yellow-400/30'
              }`}
            >
              <Crown className="w-5 h-5" />
              <span className="flex-1">
                {userProfile.isPro && isExpiringSoon() 
                  ? `Renew (${getDaysUntilExpiry()} days left)` 
                  : userProfile.isPro 
                    ? 'Current Plan' 
                    : 'Upgrade Plan'
                }
              </span>
              <span className={`ml-auto text-xs px-2 py-1 rounded-full font-bold ${
                userProfile.isPro && isExpiringSoon()
                  ? 'bg-orange-500 text-white animate-pulse'
                  : userProfile.isPro 
                    ? 'bg-green-500 text-white' 
                    : 'bg-yellow-500 text-white'
              }`}>
                {userProfile.isPro && isExpiringSoon()
                  ? 'RENEW'
                  : userProfile.isPro 
                    ? 'PRO' 
                    : 'UPGRADE'
                }
              </span>
            </button>
          </nav>
        </div>

        {/* Enhanced User Section */}
        <div className="p-4 border-t border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
              {userProfile.isPro ? <Crown className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <p className="text-white font-black text-base drop-shadow-lg">
                  {userProfile.isPro ? 'Pro Student' : 'Student'}
                </p>
                {userProfile.isPro && (
                  <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-black shadow-xl animate-pulse border border-yellow-300">
                    PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-yellow-300 font-black drop-shadow-md">
                {userProfile.isPro && userProfile.subscriptionEnd
                  ? `Valid until ${userProfile.subscriptionEnd.toLocaleDateString()}`
                  : 'Online - Ready to learn'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-96 relative z-5">
        {/* Enhanced Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 pt-28 pb-6" ref={chatMessagesRef}>
          <div className="max-w-5xl mx-auto">
            {allMessages.length === 0 && (
              <div className="text-center py-12 flex flex-col items-center justify-center min-h-[400px] relative z-20">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-blue-500/30 relative overflow-hidden">
                  <Brain className="w-20 h-20 text-white fill-current drop-shadow-lg" />
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10"></div>
                </div>
                <h3 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-6">
                  Welcome to AI Tutor Chat
                </h3>
                <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                  I'm here to help you learn any subject. Ask me anything! I can assist with mathematics, science, history, literature, and more.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <span className="px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-200 rounded-2xl text-sm font-semibold backdrop-blur-sm border border-white/20 hover:bg-blue-500/30 cursor-pointer shadow-lg">Mathematics</span>
                  <span className="px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-200 rounded-2xl text-sm font-semibold backdrop-blur-sm border border-white/20 hover:bg-green-500/30 cursor-pointer shadow-lg">Science</span>
                  <span className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 rounded-2xl text-sm font-semibold backdrop-blur-sm border border-white/20 hover:bg-purple-500/30 cursor-pointer shadow-lg">History</span>
                  <span className="px-6 py-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-200 rounded-2xl text-sm font-semibold backdrop-blur-sm border border-white/20 hover:bg-orange-500/30 cursor-pointer shadow-lg">English</span>
                  <span className="px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-200 rounded-2xl text-sm font-semibold backdrop-blur-sm border border-white/20 hover:bg-cyan-500/30 cursor-pointer shadow-lg">Programming</span>
                </div>
              </div>
            )}
            
            {/* API Error Notification */}
            {apiError && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-200 text-sm font-medium">API Configuration Error</p>
                    <p className="text-red-300 text-xs mt-1">{apiError}</p>
                    <p className="text-red-300 text-xs mt-2">
                      To fix this issue:
                    </p>
                    <ol className="text-red-300 text-xs mt-1 ml-4 list-decimal">
                      <li>Create a `.env` file in your frontend directory</li>
                      <li>Add your OpenAI API key: `VITE_OPENAI_API_KEY=your_key_here`</li>
                      <li>Restart your development server</li>
                    </ol>
                  </div>
                  <button 
                    onClick={() => setApiError(null)}
                    className="text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-6 pb-32 scrollbar-hide">
              {allMessages.map((message) => {
                // Check if it's a user message or tutor response
                const isUserMessage = 'type' in message
                
                if (isUserMessage) {
                  return (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-2xl">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-5 rounded-3xl rounded-br-2xl shadow-2xl shadow-blue-500/30 backdrop-blur-sm relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100"></div>
                          <p className="relative z-10 font-medium leading-relaxed break-words">{message.content}</p>
                        </div>
                        <p className="text-xs text-white/60 mt-3 text-right flex items-center gap-2 font-medium">
                          <Clock className="w-4 h-4" />
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                } else {
                  // Don't render empty placeholder messages
                  if (!message.content) {
                    return null
                  }
                  
                  return (
                    <div key={message.id} className="flex justify-start">
                      <div className="max-w-2xl">
                        <div className="backdrop-blur-xl bg-white/5 border border-white/20 p-5 rounded-3xl rounded-tl-2xl shadow-2xl shadow-white/10 relative overflow-hidden group dashboard-card-advanced">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                              <Brain className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-white font-medium leading-relaxed relative z-10 break-words" style={{ whiteSpace: 'pre-line' }}>{message.content}</p>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-white/60 mt-3 flex items-center gap-2 font-medium">
                          <Clock className="w-4 h-4" />
                          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                }
              })}
              
              {isTyping && !streamingResponse && (
                <div className="flex justify-start">
                  <div className="max-w-2xl">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/20 p-5 rounded-3xl rounded-tl-2xl shadow-2xl shadow-white/10 dashboard-card-advanced">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                            <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                          </div>
                          <span className="text-white/80 text-sm font-semibold">AI Tutor is thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Message Input */}
        <div className="backdrop-blur-xl bg-white/5 p-6 fixed bottom-6 right-6 left-96 z-20 shadow-2xl dashboard-card-advanced">
          <div className="max-w-5xl mx-auto">
            {/* File display area */}
            {attachedFile && (
              <div className="mb-3 p-3 bg-white/10 border border-white/20 rounded-2xl flex items-center gap-3">
                <Paperclip className="w-4 h-4 text-blue-300" />
                <span className="text-sm text-white/80 flex-1 truncate">{attachedFile?.name || ''}</span>
                <button 
                  onClick={handleFileRemove}
                  className="p-1 text-white/60 hover:text-white rounded"
                >
                  <span className="text-xs">×</span>
                </button>
              </div>
            )}
            
            <div className="flex gap-4 items-end">
              {/* Attachment button */}
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setAttachedFile(file)
                  }
                }}
              />
              <label 
                htmlFor="file-upload"
                className="p-3 text-white/60 rounded-xl backdrop-blur-sm border border-transparent cursor-pointer"
              >
                <Paperclip className="w-5 h-5" />
              </label>
              
              {/* Main input field */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about your studies..."
                  className="w-full px-6 py-4 bg-white/5 border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 text-white placeholder-white/60 backdrop-blur-sm text-lg font-medium shadow-inner"
                />
                {currentMessage && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <button className="p-2 text-white/60 rounded-lg">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Voice input button - ChatGPT style */}
              <button 
                onClick={handleVoiceRecording}
                className={`p-3 rounded-xl backdrop-blur-sm border transition-all duration-200 group relative ${
                  isRecording 
                    ? 'text-red-500 bg-red-500/10 border-red-500/30 animate-pulse' 
                    : 'text-white/60 hover:text-white hover:bg-white/10 border-transparent'
                }`}
              >
                <Mic className={`w-5 h-5 transition-transform duration-200 ${isRecording ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                <div className={`absolute inset-0 rounded-xl transition-opacity duration-200 ${
                  isRecording 
                    ? 'bg-red-500/20 animate-pulse' 
                    : 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100'
                }`}></div>
              </button>
              
              {/* Send button */}
              <button
                onClick={handleSendMessage}
                disabled={!currentMessage.trim() || isTyping}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/30 disabled:shadow-none flex items-center gap-3 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                <span>Send</span>
              </button>
            </div>
            
            {/* Quick suggestions */}
            {allMessages.length === 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-white/50 font-medium">Quick suggestions:</span>
                <button 
                  onClick={() => setCurrentMessage("Explain the concept of photosynthesis")}
                  className="px-3 py-1 bg-white/10 text-white/80 rounded-lg text-xs font-medium border border-white/10"
                >
                  Explain photosynthesis
                </button>
                <button 
                  onClick={() => setCurrentMessage("Help me solve this math problem")}
                  className="px-3 py-1 bg-white/10 text-white/80 rounded-lg text-xs font-medium border border-white/10"
                >
                  Math problem help
                </button>
                <button 
                  onClick={() => setCurrentMessage("What are the main causes of World War I?")}
                  className="px-3 py-1 bg-white/10 text-white/80 rounded-lg text-xs font-medium border border-white/10"
                >
                  World War I causes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-4xl w-full border border-gray-700 shadow-2xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Choose Your Plan</h2>
                <p className="text-gray-400">Unlock the full power of AI Tutor</p>
              </div>
              <button 
                onClick={() => setShowPricingModal(false)}
                className="p-2 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Free</h3>
                    <p className="text-gray-400 text-sm">Perfect for getting started</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    $0<span className="text-lg text-gray-400 font-normal">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Basic AI tutoring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">10 messages per day</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Text responses only</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Basic subjects</span>
                  </li>
                </ul>

                <button className="w-full py-3 bg-gray-700 text-white rounded-xl font-semibold">
                  Current Plan
                </button>
              </div>

              {/* Pro Plan */}
              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-400/30 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                  POPULAR
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Pro</h3>
                    <p className="text-gray-300 text-sm">For serious learners</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    $19<span className="text-lg text-gray-300 font-normal">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Advanced AI tutoring</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Unlimited messages</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Voice & video responses</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">All subjects & levels</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">File upload support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Priority support</span>
                  </li>
                </ul>

                <div className="space-y-4">
                <button 
                  onClick={() => handlePayment('stripe')}
                  className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Pay Now - $19/month
                </button>
              </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Cancel anytime • No hidden fees • 30-day money-back guarantee
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Complete Payment</h2>
              <button 
                onClick={() => setShowCheckoutModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 border border-yellow-400/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold">AI Tutor Pro</span>
                  <span className="text-yellow-400 font-bold">$19.00</span>
                </div>
                <p className="text-gray-300 text-sm">Monthly subscription</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 mb-4">Payment Method: <span className="text-white capitalize">{selectedPaymentMethod}</span></p>
              
              {selectedPaymentMethod === 'stripe' && (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Card Number"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      maxLength={19}
                      className={`w-full px-4 py-3 pr-16 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors ${
                        cardErrors.cardNumber 
                          ? 'border-red-500 focus:border-red-500' 
                          : 'border-gray-700 focus:border-yellow-500'
                      }`}
                    />
                    {cardBrand && (
                      <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded-md bg-gray-700 ${getCardBrandColor(cardBrand)} text-xs font-bold`}>
                        {getCardBrandLogo(cardBrand)}
                      </div>
                    )}
                    {cardErrors.cardNumber && (
                      <p className="text-red-400 text-xs mt-1">{cardErrors.cardNumber}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={expiryDate}
                        onChange={(e) => handleExpiryDateChange(e.target.value)}
                        maxLength={5}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors ${
                          cardErrors.expiryDate 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-gray-700 focus:border-yellow-500'
                        }`}
                      />
                      {cardErrors.expiryDate && (
                        <p className="text-red-400 text-xs mt-1">{cardErrors.expiryDate}</p>
                      )}
                    </div>
                    
                    <div>
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cvv}
                        onChange={(e) => handleCvvChange(e.target.value)}
                        maxLength={4}
                        className={`w-full px-4 py-3 bg-gray-800 border rounded-xl text-white placeholder-gray-400 focus:outline-none transition-colors ${
                          cardErrors.cvv 
                            ? 'border-red-500 focus:border-red-500' 
                            : 'border-gray-700 focus:border-yellow-500'
                        }`}
                      />
                      {cardErrors.cvv && (
                        <p className="text-red-400 text-xs mt-1">{cardErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'paypal' && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">P</span>
                  </div>
                  <p className="text-gray-300">You will be redirected to PayPal</p>
                </div>
              )}

              {selectedPaymentMethod === 'crypto' && (
                <div className="text-center py-8">
                  <Bitcoin className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                  <p className="text-gray-300">Crypto wallet address will be shown</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleCompletePayment}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs font-bold">✓</span>
                </div>
                Complete Payment - $19.00
              </button>
              
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-2">Secure payment powered by Stripe</p>
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Encrypted</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    <span>PCI Compliant</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Fraud Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-3xl p-8 max-w-2xl w-full border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Payout Options</h2>
              <button 
                onClick={() => setShowPayoutModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Current Balance</p>
                  <p className="text-white text-2xl font-bold">$0.00</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Next Payout Date</p>
                  <p className="text-white font-semibold">Monthly 1st</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={() => setShowPayoutModal(false)}
                className="px-6 py-3 bg-gray-800 text-gray-300 rounded-xl font-semibold hover:bg-gray-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

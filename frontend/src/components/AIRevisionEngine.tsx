import { useState, useCallback, useImperativeHandle, useRef, forwardRef } from 'react'

interface RevisionRequest {
  subject: string
  topic: string
  question_number: number
  previous_answer_status: 'correct' | 'wrong' | null
}

interface GeneratedQuestion {
  question_number: number
  question_text: string
  options: string[]
  correct_answer: number
}

interface AIRevisionEngineProps {
  subject: string
  topic: string
  onQuestionGenerated: (question: GeneratedQuestion) => void
  onSessionComplete: (results: { correct: number; wrong: number }) => void
}

const AIRevisionEngine = forwardRef<any, AIRevisionEngineProps>(({ 
  subject, 
  topic, 
  onQuestionGenerated, 
  onSessionComplete 
}, ref) => {
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)

  const generateQuestion = useCallback(async (questionNumber: number, previousStatus: 'correct' | 'wrong' | null) => {
    if (questionNumber > 20) {
      // Session complete
      setSessionComplete(true)
      onSessionComplete({ correct: correctAnswers, wrong: wrongAnswers })
      return
    }

    setIsGenerating(true)

    try {
      const request: RevisionRequest = {
        subject,
        topic,
        question_number: questionNumber,
        previous_answer_status: previousStatus
      }

      // Call OpenAI API to generate question
      const response = await fetch('/api/generate-revision-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error('Failed to generate question')
      }

      const generatedQuestion = await response.json()
      
      // Parse the generated question
      const question = parseGeneratedQuestion(generatedQuestion, questionNumber)
      
      onQuestionGenerated(question)
    } catch (error) {
      console.error('Error generating question:', error)
      // Fallback to mock question if API fails
      const fallbackQuestion = generateFallbackQuestion(questionNumber)
      onQuestionGenerated(fallbackQuestion)
    } finally {
      setIsGenerating(false)
    }
  }, [subject, topic, onQuestionGenerated, correctAnswers, wrongAnswers])

  const parseGeneratedQuestion = (generatedText: string, questionNumber: number): GeneratedQuestion => {
    // Parse the AI-generated question text
    const lines = generatedText.split('\n').filter(line => line.trim())
    
    let questionText = ''
    const options: string[] = []
    let correctAnswer = 0

    lines.forEach(line => {
      if (line.startsWith('Question')) {
        questionText = line.substring(line.indexOf(':') + 1).trim()
      } else if (line.match(/^[A-D]\./)) {
        options.push(line.substring(3).trim())
      }
    })

    // For demo purposes, randomly assign correct answer
    // In real implementation, this would come from AI response
    correctAnswer = Math.floor(Math.random() * 4)

    return {
      question_number: questionNumber,
      question_text: questionText,
      options,
      correct_answer: correctAnswer
    }
  }

  const generateFallbackQuestion = (questionNumber: number): GeneratedQuestion => {
    // Fallback questions for different topics
    const geometryQuestions = [
      {
        question_text: "What is the definition of a 'postulate' in geometry?",
        options: [
          "A statement that must be proven",
          "A statement accepted as true without proof",
          "A type of angle measurement",
          "A drawing of a geometric shape"
        ],
        correct_answer: 1
      },
      {
        question_text: "Which term describes two angles that add up to 90 degrees?",
        options: [
          "Supplementary angles",
          "Complementary angles",
          "Vertical angles",
          "Corresponding angles"
        ],
        correct_answer: 1
      },
      {
        question_text: "What does 'congruent' mean in geometry?",
        options: [
          "Having the same size and shape",
          "Being parallel to each other",
          "Adding up to 180 degrees",
          "Forming a right angle"
        ],
        correct_answer: 0
      }
    ]

    const algebraQuestions = [
      {
        question_text: "What is a 'variable' in algebra?",
        options: [
          "A fixed number value",
          "A symbol representing an unknown quantity",
          "An operation like addition",
          "A type of equation"
        ],
        correct_answer: 1
      },
      {
        question_text: "What does 'solve an equation' mean?",
        options: [
          "Make the equation more complex",
          "Find the value that makes the equation true",
          "Graph the equation",
          "Write the equation in words"
        ],
        correct_answer: 1
      },
      {
        question_text: "Solve for x: 4x - 7 = 13",
        options: ["x = 3", "x = 5", "x = 7", "x = 9"],
        correct_answer: 1
      }
    ]

    let questionBank = geometryQuestions
    if (topic.includes('Algebra')) {
      questionBank = algebraQuestions
    }

    const question = questionBank[questionNumber % questionBank.length]

    return {
      question_number: questionNumber,
      question_text: question.question_text,
      options: question.options,
      correct_answer: question.correct_answer
    }
  }

  const handleAnswerSubmit = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1)
    } else {
      setWrongAnswers(prev => prev + 1)
    }

    const nextQuestion = currentQuestion + 1
    setCurrentQuestion(nextQuestion)

    // Generate next question
    generateQuestion(nextQuestion, isCorrect ? 'correct' : 'wrong')
  }

  const startSession = () => {
    setCurrentQuestion(1)
    setCorrectAnswers(0)
    setWrongAnswers(0)
    setSessionComplete(false)
    generateQuestion(1, null)
  }

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    startSession,
    handleAnswerSubmit,
    currentQuestion,
    correctAnswers,
    wrongAnswers,
    isGenerating,
    sessionComplete
  }))

  return null // This is a utility component, no UI needed
})

export default AIRevisionEngine

// Hook for using the AI Revision Engine
export const useAIRevisionEngine = (subject: string, topic: string) => {
  const [currentQuestion, setCurrentQuestion] = useState<GeneratedQuestion | null>(null)
  const [results, setResults] = useState<{ correct: number; wrong: number } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleQuestionGenerated = (question: GeneratedQuestion) => {
    setCurrentQuestion(question)
    setIsGenerating(false)
  }

  const handleSessionComplete = (sessionResults: { correct: number; wrong: number }) => {
    setResults(sessionResults)
    setCurrentQuestion(null)
  }

  const submitAnswer = (isCorrect: boolean) => {
    // This would be called by the parent component
    // The actual engine handles the next question generation
  }

  return {
    currentQuestion,
    results,
    isGenerating,
    handleQuestionGenerated,
    handleSessionComplete,
    submitAnswer
  }
}

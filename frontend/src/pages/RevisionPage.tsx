import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import '../styles/dashboard-theme.css'

interface RevisionStep {
  id: number
  title: string
  content: string
  examples: string[]
  questions: Array<{
    id: number
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }>
}

interface RevisionContent {
  subject: string
  topic: string
  weakAreas: string[]
  steps: RevisionStep[]
}

export default function RevisionPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const topic = searchParams.get('topic') || 'Mathematics'
  const subject = searchParams.get('subject') || 'Mathematics'
  
  const [currentStep, setCurrentStep] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(null)
  const [revisionStarted, setRevisionStarted] = useState(false)

  // Mock revision content based on topic
  const getRevisionContent = (): RevisionContent => {
    if (topic.includes('Geometry') || topic.includes('Proofs')) {
      return {
        subject: 'Mathematics',
        topic: 'Geometry Proofs',
        weakAreas: ['Understanding theorem statements', 'Logical reasoning', 'Step-by-step proof construction'],
        steps: [
          {
            id: 1,
            title: 'Quick Recap: Key Geometry Concepts',
            content: 'Geometry proofs are logical arguments that use definitions, postulates, and previously proven theorems to show that a new statement is true. Think of it like building a case where each step must be justified.',
            examples: [
              'If two angles are vertical angles, then they are congruent.',
              'If two parallel lines are cut by a transversal, then corresponding angles are congruent.'
            ],
            questions: [
              {
                id: 1,
                question: 'What is a "postulate" in geometry?',
                options: [
                  'A statement that must be proven',
                  'A statement accepted as true without proof',
                  'A type of angle measurement',
                  'A drawing of a geometric shape'
                ],
                correctAnswer: 1,
                explanation: 'A postulate (or axiom) is a basic statement accepted as true without proof. It serves as a starting point for building logical arguments and proofs.'
              },
              {
                id: 2,
                question: 'Which term describes two angles that add up to 90 degrees?',
                options: [
                  'Supplementary angles',
                  'Complementary angles',
                  'Vertical angles',
                  'Corresponding angles'
                ],
                correctAnswer: 1,
                explanation: 'Complementary angles are two angles whose measures add up to exactly 90 degrees.'
              },
              {
                id: 3,
                question: 'What does "congruent" mean in geometry?',
                options: [
                  'Having the same size and shape',
                  'Being parallel to each other',
                  'Adding up to 180 degrees',
                  'Forming a right angle'
                ],
                correctAnswer: 0,
                explanation: 'Congruent means having the same size and shape - identical in every way.'
              }
            ]
          }
        ]
      }
    } else if (topic.includes('Algebra')) {
      return {
        subject: 'Mathematics',
        topic: 'Algebra Basics',
        weakAreas: ['Solving equations', 'Understanding variables', 'Working with expressions'],
        steps: [
          {
            id: 1,
            title: 'Quick Recap: Algebra Fundamentals',
            content: 'Algebra uses letters (variables) to represent unknown numbers. We solve equations by finding the value of the variable that makes the equation true. Remember: whatever you do to one side, you must do to the other!',
            examples: [
              '2x + 3 = 11 → 2x = 8 → x = 4',
              '3(y - 2) = 15 → y - 2 = 5 → y = 7'
            ],
            questions: [
              {
                id: 1,
                question: 'What is a "variable" in algebra?',
                options: [
                  'A fixed number value',
                  'A symbol representing an unknown quantity',
                  'An operation like addition',
                  'A type of equation'
                ],
                correctAnswer: 1,
                explanation: 'A variable is a symbol (usually a letter) that represents an unknown or changing quantity.'
              },
              {
                id: 2,
                question: 'What does "solve an equation" mean?',
                options: [
                  'Make the equation more complex',
                  'Find the value that makes the equation true',
                  'Graph the equation',
                  'Write the equation in words'
                ],
                correctAnswer: 1,
                explanation: 'Solving an equation means finding the value(s) of the variable that make the equation true.'
              },
              {
                id: 3,
                question: 'Solve for x: 4x - 7 = 13',
                options: ['x = 3', 'x = 5', 'x = 7', 'x = 9'],
                correctAnswer: 1,
                explanation: 'Step 1: Add 7 to both sides: 4x - 7 + 7 = 13 + 7 → 4x = 20. Step 2: Divide both sides by 4: x = 5.'
              }
            ]
          }
        ]
      }
    } else {
      return {
        subject: 'General',
        topic: topic,
        weakAreas: ['Concept understanding', 'Practice application'],
        steps: [
          {
            id: 1,
            title: 'Quick Recap: Key Concepts',
            content: `Let's review the fundamental concepts of ${topic}. Understanding the basics is crucial for building confidence and solving more complex problems.`,
            examples: [
              'Focus on understanding the "why" behind each concept',
              'Practice with simple examples before moving to complex ones'
            ],
            questions: [
              {
                id: 1,
                question: `What is the most important concept to understand in ${topic}?`,
                options: [
                  'Memorizing formulas',
                  'Understanding fundamental principles',
                  'Working quickly',
                  'Getting perfect scores'
                ],
                correctAnswer: 1,
                explanation: 'Understanding fundamental principles is more important than memorization because it helps you solve problems you haven\'t seen before.'
              },
              {
                id: 2,
                question: `How would you define ${topic} in simple terms?`,
                options: [
                  'A collection of random facts',
                  'Understanding core concepts systematically',
                  'Only about solving problems',
                  'A way to get good grades'
                ],
                correctAnswer: 1,
                explanation: `${topic} involves understanding core concepts and applying them systematically.`
              },
              {
                id: 3,
                question: `What approach works best for studying ${topic}?`,
                options: [
                  'Cramming before tests',
                  'Consistent practice with understanding',
                  'Only doing homework',
                  'Reading without practice'
                ],
                correctAnswer: 1,
                explanation: 'Consistent practice with understanding leads to better long-term retention.'
              }
            ]
          }
        ]
      }
    }
  }

  const revisionContent = getRevisionContent()
  const currentStepData = revisionContent.steps[currentStep]
  const currentQuestionData = currentStepData.questions[currentQuestion]
  const totalQuestionsInStep = currentStepData.questions.length
  const overallProgress = ((currentStep * 3) + currentQuestion + 1) / (revisionContent.steps.length * 3) * 100

  const handleStartRevision = () => {
    setRevisionStarted(true)
    setCurrentStep(0)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setAnsweredCorrectly(null)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    const currentQuestionData = currentStepData.questions[currentQuestion]
    const isCorrect = answerIndex === currentQuestionData.correctAnswer
    setAnsweredCorrectly(isCorrect)
    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    const totalQuestions = currentStepData.questions.length
    if (currentQuestion < totalQuestions - 1) {
      // Move to next question in current step
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setAnsweredCorrectly(null)
    } else {
      // Move to next step or complete revision
      if (currentStep < revisionContent.steps.length - 1) {
        setCurrentStep(currentStep + 1)
        setCurrentQuestion(0)
        setSelectedAnswer(null)
        setShowExplanation(false)
        setAnsweredCorrectly(null)
      } else {
        // Revision complete
        navigate('/student-dashboard')
      }
    }
  }

  const handleBackToDashboard = () => {
    navigate('/student-dashboard')
  }

  if (!revisionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📚</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Revision Session</h1>
              <p className="text-gray-600">
                {revisionContent.subject}: {revisionContent.topic}
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">🎯 Revision Focus Areas</h3>
              <ul className="space-y-2">
                {revisionContent.weakAreas.map((area, index) => (
                  <li key={index} className="flex items-center text-blue-700">
                    <span className="mr-2">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-green-800 mb-3">💪 What We'll Cover</h3>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Quick recap of key concepts</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Focus on your weak areas</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Practice questions with explanations</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Build confidence step by step</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleStartRevision}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Start Revision
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                📚 Revision Session: {revisionContent.topic}
              </h1>
              <p className="text-gray-600">
                Step {currentStep + 1} of {revisionContent.steps.length} - Question {currentQuestion + 1} of {totalQuestionsInStep}
              </p>
            </div>
            <button
              onClick={handleBackToDashboard}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-all"
            >
              Back to Dashboard
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / revisionContent.steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step Title */}
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            {currentStepData.title}
          </h2>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed mb-4">
              {currentStepData.content}
            </p>
            
            {/* Examples */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">💡 Examples:</h3>
              <ul className="space-y-2">
                {currentStepData.examples.map((example, index) => (
                  <li key={index} className="text-blue-700">
                    <span className="mr-2">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Practice Question */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-4">
              🤔 Practice Question {currentQuestion + 1} of {totalQuestionsInStep}:
            </h3>
            <p className="text-gray-800 font-medium mb-4">
              {currentQuestionData.question}
            </p>
            
            {/* Answer Options */}
            <div className="space-y-3 mb-4">
              {currentQuestionData.options.map((option: string, index: number) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    showExplanation
                      ? index === currentQuestionData.correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : selectedAnswer === index
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 bg-gray-50'
                      : selectedAnswer === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400 bg-white'
                  }`}
                >
                  <span className="font-medium">
                    {String.fromCharCode(65 + index)}. {option}
                  </span>
                </button>
              ))}
            </div>

            {/* Explanation */}
            {showExplanation && (
              <div className={`p-4 rounded-lg ${
                answeredCorrectly 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-start space-x-2">
                  <span className="text-2xl">
                    {answeredCorrectly ? '✅' : '💡'}
                  </span>
                  <div>
                    <p className={`font-semibold mb-2 ${
                      answeredCorrectly ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                      {answeredCorrectly 
                        ? 'Excellent! You got it right!' 
                        : 'Good try! Let me explain...'}
                    </p>
                    <p className={`text-sm ${
                      answeredCorrectly ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {currentQuestionData.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Button */}
            {showExplanation && (
              <div className="mt-6 flex justify-between items-center">
                <p className="text-gray-600 italic">
                  {answeredCorrectly 
                    ? "Great job! You're mastering this concept." 
                    : "That's okay! Learning takes practice."}
                </p>
                <button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  {currentQuestion < totalQuestionsInStep - 1 ? 'Next Question' : 
                   currentStep < revisionContent.steps.length - 1 ? 'Next Step' : 'Complete Revision'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Encouragement Message */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🌟</span>
            <div>
              <p className="font-semibold text-green-800">
                You're doing amazing!
              </p>
              <p className="text-green-700 text-sm">
                Every step forward is progress. Keep up the great work!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import '../styles/dashboard-theme.css'

interface GeneratedQuestion {
  question_number: number
  question_text: string
  options: string[]
  correct_answer: number
}

export default function AIRevisionPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const topic = searchParams.get('topic') || 'Mathematics'
  const subject = searchParams.get('subject') || 'Mathematics'
  
  const [currentQuestion, setCurrentQuestion] = useState<GeneratedQuestion | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [results, setResults] = useState<{ correct: number; wrong: number } | null>(null)
  
  const engineRef = useRef<any>(null)

  const generateQuestion = async (questionNumber: number, previousStatus: 'correct' | 'wrong' | null) => {
    if (questionNumber > 20) {
      // Session complete
      setSessionComplete(true)
      setResults({ correct: correctCount, wrong: wrongCount })
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/revision/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          topic,
          question_number: questionNumber,
          previous_answer_status: previousStatus
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate question')
      }

      const question = await response.json()
      setCurrentQuestion(question)
    } catch (error) {
      console.error('Error generating question:', error)
      // Fallback to mock question
      const fallbackQuestion = generateFallbackQuestion(questionNumber)
      setCurrentQuestion(fallbackQuestion)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFallbackQuestion = (questionNumber: number): GeneratedQuestion => {
    // Generate 20 unique fallback questions for each topic
    const geometryQuestions = [
      {
        question_number: questionNumber,
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
        question_number: questionNumber,
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
        question_number: questionNumber,
        question_text: "What does 'congruent' mean in geometry?",
        options: [
          "Having the same size and shape",
          "Being parallel to each other",
          "Adding up to 180 degrees",
          "Forming a right angle"
        ],
        correct_answer: 0
      },
      {
        question_number: questionNumber,
        question_text: "If two lines are parallel, which must be true?",
        options: [
          "They intersect at 90 degrees",
          "They never intersect",
          "They form a triangle",
          "They are perpendicular"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "What is the sum of angles in any triangle?",
        options: ["90°", "180°", "270°", "360°"],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "Which statement best describes vertical angles?",
        options: [
          "They are always congruent",
          "They add up to 180 degrees",
          "They are always supplementary",
          "They form a straight line"
        ],
        correct_answer: 0
      },
      {
        question_number: questionNumber,
        question_text: "What happens when a transversal cuts parallel lines?",
        options: [
          "All angles become right angles",
          "Corresponding angles are equal",
          "The lines become perpendicular",
          "No special relationship exists"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "What is the difference between a theorem and a postulate?",
        options: [
          "A theorem is shorter",
          "A theorem must be proven, a postulate is accepted",
          "A postulate is more important",
          "There is no difference"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "Which of the following is a valid geometric proof method?",
        options: [
          "Guessing the answer",
          "Logical deduction from known facts",
          "Using a calculator",
          "Drawing pictures only"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "What does 'Q.E.D.' stand for in geometry proofs?",
        options: [
          "Quite Easily Done",
          "Question Every Detail", 
          "Quod erat demonstrandum",
          "Quick Explanation Done"
        ],
        correct_answer: 2
      },
      {
        question_number: questionNumber,
        question_text: "If angle A = 30° and angle B = 60°, and they are complementary, what is their relationship?",
        options: [
          "They add up to 90°",
          "They add up to 180°",
          "They are equal",
          "They are supplementary"
        ],
        correct_answer: 0
      },
      {
        question_number: questionNumber,
        question_text: "What is a 'corresponding angle'?",
        options: [
          "An angle that matches another angle",
          "An angle that is always 90°",
          "An angle that adds to 180°",
          "An angle that is vertical"
        ],
        correct_answer: 0
      },
      {
        question_number: questionNumber,
        question_text: "Which of these is NOT a type of angle pair?",
        options: [
          "Vertical angles",
          "Corresponding angles", 
          "Parallel angles",
          "Alternate interior angles"
        ],
        correct_answer: 2
      },
      {
        question_number: questionNumber,
        question_text: "What is the first step in writing a geometric proof?",
        options: [
          "Write the conclusion",
          "State what is given",
          "Draw a diagram",
          "Check the answer"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "If two triangles have three equal sides, they are:",
        options: [
          "Similar but not congruent",
          "Congruent",
          "Neither similar nor congruent",
          "Right triangles"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "What is a 'transversal' line?",
        options: [
          "A line that is parallel to others",
          "A line that intersects two or more lines",
          "A vertical line",
          "A horizontal line"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "Which statement is always true about parallel lines?",
        options: [
          "They are always horizontal",
          "They are always the same length",
          "They never intersect",
          "They are always vertical"
        ],
        correct_answer: 2
      },
      {
        question_number: questionNumber,
        question_text: "What is the 'reflexive property' in geometry?",
        options: [
          "Any shape equals itself",
          "Shapes can be reflected",
          "Angles can be measured",
          "Lines can be extended"
        ],
        correct_answer: 0
      },
      {
        question_number: questionNumber,
        question_text: "If two angles form a linear pair, what is their sum?",
        options: ["90°", "180°", "270°", "360°"],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "What is the purpose of a 'proof' in geometry?",
        options: [
          "To make problems harder",
          "To show something is true using logic",
          "To memorize facts",
          "To draw pictures"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "Which of these is a fundamental postulate of geometry?",
        options: [
          "All angles are equal",
          "Through any two points, there is exactly one line",
          "All triangles are congruent",
          "All lines are parallel"
        ],
        correct_answer: 1
      }
    ]

    const algebraQuestions = [
      {
        question_number: questionNumber,
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
        question_number: questionNumber,
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
        question_number: questionNumber,
        question_text: "Solve for x: 4x - 7 = 13",
        options: ["x = 3", "x = 5", "x = 7", "x = 9"],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "What is the golden rule of algebra?",
        options: [
          "Always use the same operation",
          "Whatever you do to one side, do to the other",
          "Variables must come first",
          "Numbers are more important"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "If 3x = 12, what is x?",
        options: ["x = 3", "x = 4", "x = 6", "x = 9"],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "What is a 'coefficient'?",
        options: [
          "The variable part",
          "The numerical factor",
          "The exponent",
          "The result"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "Which property allows you to rearrange addition terms?",
        options: [
          "Associative property",
          "Commutative property",
          "Distributive property",
          "Identity property"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "What are 'like terms'?",
        options: [
          "Terms that look similar",
          "Terms with same variables and powers",
          "Terms that are easy",
          "Terms that come first"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "Simplify: 2x + 3x",
        options: ["5x", "6x", "2x²", "3x²"],
        correct_answer: 0
      },
      {
        question_number: questionNumber,
        question_text: "What is the distributive property?",
        options: [
          "a(b + c) = ab + ac",
          "a + b = b + a",
          "(ab)c = a(bc)",
          "a + 0 = a"
        ],
        correct_answer: 0
      },
      {
        question_number: questionNumber,
        question_text: "If x + 5 = 12, what is x?",
        options: ["x = 5", "x = 7", "x = 17", "x = 19"],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "What is an 'expression' in algebra?",
        options: [
          "Something with an equals sign",
          "A combination of numbers and variables",
          "Only numbers",
          "Only variables"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "Factor: x² - 9",
        options: ["(x + 3)(x - 3)", "(x - 3)²", "(x + 9)", "x(x - 9)"],
        correct_answer: 0
      },
      {
        question_number: questionNumber,
        question_text: "What does 'isolate the variable' mean?",
        options: [
          "Get the variable by itself",
          "Hide the variable",
          "Remove the variable",
          "Change the variable"
        ],
        correct_answer: 0
      },
      {
        question_number: questionNumber,
        question_text: "Solve: 2(x + 4) = 20",
        options: ["x = 6", "x = 8", "x = 10", "x = 12"],
        correct_answer: 0
      },
      {
        question_number: questionNumber,
        question_text: "What is the identity property of addition?",
        options: [
          "a + 0 = a",
          "a + b = b + a",
          "a + (-a) = 0",
          "a + a = 2a"
        ],
        correct_answer: 0
      },
      {
        question_number: questionNumber,
        question_text: "Combine like terms: 3x + 2y - x + 4y",
        options: ["2x + 6y", "4x + 6y", "2x + 2y", "4x + 2y"],
        correct_answer: 0
      },
      {
        question_number: questionNumber,
        question_text: "What is a 'linear equation'?",
        options: [
          "An equation with curves",
          "An equation with variables to the power of 1",
          "An equation with squares",
          "An equation with cubes"
        ],
        correct_answer: 1
      },
      {
        question_number: questionNumber,
        question_text: "Solve: 5x - 3 = 2x + 9",
        options: ["x = 2", "x = 3", "x = 4", "x = 5"],
        correct_answer: 2
      },
      {
        question_number: questionNumber,
        question_text: "What is the 'order of operations'?",
        options: [
          "PEMDAS/BODMAS rules",
          "Random operations",
          "Only addition",
          "Only multiplication"
        ],
        correct_answer: 0
      },
      {
        question_number: questionNumber,
        question_text: "If y = 2x + 1 and x = 3, what is y?",
        options: ["y = 5", "y = 6", "y = 7", "y = 8"],
        correct_answer: 2
      }
    ]

    let questionBank = geometryQuestions
    if (topic.includes('Algebra')) {
      questionBank = algebraQuestions
    }

    // Return the question for the current number (1-20)
    return questionBank[questionNumber - 1] || questionBank[0]
  }

  const startSession = () => {
    setSessionStarted(true)
    setCurrentQuestion(null)
    setCorrectCount(0)
    setWrongCount(0)
    setSessionComplete(false)
    setResults(null)
    generateQuestion(1, null)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (!currentQuestion || showResult) return

    setSelectedAnswer(answerIndex)
    const isCorrect = answerIndex === currentQuestion.correct_answer
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
    } else {
      setWrongCount(prev => prev + 1)
    }

    setShowResult(true)
  }

  const handleNextQuestion = () => {
    if (!currentQuestion) return

    const isCorrect = selectedAnswer === currentQuestion.correct_answer
    const nextQuestionNumber = currentQuestion.question_number + 1

    setSelectedAnswer(null)
    setShowResult(false)

    if (nextQuestionNumber <= 20) {
      generateQuestion(nextQuestionNumber, isCorrect ? 'correct' : 'wrong')
    } else {
      // Session complete
      setSessionComplete(true)
      setResults({ correct: correctCount, wrong: wrongCount })
    }
  }

  const handleBackToDashboard = () => {
    navigate('/student-dashboard')
  }

  if (!sessionStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🤖</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Revision Session</h1>
              <p className="text-gray-600">
                {subject}: {topic}
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">🎯 Session Details</h3>
              <ul className="space-y-2 text-blue-700">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>20 AI-generated questions</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Questions generated one by one</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Gradually increasing difficulty</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Personalized to your performance</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-green-800 mb-3">💪 How It Works</h3>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>AI generates question based on your topic</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>You answer the question</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>AI adapts next question based on your answer</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  <span>Continue until all 20 questions are complete</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startSession}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Start AI Revision
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

  if (sessionComplete && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Session Complete!</h1>
              <p className="text-gray-600">
                Great job completing the AI Revision Session
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-green-800 mb-4">📊 Your Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{results.correct}</div>
                  <div className="text-sm text-green-700">Correct Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{results.wrong}</div>
                  <div className="text-sm text-orange-700">Wrong Answers</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round((results.correct / 20) * 100)}%
                </div>
                <div className="text-sm text-blue-700">Accuracy</div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">🌟 Encouragement</h3>
              <p className="text-blue-700">
                {results.correct >= 15 
                  ? "Outstanding performance! You've mastered this topic!"
                  : results.correct >= 10
                  ? "Great job! Keep practicing to improve further."
                  : "Good effort! Review the concepts and try again."}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={startSession}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Try Again
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
                🤖 AI Revision Session: {topic}
              </h1>
              <p className="text-gray-600">
                Question {currentQuestion?.question_number || 1} of 20
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
                style={{ width: `${((currentQuestion?.question_number || 1) / 20) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question */}
        {isGenerating ? (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <div className="text-lg text-gray-600">AI is generating your question...</div>
            </div>
          </div>
        ) : currentQuestion && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Question {currentQuestion.question_number}:
              </h2>
              <p className="text-lg text-gray-700">
                {currentQuestion.question_text}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    showResult
                      ? index === currentQuestion.correct_answer
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

            {/* Result */}
            {showResult && (
              <div className={`p-4 rounded-lg mb-6 ${
                selectedAnswer === currentQuestion.correct_answer
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start space-x-2">
                  <span className="text-2xl">
                    {selectedAnswer === currentQuestion.correct_answer ? '✅' : '❌'}
                  </span>
                  <div>
                    <p className={`font-semibold mb-2 ${
                      selectedAnswer === currentQuestion.correct_answer ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {selectedAnswer === currentQuestion.correct_answer 
                        ? 'Correct! Well done!' 
                        : 'Not quite right. Keep learning!'}
                    </p>
                    <p className={`text-sm ${
                      selectedAnswer === currentQuestion.correct_answer ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {selectedAnswer === currentQuestion.correct_answer 
                        ? "Great job! You're understanding this concept well."
                        : `The correct answer was ${String.fromCharCode(65 + currentQuestion.correct_answer)}. ${currentQuestion.options[currentQuestion.correct_answer]}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Button */}
            {showResult && (
              <div className="flex justify-between items-center">
                <p className="text-gray-600 italic">
                  Score: {correctCount} correct, {wrongCount} wrong
                </p>
                <button
                  onClick={handleNextQuestion}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                >
                  {currentQuestion.question_number < 20 ? 'Next Question' : 'Complete Session'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

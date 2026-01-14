import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import '../styles/dashboard-theme.css'

interface LearningContent {
  level: string
  subject: string
  topic: string
  weakAreas: string[]
  steps: LearningStep[]
}

interface LearningStep {
  id: number
  title: string
  content: string
  examples: string[]
  practiceQuestions: PracticeQuestion[]
}

interface PracticeQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export default function AILearningPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const topic = searchParams.get('topic') || 'Geometry Proofs'
  const subject = searchParams.get('subject') || 'Mathematics'
  const level = searchParams.get('level') || 'intermediate'
  const weakAreas = searchParams.get('weakAreas')?.split(',') || ['proof structure', 'logical reasoning']
  
  console.log('AILearningPage loaded with params:', { topic, subject, level, weakAreas })
  console.log('🎯 AILearningPage component mounted successfully!')
  
  const [currentStep, setCurrentStep] = useState(0)
  const [learningStarted, setLearningStarted] = useState(false)
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: number}>({})
  const [showResults, setShowResults] = useState(false)

  const getLearningContent = (): LearningContent => {
    if (topic.includes('Geometry') || topic.includes('Proofs')) {
      return {
        level,
        subject,
        topic,
        weakAreas,
        steps: [
          {
            id: 1,
            title: "Introduction to Geometry Proofs",
            content: `Geometry proofs are logical arguments that use established facts to show that new statements are true. Think of a proof as a step-by-step explanation that convinces everyone that something must be true.\n\nIn geometry, we use proofs to demonstrate relationships between shapes, angles, and lines. Every proof follows strict logical rules and builds upon previously proven facts.\n\nThe most important thing to remember is that a proof is like building a case - each step must be justified and logical.`,
            examples: [
              "Example: If we know that all right angles measure 90 degrees, and we have two right angles, we can prove they are congruent.",
              "Example: When proving triangles are congruent, we might use the fact that all triangles have angles that sum to 180 degrees."
            ],
            practiceQuestions: [
              {
                question: "What is the main purpose of a geometric proof?",
                options: [
                  "To show that a statement is true using logic",
                  "To make problems more difficult",
                  "To memorize formulas",
                  "To draw pictures"
                ],
                correctAnswer: 0,
                explanation: "The main purpose of a geometric proof is to demonstrate that a statement is true by using logical reasoning and established facts."
              }
            ]
          },
          {
            id: 2,
            title: "Key Concepts: Postulates and Theorems",
            content: `In geometry, we work with two types of statements: postulates and theorems.\n\nPostulates are statements that we accept as true without proof. They are the basic building blocks of geometry. Think of postulates as the rules we start with.\n\nTheorems are statements that we prove using postulates and other theorems. Once we prove a theorem, we can use it in future proofs.\n\nThe difference is important: postulates are starting points, theorems are results we discover through logical reasoning.`,
            examples: [
              "Postulate Example: Through any two points, there is exactly one straight line. (We accept this as true)",
              "Theorem Example: The sum of angles in any triangle is 180 degrees. (We prove this using logic)"
            ],
            practiceQuestions: [
              {
                question: "What is the difference between a postulate and a theorem?",
                options: [
                  "A postulate is proven, a theorem is accepted",
                  "A postulate is accepted without proof, a theorem is proven",
                  "They are the same thing",
                  "A theorem is more important than a postulate"
                ],
                correctAnswer: 1,
                explanation: "A postulate is accepted as true without proof, while a theorem must be proven using logical reasoning."
              }
            ]
          },
          {
            id: 3,
            title: "Proof Structure and Logic",
            content: `Every geometric proof follows a logical structure. Understanding this structure makes proofs much easier to write and read.\n\nThe basic structure of a proof includes:\n\n1. Given Information: What we know at the start\n2. To Prove: What we want to show\n3. Proof Steps: Logical statements that connect the given information to what we want to prove\n4. Conclusion: What we have proven\n\nEach step in a proof must be justified by a definition, postulate, theorem, or a previous step in the proof.`,
            examples: [
              "Example Proof Structure:\nGiven: Triangle ABC with AB = AC\nTo Prove: Angle B = Angle C\nProof: \n  Step 1: In triangle ABC, sides AB and AC are equal (Given)\n  Step 2: In an isosceles triangle, base angles are equal (Theorem)\n  Step 3: Therefore, angle B = angle C (From Step 1 and Step 2)\nConclusion: Angle B equals angle C"
            ],
            practiceQuestions: [
              {
                question: "What must every step in a geometric proof have?",
                options: [
                  "A picture or diagram",
                  "A justification (definition, postulate, theorem, or previous step)",
                  "A calculation",
                  "An equation"
                ],
                correctAnswer: 1,
                explanation: "Every step in a geometric proof must be justified by a definition, postulate, theorem, or a previous step in the proof."
              }
            ]
          },
          {
            id: 4,
            title: "Common Proof Methods",
            content: `There are several common methods used in geometric proofs. Understanding these methods will help you approach different types of problems.\n\n1. Direct Proof: Start with given information and use logical steps to reach the conclusion\n\n2. Proof by Contradiction: Assume the opposite of what you want to prove, then show this leads to a contradiction\n\n3. Proof by Induction: Prove something for a base case, then show if it's true for one case, it's true for the next\n\n4. Proof by Cases: Break the problem into different cases and prove each one separately`,
            examples: [
              "Direct Proof Example: To prove two angles are equal, show they are both 90 degrees using given information.",
              "Proof by Contradiction Example: To prove a line is not parallel to another, assume it is parallel and show this leads to an impossible situation."
            ],
            practiceQuestions: [
              {
                question: "Which proof method assumes the opposite of what you want to prove?",
                options: [
                  "Direct proof",
                  "Proof by contradiction",
                  "Proof by induction",
                  "Proof by cases"
                ],
                correctAnswer: 1,
                explanation: "Proof by contradiction assumes the opposite of what you want to prove and shows this leads to an impossible situation."
              }
            ]
          },
          {
            id: 5,
            title: "Practice Exercises",
            content: `Now let's practice what we've learned about geometry proofs. Remember to follow the logical structure and justify each step.\n\nWhen working on proofs, always:\n- Start with what you know (Given)\n- Clearly state what you want to prove\n- Use logical steps with justifications\n- End with a clear conclusion\n\nTake your time and think through each step logically.`,
            examples: [
              "Practice Problem: Prove that vertical angles are equal.\nSolution:\nGiven: Two intersecting lines form vertical angles\nTo Prove: The vertical angles are equal\nProof:\n  Step 1: When two lines intersect, they form two pairs of opposite angles (Definition)\n  Step 2: All straight angles measure 180 degrees (Postulate)\n  Step 3: Each pair of vertical angles forms a straight angle (From Step 1)\n  Step 4: Therefore, each pair of vertical angles must sum to 180 degrees (From Step 2 and Step 3)\n  Step 5: Since both angles in each pair sum to 180 degrees and they are opposite, they must be equal (Logic)\nConclusion: Vertical angles are equal"
            ],
            practiceQuestions: [
              {
                question: "What should be the first step in any geometric proof?",
                options: [
                  "Write the conclusion",
                  "State what is given",
                  "Draw a picture",
                  "Calculate something"
                ],
                correctAnswer: 1,
                explanation: "The first step in any geometric proof should be to clearly state what information is given."
              }
            ]
          },
          {
            id: 6,
            title: "Knowledge Check and Encouragement",
            content: `Great job! You've learned the fundamentals of geometry proofs. Let's check your understanding and then celebrate your progress.\n\nKey Takeaways:\n- Proofs use logical reasoning to show statements are true\n- Postulates are accepted without proof, theorems are proven\n- Every proof step needs justification\n- Different proof methods work for different types of problems\n- Structure and clarity are essential in proofs\n\nRemember: Learning proofs takes practice. Don't worry if you don't understand everything immediately. With each proof you write, you'll get better at thinking logically and clearly.`,
            examples: [
              "Remember: A good proof is like a clear story - it has a beginning (given information), middle (logical steps), and end (conclusion).",
              "Tip: When you're stuck on a proof, ask yourself: 'What do I know?' and 'What do I need to show?'"
            ],
            practiceQuestions: [
              {
                question: "Which statement best describes a well-written geometric proof?",
                options: [
                  "It has many complicated steps",
                  "It uses clear logic and justifications",
                  "It has pictures and diagrams",
                  "It is very short"
                ],
                correctAnswer: 1,
                explanation: "A well-written geometric proof uses clear logic and justifications for each step, making it easy for others to follow your reasoning."
              }
            ]
          }
        ]
      }
    } else if (topic.includes('Algebra')) {
      return {
        level,
        subject,
        topic,
        weakAreas,
        steps: [
          {
            id: 1,
            title: "Introduction to Algebra",
            content: `Algebra is a branch of mathematics that uses letters and symbols to represent numbers and quantities. Think of algebra as a tool that helps us solve problems when we don't know all the numbers.\n\nIn algebra, we work with variables, expressions, and equations. Variables are letters that stand for unknown values. Expressions are combinations of numbers and variables. Equations are statements that two expressions are equal.\n\nThe beauty of algebra is that it gives us a systematic way to find unknown values and solve real-world problems.`,
            examples: [
              "Example: If x + 5 = 12, we can find that x = 7 by subtracting 5 from both sides.",
              "Example: In the expression 2x + 3, if x = 4, the expression equals 2(4) + 3 = 11."
            ],
            practiceQuestions: [
              {
                question: "What is a variable in algebra?",
                options: [
                  "A fixed number",
                  "A letter that represents an unknown value",
                  "An operation like addition",
                  "A type of equation"
                ],
                correctAnswer: 1,
                explanation: "A variable is a letter that represents an unknown value in algebra."
              }
            ]
          }
        ]
      }
    } else {
      return {
        level,
        subject,
        topic,
        weakAreas,
        steps: [
          {
            id: 1,
            title: "Introduction to " + topic,
            content: `Welcome to learning about ${topic}! This is an important topic in ${subject} that will help you build strong foundational knowledge.\n\nWe'll start with the basics and gradually build up your understanding. Remember that learning takes time and practice, so be patient with yourself.\n\nFocus on understanding the concepts rather than just memorizing facts. When you understand why something works, you'll be able to use it in many different situations.`,
            examples: [
              "Example: We'll start with simple concepts and build up to more complex ones.",
              "Example: Each step will build on what you learned in the previous step."
            ],
            practiceQuestions: [
              {
                question: "What is the best way to learn " + topic + "?",
                options: [
                  "Memorize everything quickly",
                  "Focus on understanding concepts",
                  "Skip the basics",
                  "Only do practice problems"
                ],
                correctAnswer: 1,
                explanation: "The best way to learn is to focus on understanding concepts rather than just memorizing facts."
              }
            ]
          }
        ]
      }
    }
  }

  const learningContent = getLearningContent()
  
  console.log('📚 Learning content generated:', learningContent.topic, 'with', learningContent.steps.length, 'steps')

  const handleStartLearning = () => {
    console.log('🚀 START LEARNING BUTTON CLICKED!')
    setLearningStarted(true)
    setCurrentStep(0)
    setSelectedAnswers({})
    setShowResults(false)
    console.log('📚 Learning session started!')
  }

  const handleAnswerSelect = (stepId: number, questionIndex: number, answerIndex: number) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [`${stepId}-${questionIndex}`]: answerIndex
    })
  }

  const handleNextStep = () => {
    if (currentStep < learningContent.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setShowResults(true)
    }
  }

  const handleBackToDashboard = () => {
    navigate('/student-dashboard')
  }

  const calculateScore = () => {
    let correct = 0
    let total = 0
    
    learningContent.steps.forEach(step => {
      step.practiceQuestions.forEach((question, index) => {
        total++
        if (selectedAnswers[`${step.id}-${index}`] === question.correctAnswer) {
          correct++
        }
      })
    })
    
    return { correct, total, percentage: Math.round((correct / total) * 100) }
  }

  if (!learningStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📚</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">AI Learning Mode</h1>
              <p className="text-gray-600">
                {subject}: {topic}
              </p>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">📖 Learning Context</h3>
              <div className="space-y-2 text-blue-700">
                <p><strong>Student Level:</strong> {level}</p>
                <p><strong>Subject:</strong> {subject}</p>
                <p><strong>Topic:</strong> {topic}</p>
                <p><strong>Focus Areas:</strong> {weakAreas.join(', ')}</p>
              </div>
            </div>

            <div className="bg-green-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-green-800 mb-3">🎯 Learning Objectives</h3>
              <ul className="space-y-2 text-green-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Understand fundamental concepts</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Learn with clear examples</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Practice with guided exercises</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Build confidence</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Help overcome weak areas</span>
                </li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-purple-800 mb-3">📝 Teaching Method</h3>
              <ul className="space-y-2 text-purple-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Step-by-step text explanations</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>PDF-style notes format</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Focus on weak areas</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Easy language for your level</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Practice questions with explanations</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleStartLearning}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Start Learning
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

  if (showResults) {
    const score = calculateScore()
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Learning Complete!</h1>
              <p className="text-gray-600">
                Great job completing the {topic} lesson
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-green-800 mb-4">📊 Your Results</h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-green-600">{score.percentage}%</div>
                <div className="text-sm text-green-700">Overall Score</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{score.correct}</div>
                  <div className="text-sm text-green-700">Correct Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{score.total - score.correct}</div>
                  <div className="text-sm text-orange-700">Incorrect Answers</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-800 mb-3">🌟 Encouragement</h3>
              <p className="text-blue-700">
                {score.percentage >= 80 
                  ? "Outstanding work! You've mastered this topic."
                  : score.percentage >= 60
                  ? "Great job! You have a good understanding of this topic."
                  : "Good effort! Review the concepts and try again to improve your understanding."}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleStartLearning}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                Review Lesson
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

  const currentStepData = learningContent.steps[currentStep]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                📚 AI Learning Mode: {topic}
              </h1>
              <p className="text-gray-600">
                Step {currentStep + 1} of {learningContent.steps.length}
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
                style={{ width: `${((currentStep + 1) / learningContent.steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Learning Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Step Title */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">
            {currentStepData.title}
          </h2>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-8">
            {currentStepData.content.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-gray-700 leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Examples */}
          <div className="bg-blue-50 p-6 rounded-lg mb-8">
            <h3 className="font-semibold text-blue-800 mb-4">📝 Examples:</h3>
            <div className="space-y-4">
              {currentStepData.examples.map((example, index) => (
                <div key={index} className="text-blue-700">
                  <p className="font-medium">Example {index + 1}:</p>
                  <p className="text-sm">{example}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Practice Questions */}
          <div className="bg-purple-50 p-6 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-4">🤔 Practice Questions:</h3>
            <div className="space-y-6">
              {currentStepData.practiceQuestions.map((question, qIndex) => (
                <div key={qIndex} className="border-l-4 border-purple-300 pl-4">
                  <p className="font-medium text-gray-800 mb-3">
                    {question.question}
                  </p>
                  
                  <div className="space-y-2">
                    {question.options.map((option, oIndex) => (
                      <button
                        key={oIndex}
                        onClick={() => handleAnswerSelect(currentStepData.id, qIndex, oIndex)}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedAnswers[`${currentStepData.id}-${qIndex}`] === oIndex
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-300 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <span className="font-medium">
                          {String.fromCharCode(65 + oIndex)}. {option}
                        </span>
                      </button>
                    ))}
                  </div>

                  {selectedAnswers[`${currentStepData.id}-${qIndex}`] !== undefined && (
                    <div className={`mt-3 p-3 rounded-lg ${
                      selectedAnswers[`${currentStepData.id}-${qIndex}`] === question.correctAnswer
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`font-semibold mb-2 ${
                        selectedAnswers[`${currentStepData.id}-${qIndex}`] === question.correctAnswer
                          ? 'text-green-800'
                          : 'text-red-800'
                      }`}>
                        {selectedAnswers[`${currentStepData.id}-${qIndex}`] === question.correctAnswer
                          ? '✅ Correct!'
                          : '❌ Not quite right'}
                      </p>
                      <p className={`text-sm ${
                        selectedAnswers[`${currentStepData.id}-${qIndex}`] === question.correctAnswer
                          ? 'text-green-700'
                          : 'text-red-700'
                      }`}>
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 flex justify-between items-center">
            <p className="text-gray-600 italic">
              {currentStep < learningContent.steps.length - 1 
                ? "Take your time to understand each concept before moving on."
                : "You've completed all steps! Check your results above."}
            </p>
            <button
              onClick={handleNextStep}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              {currentStep < learningContent.steps.length - 1 ? 'Next Step' : 'Complete Learning'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

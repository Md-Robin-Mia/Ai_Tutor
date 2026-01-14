import { useEffect } from 'react'

interface Question {
  id: number
  text: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'definition' | 'concept' | 'reasoning' | 'mistake'
}

interface QuestionGeneratorProps {
  subject: string
  topic: string
  level: string
  onQuestionsGenerated: (questions: Question[]) => void
}

const getRandomCategory = (): 'definition' | 'concept' | 'reasoning' | 'mistake' => {
  const categories: ('definition' | 'concept' | 'reasoning' | 'mistake')[] = ['definition', 'concept', 'reasoning', 'mistake']
  return categories[Math.floor(Math.random() * categories.length)]
}

const generateDefaultOptions = (template: string, subject: string, topic: string): string[] => {
  // Generate plausible distractor options
  return [
    "Option A: Incorrect choice",
    "Option B: Another incorrect choice", 
    "Option C: Third incorrect choice",
    "Option D: Correct answer"
  ]
}

const getQuestionBank = (subject: string, topic: string, level: string) => {
    // Geometry-specific questions
    if (topic.includes('Geometry') || topic.includes('Proofs')) {
      return {
        definition: {
          easy: [
            { template: "What is the definition of a 'postulate' in geometry?", answer: 1, explanation: "A postulate is a statement accepted as true without proof, serving as a foundation for geometric reasoning." },
            { template: "Which term describes two angles that add up to 90 degrees?", answer: 2, explanation: "Complementary angles are two angles whose measures add up to exactly 90 degrees." },
            { template: "What does 'congruent' mean in geometry?", answer: 0, explanation: "Congruent means having the same size and shape - identical in every way." }
          ],
          medium: [
            { template: "Which of the following is NOT a characteristic of a valid geometric proof?", answer: 3, explanation: "A valid proof must be logical, step-by-step, and justified - it cannot skip logical steps." },
            { template: "What is the difference between a theorem and a postulate?", answer: 1, explanation: "A theorem must be proven using logical reasoning, while a postulate is accepted without proof." }
          ],
          hard: [
            { template: "In geometric proofs, what does 'Q.E.D.' stand for?", answer: 2, explanation: "Q.E.D. stands for 'quod erat demonstrandum' (Latin for 'which was to be demonstrated')." }
          ]
        },
        concept: {
          easy: [
            { template: "If two lines are parallel, which of the following must be true?", answer: 1, explanation: "Parallel lines never intersect and are always the same distance apart." },
            { template: "What is the sum of angles in any triangle?", answer: 3, explanation: "The sum of interior angles in any triangle is always 180 degrees." }
          ],
          medium: [
            { template: "Which statement best describes the relationship between vertical angles?", answer: 0, explanation: "Vertical angles are always congruent (equal) when two lines intersect." },
            { template: "What happens when a transversal cuts through parallel lines?", answer: 2, explanation: "Corresponding angles are formed and are equal when a transversal cuts parallel lines." }
          ],
          hard: [
            { template: "In an indirect proof, what do you assume to begin?", answer: 3, explanation: "In indirect proof (proof by contradiction), you assume the opposite of what you want to prove." }
          ]
        },
        reasoning: {
          easy: [
            { template: "If angle A = 45° and angle B = 45°, what can you conclude?", answer: 2, explanation: "If two angles have the same measure, they are congruent." }
          ],
          medium: [
            { template: "Given: Lines l and m are parallel. If angle 1 = 60°, what is angle 2 (corresponding angle)?", answer: 0, explanation: "Corresponding angles are equal when lines are parallel, so angle 2 = 60°." }
          ],
          hard: [
            { template: "If two angles are supplementary and equal, what must each angle measure?", answer: 1, explanation: "Supplementary angles sum to 180°. If they're equal: 180° ÷ 2 = 90°, so each is 90°." }
          ]
        },
        mistake: {
          easy: [
            { template: "Which common mistake do students make with vertical angles?", answer: 2, explanation: "Students often think vertical angles add to 180°, but they're actually equal." }
          ],
          medium: [
            { template: "What is a common error when proving triangle congruence?", answer: 3, explanation: "Students often assume congruence without sufficient evidence like SAS, ASA, or SSS." }
          ],
          hard: [
            { template: "Which logical fallacy occurs in invalid geometric proofs?", answer: 1, explanation: "Circular reasoning occurs when the conclusion is used to prove itself." }
          ]
        }
      }
    }
    
    // Algebra-specific questions
    else if (topic.includes('Algebra')) {
      return {
        definition: {
          easy: [
            { template: "What is a 'variable' in algebra?", answer: 1, explanation: "A variable is a symbol (usually a letter) that represents an unknown or changing quantity." },
            { template: "What does 'solve an equation' mean?", answer: 2, explanation: "Solving an equation means finding the value(s) of the variable that make the equation true." }
          ],
          medium: [
            { template: "What is the difference between an expression and an equation?", answer: 0, explanation: "An expression has no equals sign, while an equation has an equals sign and shows equality." }
          ],
          hard: [
            { template: "What is a 'coefficient' in an algebraic term?", answer: 3, explanation: "A coefficient is the numerical factor multiplied by the variable in a term." }
          ]
        },
        concept: {
          easy: [
            { template: "What is the golden rule of algebra?", answer: 2, explanation: "Whatever you do to one side of an equation, you must do to the other side to maintain balance." }
          ],
          medium: [
            { template: "Which property allows us to rearrange terms in addition?", answer: 1, explanation: "The commutative property of addition allows us to change the order of addends." }
          ],
          hard: [
            { template: "What does 'like terms' mean in algebra?", answer: 0, explanation: "Like terms have the same variables raised to the same powers, so they can be combined." }
          ]
        },
        reasoning: {
          easy: [
            { template: "If 3x = 12, what is x?", answer: 3, explanation: "Divide both sides by 3: x = 12 ÷ 3 = 4." }
          ],
          medium: [
            { template: "If 2x + 5 = 13, what is the first step to solve?", answer: 1, explanation: "First, subtract 5 from both sides to isolate the term with x." }
          ],
          hard: [
            { template: "If (x + 3)² = 25, what are the possible values of x?", answer: 2, explanation: "Take square root of both sides: x + 3 = ±5, so x = 2 or x = -8." }
          ]
        },
        mistake: {
          easy: [
            { template: "What is the most common mistake when solving 2(x + 3)?", answer: 3, explanation: "Students often forget to distribute to both terms inside parentheses." }
          ],
          medium: [
            { template: "Which error occurs when solving x/2 = 6?", answer: 0, explanation: "Students often multiply instead of divide, getting x = 12 instead of x = 12." }
          ],
          hard: [
            { template: "What mistake happens with negative signs in equations?", answer: 1, explanation: "Students often forget to change signs when moving terms across the equals sign." }
          ]
        }
      }
    }
    
    // General questions for other topics
    else {
      return {
        definition: {
          easy: [
            { template: "What is the most important concept to understand in {topic}?", answer: 1, explanation: "Understanding fundamental principles is more important than memorization for long-term success." },
            { template: "How would you define {topic} in simple terms?", answer: 2, explanation: "{topic} involves understanding core concepts and applying them systematically." }
          ],
          medium: [
            { template: "What distinguishes {topic} from similar subjects?", answer: 0, explanation: "{topic} has unique characteristics and methodologies that set it apart." }
          ],
          hard: [
            { template: "What is the etymological origin of key terms in {topic}?", answer: 3, explanation: "Understanding word origins helps deepen conceptual understanding." }
          ]
        },
        concept: {
          easy: [
            { template: "What is the fundamental principle of {topic}?", answer: 2, explanation: "The fundamental principle involves systematic thinking and logical progression." }
          ],
          medium: [
            { template: "How do different concepts in {topic} relate to each other?", answer: 1, explanation: "Concepts in {topic} are interconnected and build upon each other." }
          ],
          hard: [
            { template: "What underlying theory governs {topic}?", answer: 0, explanation: "The underlying theory provides the foundation for all practical applications." }
          ]
        },
        reasoning: {
          easy: [
            { template: "If you understand concept A in {topic}, what follows logically?", answer: 3, explanation: "Understanding fundamental concepts leads to logical progression in learning." }
          ],
          medium: [
            { template: "Given problem X in {topic}, what approach would you take?", answer: 2, explanation: "The systematic approach involves breaking down problems into manageable steps." }
          ],
          hard: [
            { template: "What conclusion can be drawn from premises A and B in {topic}?", answer: 1, explanation: "Logical deduction requires careful analysis of all given information." }
          ]
        },
        mistake: {
          easy: [
            { template: "What is the most common misconception about {topic}?", answer: 0, explanation: "Common misconceptions often stem from oversimplification or incomplete understanding." }
          ],
          medium: [
            { template: "Which error do students frequently make when applying {topic} concepts?", answer: 1, explanation: "Students often rush through problems without fully understanding the concepts." }
          ],
          hard: [
            { template: "What logical fallacy occurs in {topic} reasoning?", answer: 2, explanation: "Logical fallacies often result from making assumptions without sufficient evidence." }
          ]
        }
      }
    }
  }

  // Component function
  export default function QuestionGenerator({ subject, topic, level, onQuestionsGenerated }: QuestionGeneratorProps) {
    const generateQuestions = (): Question[] => {
      const questions: Question[] = []
      
      // Question templates and content based on subject and topic
      const questionBank = getQuestionBank(subject, topic, level)
      
      // Generate 20 unique questions
      for (let i = 0; i < 20; i++) {
        const category = getRandomCategory()
        const difficultyArray = questionBank[category][level as keyof typeof questionBank[typeof category]]
        const questionTemplate = difficultyArray[Math.floor(Math.random() * difficultyArray.length)]
        
        questions.push({
          id: i + 1,
          text: questionTemplate.template,
          options: generateDefaultOptions(questionTemplate.template, subject, topic),
          correctAnswer: questionTemplate.answer,
          explanation: questionTemplate.explanation,
          difficulty: level as 'easy' | 'medium' | 'hard',
          category
        })
      }
      
      return questions
    }

    // Generate questions when component mounts
    useEffect(() => {
      const questions = generateQuestions()
      onQuestionsGenerated(questions)
    }, [subject, topic, level])

    return null // This is a utility component, no UI needed
  }

// Utility function to generate questions on demand
export const generateRevisionQuestions = (subject: string, topic: string, level: string): Question[] => {
  // Direct question generation without component instantiation
  const questionBank = getQuestionBank(subject, topic, level)
  const questions: Question[] = []
  
  // Generate 20 unique questions
  for (let i = 0; i < 20; i++) {
    const category = getRandomCategory()
    const difficultyArray = questionBank[category][level as keyof typeof questionBank[typeof category]]
    const questionTemplate = difficultyArray[Math.floor(Math.random() * difficultyArray.length)]
    
    questions.push({
      id: i + 1,
      text: questionTemplate.template,
      options: generateDefaultOptions(questionTemplate.template, subject, topic),
      correctAnswer: questionTemplate.answer,
      explanation: questionTemplate.explanation,
      difficulty: level as 'easy' | 'medium' | 'hard',
      category
    })
  }
  
  return questions
}

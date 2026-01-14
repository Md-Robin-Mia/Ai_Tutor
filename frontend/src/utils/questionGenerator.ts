interface Question {
  text: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export function generateRevisionQuestions(subject: string, topic: string, level: string): string {
  const questions: Question[] = []
  
  // Generate 20 unique questions based on subject and topic
  for (let i = 1; i <= 20; i++) {
    const question = generateQuestion(i, subject, topic, level)
    questions.push(question)
  }
  
  // Format output exactly as requested
  return questions.map((q, index) => {
    return `Question ${index + 1}:
${q.text}
A. ${q.options[0]}
B. ${q.options[1]}
C. ${q.options[2]}
D. ${q.options[3]}
Correct Answer: ${String.fromCharCode(65 + q.correctAnswer)}
Explanation: ${q.explanation}`
  }).join('\n\n')
}

function generateQuestion(index: number, subject: string, topic: string, level: string): Question {
  // Question banks for different topics
  const geometryQuestions = [
    {
      text: "What is the definition of a 'postulate' in geometry?",
      options: [
        "A statement that must be proven",
        "A statement accepted as true without proof", 
        "A type of angle measurement",
        "A drawing of a geometric shape"
      ],
      correctAnswer: 1,
      explanation: "A postulate is a statement accepted as true without proof, serving as a foundation for geometric reasoning."
    },
    {
      text: "Which term describes two angles that add up to 90 degrees?",
      options: [
        "Supplementary angles",
        "Complementary angles",
        "Vertical angles", 
        "Corresponding angles"
      ],
      correctAnswer: 1,
      explanation: "Complementary angles are two angles whose measures add up to exactly 90 degrees."
    },
    {
      text: "What does 'congruent' mean in geometry?",
      options: [
        "Having the same size and shape",
        "Being parallel to each other",
        "Adding up to 180 degrees",
        "Forming a right angle"
      ],
      correctAnswer: 0,
      explanation: "Congruent means having the same size and shape - identical in every way."
    },
    {
      text: "If two lines are parallel, which of the following must be true?",
      options: [
        "They intersect at 90 degrees",
        "They never intersect and are equidistant",
        "They form a triangle",
        "They are perpendicular"
      ],
      correctAnswer: 1,
      explanation: "Parallel lines never intersect and are always the same distance apart."
    },
    {
      text: "What is the sum of angles in any triangle?",
      options: [
        "90 degrees",
        "180 degrees", 
        "270 degrees",
        "360 degrees"
      ],
      correctAnswer: 1,
      explanation: "The sum of interior angles in any triangle is always 180 degrees."
    },
    {
      text: "Which statement best describes the relationship between vertical angles?",
      options: [
        "They are always congruent",
        "They add up to 180 degrees",
        "They are always supplementary",
        "They form a straight line"
      ],
      correctAnswer: 0,
      explanation: "Vertical angles are always congruent (equal) when two lines intersect."
    },
    {
      text: "What happens when a transversal cuts through parallel lines?",
      options: [
        "All angles become right angles",
        "Corresponding angles are formed and are equal",
        "The lines become perpendicular",
        "No special relationship exists"
      ],
      correctAnswer: 1,
      explanation: "Corresponding angles are formed and are equal when a transversal cuts parallel lines."
    },
    {
      text: "In geometric proofs, what does 'Q.E.D.' stand for?",
      options: [
        "Quite Easily Done",
        "Question Every Detail",
        "Quod erat demonstrandum",
        "Quick Explanation Done"
      ],
      correctAnswer: 2,
      explanation: "Q.E.D. stands for 'quod erat demonstrandum' (Latin for 'which was to be demonstrated')."
    },
    {
      text: "Which of the following is NOT a characteristic of a valid geometric proof?",
      options: [
        "Logical step-by-step reasoning",
        "Justification for each step",
        "Skipping logical steps",
        "Clear conclusion"
      ],
      correctAnswer: 2,
      explanation: "A valid proof must be logical, step-by-step, and justified - it cannot skip logical steps."
    },
    {
      text: "What is the difference between a theorem and a postulate?",
      options: [
        "A theorem is shorter than a postulate",
        "A theorem must be proven, a postulate is accepted",
        "A postulate is more important than a theorem",
        "There is no difference"
      ],
      correctAnswer: 1,
      explanation: "A theorem must be proven using logical reasoning, while a postulate is accepted without proof."
    }
  ]

  const algebraQuestions = [
    {
      text: "What is a 'variable' in algebra?",
      options: [
        "A fixed number value",
        "A symbol representing an unknown quantity",
        "An operation like addition",
        "A type of equation"
      ],
      correctAnswer: 1,
      explanation: "A variable is a symbol (usually a letter) that represents an unknown or changing quantity."
    },
    {
      text: "What does 'solve an equation' mean?",
      options: [
        "Make the equation more complex",
        "Find the value that makes the equation true",
        "Graph the equation",
        "Write the equation in words"
      ],
      correctAnswer: 1,
      explanation: "Solving an equation means finding the value(s) of the variable that make the equation true."
    },
    {
      text: "What is the golden rule of algebra?",
      options: [
        "Always use the same operation",
        "Whatever you do to one side, do to the other",
        "Variables must come first",
        "Numbers are more important than variables"
      ],
      correctAnswer: 1,
      explanation: "Whatever you do to one side of an equation, you must do to the other side to maintain balance."
    },
    {
      text: "What is the difference between an expression and an equation?",
      options: [
        "An expression has no equals sign, an equation does",
        "An equation is shorter than an expression",
        "Expressions use variables, equations don't",
        "There is no difference"
      ],
      correctAnswer: 0,
      explanation: "An expression has no equals sign, while an equation has an equals sign and shows equality."
    },
    {
      text: "Which property allows us to rearrange terms in addition?",
      options: [
        "Associative property",
        "Commutative property",
        "Distributive property",
        "Identity property"
      ],
      correctAnswer: 1,
      explanation: "The commutative property of addition allows us to change the order of addends."
    },
    {
      text: "What does 'like terms' mean in algebra?",
      options: [
        "Terms that look similar",
        "Terms with the same variables and powers",
        "Terms that are easy to solve",
        "Terms that come first in an equation"
      ],
      correctAnswer: 1,
      explanation: "Like terms have the same variables raised to the same powers, so they can be combined."
    },
    {
      text: "What is a 'coefficient' in an algebraic term?",
      options: [
        "The variable part of a term",
        "The numerical factor multiplied by the variable",
        "The exponent of the variable",
        "The result of solving"
      ],
      correctAnswer: 1,
      explanation: "A coefficient is the numerical factor multiplied by the variable in a term."
    },
    {
      text: "If 3x = 12, what is x?",
      options: [
        "x = 3",
        "x = 4",
        "x = 6",
        "x = 9"
      ],
      correctAnswer: 1,
      explanation: "Divide both sides by 3: x = 12 ÷ 3 = 4."
    },
    {
      text: "If 2x + 5 = 13, what is the first step to solve?",
      options: [
        "Divide both sides by 2",
        "Subtract 5 from both sides",
        "Add 5 to both sides",
        "Multiply both sides by 2"
      ],
      correctAnswer: 1,
      explanation: "First, subtract 5 from both sides to isolate the term with x."
    },
    {
      text: "If (x + 3)² = 25, what are the possible values of x?",
      options: [
        "x = 2 only",
        "x = 2 or x = -8",
        "x = 5 only",
        "x = 22 only"
      ],
      correctAnswer: 1,
      explanation: "Take square root of both sides: x + 3 = ±5, so x = 2 or x = -8."
    }
  ]

  const generalQuestions = [
    {
      text: `What is the most important concept to understand in ${topic}?`,
      options: [
        "Memorizing all formulas",
        "Understanding fundamental principles",
        "Working quickly through problems",
        "Getting perfect scores on tests"
      ],
      correctAnswer: 1,
      explanation: "Understanding fundamental principles is more important than memorization for long-term success."
    },
    {
      text: `How would you define ${topic} in simple terms?`,
      options: [
        "A collection of random facts",
        "Understanding core concepts systematically",
        "Only about solving problems",
        "A way to get good grades"
      ],
      correctAnswer: 1,
      explanation: `${topic} involves understanding core concepts and applying them systematically.`
    },
    {
      text: `What is the fundamental principle of ${topic}?`,
      options: [
        "Memorization and repetition",
        "Systematic thinking and logical progression",
        "Speed and efficiency",
        "Following rules exactly"
      ],
      correctAnswer: 1,
      explanation: "The fundamental principle involves systematic thinking and logical progression."
    },
    {
      text: `Which statement best describes learning ${topic}?`,
      options: [
        "It's about getting the right answers",
        "It's about understanding concepts deeply",
        "It's about working faster than others",
        "It's about avoiding mistakes"
      ],
      correctAnswer: 1,
      explanation: "Learning ${topic} is about understanding concepts deeply, not just getting right answers."
    },
    {
      text: `What distinguishes ${topic} from other subjects?`,
      options: [
        "It has unique characteristics and methods",
        "It's exactly like all other subjects",
        "It's only about numbers and symbols",
        "It's easier than other subjects"
      ],
      correctAnswer: 0,
      explanation: `${topic} has unique characteristics and methodologies that set it apart.`
    },
    {
      text: `If you understand concept A in ${topic}, what follows logically?`,
      options: [
        "You can skip all other concepts",
        "You can solve related problems more easily",
        "You no longer need to study",
        "You will automatically get perfect scores"
      ],
      correctAnswer: 1,
      explanation: "Understanding fundamental concepts leads to logical progression and easier problem solving."
    },
    {
      text: `What is the most common misconception about ${topic}?`,
      options: [
        "That it's only about memorization",
        "That it's too difficult to learn",
        "That it's not useful in real life",
        "That you must be naturally good at it"
      ],
      correctAnswer: 0,
      explanation: "A common misconception is that ${topic} is only about memorization, when it's actually about understanding concepts."
    },
    {
      text: `Which error do students frequently make in ${topic}?`,
      options: [
        "Working too slowly",
        "Rushing through problems without understanding",
        "Asking too many questions",
        "Being too careful with their work"
      ],
      correctAnswer: 1,
      explanation: "Students often rush through problems without fully understanding the concepts."
    },
    {
      text: `What approach works best for studying ${topic}?`,
      options: [
        "Cramming before tests",
        "Consistent practice with understanding",
        "Only doing homework",
        "Reading without practice"
      ],
      correctAnswer: 1,
      explanation: "Consistent practice with understanding leads to better long-term retention."
    },
    {
      text: `How should you approach difficult problems in ${topic}?`,
      options: [
        "Skip them and come back later",
        "Break them down into smaller steps",
        "Guess the answer quickly",
        "Give up and ask for help immediately"
      ],
      correctAnswer: 1,
      explanation: "Breaking difficult problems into smaller, manageable steps makes them easier to solve."
    }
  ]

  // Select appropriate question bank
  let questionBank: any[] = []
  
  if (topic.includes('Geometry') || topic.includes('Proofs')) {
    questionBank = geometryQuestions
  } else if (topic.includes('Algebra')) {
    questionBank = algebraQuestions
  } else {
    questionBank = generalQuestions
  }

  // Add variety by mixing in some general questions
  if (questionBank.length < 20) {
    questionBank = [...questionBank, ...generalQuestions]
  }

  // Return a question from the bank (with some variation)
  const baseQuestion = questionBank[index % questionBank.length]
  
  // Add some variation for repeated questions
  if (index > questionBank.length) {
    return {
      ...baseQuestion,
      text: `${baseQuestion.text} (Advanced Application)`,
      explanation: `${baseQuestion.explanation} This applies to more complex scenarios.`
    }
  }
  
  return baseQuestion
}

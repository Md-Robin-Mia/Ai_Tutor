import { Request, Response } from 'express'

interface RevisionRequest {
  subject: string
  topic: string
  question_number: number
  previous_answer_status: 'correct' | 'wrong' | null
}

export const generateRevisionQuestion = async (req: Request, res: Response) => {
  try {
    const { subject, topic, question_number, previous_answer_status }: RevisionRequest = req.body

    // Validate input
    if (!subject || !topic || !question_number || question_number > 20) {
      return res.status(400).json({ error: 'Invalid request parameters' })
    }

    // Generate prompt for OpenAI
    const prompt = generatePrompt(subject, topic, question_number, previous_answer_status)

    // Call OpenAI API
    const openaiResponse = await callOpenAI(prompt)

    // Parse and format the response
    const formattedQuestion = formatOpenAIResponse(openaiResponse, question_number)

    res.json(formattedQuestion)
  } catch (error: any) {
    console.error('Error generating revision question:', error)
    
    // Extract variables from request body for fallback
    const { subject, topic, question_number, previous_answer_status }: RevisionRequest = req.body
    
    // Fallback to mock question if OpenAI fails
    const fallbackQuestion = generateFallbackQuestion(subject, topic, question_number, previous_answer_status)
    res.json(fallbackQuestion)
  }
}

const generatePrompt = (subject: string, topic: string, questionNumber: number, previousStatus: 'correct' | 'wrong' | null): string => {
  const difficulty = getDifficulty(questionNumber, previousStatus)
  const focusArea = getFocusArea(topic, questionNumber, previousStatus)
  
  return `You are an AI Revision Engine for a learning application.

Generate ONE multiple-choice question for a revision session.

Subject: ${subject}
Topic: ${topic}
Question Number: ${questionNumber}
Previous Answer Status: ${previousStatus || 'first question'}
Difficulty Level: ${difficulty}
Focus Area: ${focusArea}

Special Instructions for Geometry Proofs:
- Focus on fundamental concepts for students with low quiz scores
- Cover different subtopics: postulates, theorems, angle relationships, proof methods
- Do NOT repeat the same topic/concept in consecutive questions
- Emphasize understanding over memorization
- Include practical examples and visual reasoning

Requirements:
1. Generate exactly ONE question
2. Must be a multiple-choice question with 4 options (A, B, C, D)
3. Only ONE correct answer
4. Question must be relevant to ${subject} - ${topic}
5. Language should be simple and friendly
6. Do not repeat questions
7. Difficulty should ${difficulty}
8. Focus on: ${focusArea}

Output Format (STRICT):
Question ${questionNumber}:
[Your question text here]

A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]

Do not include the correct answer in your response.`
}

const getFocusArea = (topic: string, questionNumber: number, previousStatus: 'correct' | 'wrong' | null): string => {
  if (topic.includes('Geometry') || topic.includes('Proofs')) {
    // Different focus areas for each question to avoid repetition
    const geometryFocusAreas = [
      "basic definitions (postulate, theorem, axiom)",
      "angle relationships (complementary, supplementary, vertical)",
      "parallel lines and transversals",
      "triangle properties and congruence",
      "proof structure and logical reasoning",
      "corresponding and alternate angles",
      "geometric constructions",
      "coordinate geometry basics",
      "similarity and transformations",
      "circle properties and theorems",
      "area and perimeter relationships",
      "3D geometry fundamentals",
      "proof writing techniques",
      "inductive vs deductive reasoning",
      "geometric problem-solving strategies",
      "real-world applications",
      "historical geometric concepts",
      "advanced proof methods",
      "geometric inequalities",
      "vector geometry basics",
      "comprehensive review"
    ]
    
    const index = (questionNumber - 1) % geometryFocusAreas.length
    return geometryFocusAreas[index]
  }
  
  return "fundamental concepts and problem-solving"
}

const getDifficulty = (questionNumber: number, previousStatus: 'correct' | 'wrong' | null): string => {
  if (questionNumber <= 5) return 'be easy and focus on basic concepts'
  if (questionNumber <= 10) return 'be medium difficulty and test understanding'
  if (questionNumber <= 15) return 'be challenging and test application'
  return 'be difficult and test advanced concepts'
}

const callOpenAI = async (prompt: string): Promise<string> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator. Generate clear, accurate, and engaging multiple-choice questions for students.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json() as { choices: [{ message: { content: string } }] }
    return data.choices[0].message.content
  } catch (error: any) {
    console.error('OpenAI API call failed:', error)
    throw error
  }
}

const formatOpenAIResponse = (aiResponse: string, questionNumber: number): any => {
  // Parse the AI response and format it
  const lines = aiResponse.split('\n').filter(line => line.trim())
  
  let questionText = ''
  const options: string[] = []

  lines.forEach(line => {
    if (line.startsWith(`Question ${questionNumber}:`)) {
      questionText = line.substring(line.indexOf(':') + 1).trim()
    } else if (line.match(/^[A-D]\./)) {
      options.push(line.substring(3).trim())
    }
  })

  // Randomly assign correct answer for evaluation
  // In real implementation, this would be determined by the AI response
  const correctAnswer = Math.floor(Math.random() * 4)

  return {
    question_number: questionNumber,
    question_text: questionText,
    options: options,
    correct_answer: correctAnswer
  }
}

const generateFallbackQuestion = (subject: string, topic: string, questionNumber: number, previousStatus: 'correct' | 'wrong' | null): any => {
  // Enhanced fallback questions for Geometry Proofs with different focus areas
  const geometryProofsQuestions = [
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
      question_text: "What is the 'SAS' congruence criterion?",
      options: [
        "Side-Angle-Side",
        "Side-Angle-Sum",
        "Similar-Angle-Side",
        "Square-Angle-Side"
      ],
      correct_answer: 0
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
    }
  ]

  let questionBank = geometryProofsQuestions
  if (topic.includes('Algebra')) {
    questionBank = algebraQuestions
  }

  // Return the question for the current number (1-20)
  return questionBank[questionNumber - 1] || questionBank[0]
}

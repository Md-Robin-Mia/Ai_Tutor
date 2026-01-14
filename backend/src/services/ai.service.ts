import OpenAI from 'openai';
import { IStudySession, IWeakArea } from '../models/StudentProfile.model';
import { LearningStyle, LanguageMode } from '../models/User.model';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

interface TeachRequest {
  studentName: string;
  age: number;
  level: string;
  languageMode: LanguageMode;
  learningStyle: LearningStyle;
  subject: string;
  topic: string;
  weakAreas?: IWeakArea[];
  dyslexiaMode?: boolean;
}

interface QuizGenerationRequest {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questionTypes: string[];
  languageMode: LanguageMode;
}

export class AIService {
  async generateTeachingResponse(request: TeachRequest): Promise<string> {
    if (!openai) {
      return this.getFallbackTeachingResponse(request);
    }
    
    const systemPrompt = this.buildTeachingSystemPrompt(request);
    const userPrompt = this.buildTeachingUserPrompt(request);

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      return response.choices[0].message.content || 'Unable to generate response';
    } catch (error) {
      console.error('OpenAI API Error:', error);
      return this.getFallbackTeachingResponse(request);
    }
  }

  private buildTeachingSystemPrompt(request: TeachRequest): string {
    let prompt = `You are a friendly, encouraging AI tutor helping ${request.studentName}, age ${request.age}.`;
    
    if (request.languageMode === LanguageMode.BANGLA) {
      prompt += ' Respond ONLY in Bangla language.';
    } else if (request.languageMode === LanguageMode.HINDI) {
      prompt += ' Respond ONLY in Hindi language.';
    } else {
      prompt += ' Respond in English.';
    }

    if (request.dyslexiaMode) {
      prompt += ' Use simple, short sentences. Avoid complex words.';
    }

    switch (request.learningStyle) {
      case LearningStyle.VISUAL:
        prompt += ' Focus on visual explanations, diagrams, and examples.';
        break;
      case LearningStyle.TEXT:
        prompt += ' Provide detailed step-by-step text explanations.';
        break;
      case LearningStyle.PRACTICE:
        prompt += ' Focus on practice exercises and hands-on examples.';
        break;
    }

    prompt += ` Student level: ${request.level}. Adapt difficulty accordingly.`;
    
    if (request.weakAreas && request.weakAreas.length > 0) {
      prompt += ` Student struggles with: ${request.weakAreas.map(w => w.topic).join(', ')}. Provide extra support on these.`;
    }

    return prompt;
  }

  private buildTeachingUserPrompt(request: TeachRequest): string {
    return `Teach me about ${request.topic} in ${request.subject}. Make it engaging and easy to understand.`;
  }

  private getFallbackTeachingResponse(request: TeachRequest): string {
    if (request.languageMode === LanguageMode.BANGLA) {
      return `আমি ${request.topic} সম্পর্কে শিখতে প্রস্তুত! এটি ${request.subject} এর একটি গুরুত্বপূর্ণ বিষয়। চলুন ধাপে ধাপে শিখি।`;
    }
    return `Let's learn about ${request.topic} in ${request.subject}! This is an important concept. Let's break it down step by step.`;
  }

  async generateQuiz(request: QuizGenerationRequest): Promise<any> {
    if (!openai) {
      return this.getFallbackQuiz(request);
    }
    
    const prompt = `Generate a ${request.difficulty} difficulty quiz on ${request.topic} in ${request.subject}.
    Create ${request.questionCount} questions.
    Question types: ${request.questionTypes.join(', ')}.
    ${request.languageMode === LanguageMode.BANGLA ? 'Generate in Bangla language.' : 'Generate in English.'}
    
    Return JSON format:
    {
      "questions": [
        {
          "questionText": "...",
          "questionType": "mcq|short_answer|coding|true_false",
          "options": ["...", "...", "...", "..."],
          "correctAnswer": "...",
          "explanation": "...",
          "difficulty": "easy|medium|hard",
          "points": 10
        }
      ]
    }`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert quiz generator. Always return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      });

      const content = response.choices[0].message.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Quiz generation error:', error);
      return this.getFallbackQuiz(request);
    }
  }

  private getFallbackQuiz(request: QuizGenerationRequest): any {
    return {
      questions: [
        {
          questionText: `What is ${request.topic}?`,
          questionType: 'short_answer',
          correctAnswer: 'Sample answer',
          explanation: 'This is a sample question.',
          difficulty: request.difficulty,
          points: 10
        }
      ]
    };
  }

  async analyzeWeakAreas(studySessions: IStudySession[]): Promise<IWeakArea[]> {
    const topicPerformance = new Map<string, { total: number; correct: number; subject: string }>();

    studySessions.forEach(session => {
      const key = `${session.subject}:${session.topic}`;
      if (!topicPerformance.has(key)) {
        topicPerformance.set(key, { total: 0, correct: 0, subject: session.subject });
      }
      const perf = topicPerformance.get(key)!;
      perf.total++;
      if (session.quizScore && session.quizScore >= 70) {
        perf.correct++;
      }
    });

    const weakAreas: IWeakArea[] = [];
    topicPerformance.forEach((perf, key) => {
      const [subject, topic] = key.split(':');
      const accuracy = perf.total > 0 ? (perf.correct / perf.total) * 100 : 0;
      
      if (accuracy < 60 && perf.total >= 2) {
        weakAreas.push({
          topic,
          subject,
          mistakeCount: perf.total - perf.correct,
          lastPracticed: new Date(),
          needsRevision: true
        });
      }
    });

    return weakAreas;
  }

  async detectLearningStyle(studySessions: IStudySession[]): Promise<LearningStyle> {
    if (studySessions.length < 5) {
      return LearningStyle.MIXED;
    }

    const avgCompletionRate = studySessions.reduce((sum, s) => sum + s.completionPercentage, 0) / studySessions.length;
    const avgQuizScore = studySessions.filter(s => s.quizScore).reduce((sum, s) => sum + (s.quizScore || 0), 0) / studySessions.filter(s => s.quizScore).length;

    if (avgQuizScore > 80 && avgCompletionRate > 80) {
      return LearningStyle.PRACTICE;
    } else if (avgCompletionRate > 70) {
      return LearningStyle.TEXT;
    } else {
      return LearningStyle.VISUAL;
    }
  }

  async generateMotivation(studentName: string, languageMode: LanguageMode, _context?: string): Promise<string> {
    const prompts = {
      [LanguageMode.BANGLA]: [
        `${studentName}, তুমি দুর্দান্ত কাজ করছ! চালিয়ে যাও! 🌟`,
        `প্রতিটি ছোট পদক্ষেপ তোমাকে লক্ষ্যের কাছাকাছি নিয়ে যাচ্ছে। ${studentName}, তুমি পারবে! 💪`,
        `${studentName}, তোমার অগ্রগতি অসাধারণ! গর্বিত হও নিজের উপর! 🎯`
      ],
      [LanguageMode.ENGLISH]: [
        `${studentName}, you're doing amazing! Keep up the great work! 🌟`,
        `Every small step brings you closer to your goal. ${studentName}, you've got this! 💪`,
        `${studentName}, your progress is outstanding! Be proud of yourself! 🎯`
      ],
      [LanguageMode.HINDI]: [
        `${studentName}, तुम बहुत अच्छा कर रहे हो! ऐसे ही जारी रखो! 🌟`,
        `हर छोटा कदम तुम्हें तुम्हारे लक्ष्य के करीब ले जा रहा है। ${studentName}, तुम कर सकते हो! 💪`,
        `${studentName}, तुम्हारी प्रगति शानदार है! खुद पर गर्व करो! 🎯`
      ],
      [LanguageMode.MIXED]: [
        `${studentName}, you're doing amazing! Keep up the great work! 🌟`,
        `Every small step brings you closer to your goal. ${studentName}, you've got this! 💪`,
        `${studentName}, your progress is outstanding! Be proud of yourself! 🎯`
      ]
    };

    const messages = prompts[languageMode] || prompts[LanguageMode.ENGLISH];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  async generateCareerAdvice(skills: Map<string, number>, interests: string[]): Promise<any> {
    if (!openai) {
      return {
        recommendedCareers: ['Software Developer', 'Data Analyst', 'Web Developer'],
        skillGaps: [{ skill: 'Advanced Programming', importance: 'high' }],
        learningPath: ['Master fundamentals', 'Build projects', 'Get certified']
      };
    }
    
    const skillsArray = Array.from(skills.entries()).map(([skill, level]) => ({ skill, level }));
    
    const prompt = `Based on these skills and interests, suggest career paths:
    Skills: ${JSON.stringify(skillsArray)}
    Interests: ${interests.join(', ')}
    
    Return JSON:
    {
      "recommendedCareers": ["...", "...", "..."],
      "skillGaps": [{"skill": "...", "importance": "high|medium|low"}],
      "learningPath": ["step1", "step2", "step3"]
    }`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a career counselor. Return valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });

      const content = response.choices[0].message.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      return {
        recommendedCareers: ['Software Developer', 'Data Analyst', 'Web Developer'],
        skillGaps: [{ skill: 'Advanced Programming', importance: 'high' }],
        learningPath: ['Master fundamentals', 'Build projects', 'Get certified']
      };
    }
  }

  async evaluateHandwriting(imageBase64: string): Promise<any> {
    if (!openai) {
      return {
        feedback: 'Unable to evaluate handwriting at this time.',
        score: 0
      };
    }
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Evaluate this handwritten answer. Provide feedback and a score out of 100.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
            ]
          }
        ],
        max_tokens: 500
      });

      return {
        feedback: response.choices[0].message.content,
        score: 75
      };
    } catch (error) {
      return {
        feedback: 'Unable to evaluate handwriting at this time.',
        score: 0
      };
    }
  }
}

export default new AIService();

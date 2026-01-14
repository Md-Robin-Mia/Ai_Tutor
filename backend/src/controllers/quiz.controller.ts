import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Quiz from '../models/Quiz.model';
import QuizAttempt from '../models/QuizAttempt.model';
import gamificationService from '../services/gamification.service';

export const createQuiz = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const quiz = await Quiz.create({ ...req.body, createdBy: req.user._id });
    return res.status(201).json({ quiz });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getQuiz = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    return res.json({ quiz });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { answers, timeSpent } = req.body;
    const quiz = await Quiz.findById(req.params.quizId);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const evaluatedAnswers = answers.map((answer: any, index: number) => {
      const question = quiz.questions[index];
      const isCorrect = answer.userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      const pointsEarned = isCorrect ? question.points : 0;
      score += pointsEarned;

      return {
        questionIndex: index,
        userAnswer: answer.userAnswer,
        isCorrect,
        pointsEarned,
        feedback: isCorrect ? 'Correct!' : `Incorrect. ${question.explanation}`,
        timeTaken: answer.timeTaken || 0
      };
    });

    const percentage = (score / totalPoints) * 100;
    const passed = percentage >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      quizId: quiz._id,
      studentId: req.user._id,
      answers: evaluatedAnswers,
      score,
      totalPoints,
      percentage,
      passed,
      timeSpent,
      feedback: passed ? 'Great job!' : 'Keep practicing!'
    });

    const xpActivity = percentage === 100 ? 'quiz_perfect' : 'quiz_complete';
    const xp = gamificationService.calculateXPForActivity(xpActivity, percentage);
    await gamificationService.awardXP(req.user._id.toString(), xp, `Quiz ${passed ? 'passed' : 'completed'}`);

    return res.json({ attempt, passed, score, percentage });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAttempts = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const attempts = await QuizAttempt.find({ studentId: req.user._id }).populate('quizId').sort({ completedAt: -1 }).limit(20);
    return res.json({ attempts });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

import mongoose, { Document, Schema } from 'mongoose';

export interface IAnswer {
  questionIndex: number;
  userAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  feedback: string;
  timeTaken: number;
}

export interface IQuizAttempt extends Document {
  quizId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  answers: IAnswer[];
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  timeSpent: number;
  completedAt: Date;
  feedback: string;
  createdAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>({
  quizId: {
    type: Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionIndex: { type: Number, required: true },
    userAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    pointsEarned: { type: Number, default: 0 },
    feedback: { type: String },
    timeTaken: { type: Number, default: 0 }
  }],
  score: {
    type: Number,
    required: true
  },
  totalPoints: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  feedback: {
    type: String
  }
}, {
  timestamps: true
});

quizAttemptSchema.index({ studentId: 1, quizId: 1 });
quizAttemptSchema.index({ completedAt: -1 });

export default mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);

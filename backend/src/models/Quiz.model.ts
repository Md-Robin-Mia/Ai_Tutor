import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
  questionText: string;
  questionType: 'mcq' | 'short_answer' | 'coding' | 'true_false';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface IQuiz extends Document {
  title: string;
  subject: string;
  topic: string;
  createdBy: mongoose.Types.ObjectId;
  questions: IQuizQuestion[];
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  timeLimit?: number;
  passingScore: number;
  isPublic: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const quizSchema = new Schema<IQuiz>({
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [{
    questionText: { type: String, required: true },
    questionType: { 
      type: String, 
      enum: ['mcq', 'short_answer', 'coding', 'true_false'],
      required: true 
    },
    options: [{ type: String }],
    correctAnswer: { type: String, required: true },
    explanation: { type: String, required: true },
    difficulty: { 
      type: String, 
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    points: { type: Number, default: 10 }
  }],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'adaptive'],
    default: 'medium'
  },
  timeLimit: {
    type: Number
  },
  passingScore: {
    type: Number,
    default: 60
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String
  }]
}, {
  timestamps: true
});

quizSchema.index({ subject: 1, topic: 1 });
quizSchema.index({ createdBy: 1 });

export default mongoose.model<IQuiz>('Quiz', quizSchema);

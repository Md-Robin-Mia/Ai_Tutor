import mongoose, { Document, Schema } from 'mongoose';

export enum AssignmentType {
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  PROJECT = 'project',
  DAILY_CHALLENGE = 'daily_challenge'
}

export enum AssignmentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  EXPIRED = 'expired'
}

export interface IAssignmentSubmission {
  student: mongoose.Types.ObjectId;
  studentName: string;
  submittedAt: Date;
  score?: number;
  totalQuestions?: number;
  answers?: any[];
  timeSpent?: number; // in minutes
  feedback?: string;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface IAssignmentModel extends mongoose.Model<IAssignment> {
  createDailyQuiz(
    teacherId: mongoose.Types.ObjectId,
    courseId: mongoose.Types.ObjectId,
    courseTitle: string,
    scheduledDate: Date
  ): Promise<IAssignment>;
}

export interface IAssignment extends Document {
  title: string;
  description: string;
  type: AssignmentType;
  teacher: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  courseTitle: string;
  questions: Array<{
    question: string;
    type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
    options?: string[];
    correctAnswer?: string | number;
    points: number;
  }>;
  totalPoints: number;
  timeLimit?: number; // in minutes
  dueDate: Date;
  status: AssignmentStatus;
  isDailyQuiz: boolean;
  scheduledDate?: Date; // For daily quizzes
  submissions: IAssignmentSubmission[];
  averageScore: number;
  completionRate: number;
  createdAt: Date;
  updatedAt: Date;
  submitAssignment(
    studentId: mongoose.Types.ObjectId,
    studentName: string,
    answers: any[],
    timeSpent: number
  ): Promise<IAssignment>;
}

const assignmentSchema = new Schema<IAssignment>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: Object.values(AssignmentType),
    required: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['multiple_choice', 'true_false', 'short_answer', 'essay'],
      required: true
    },
    options: [String],
    correctAnswer: Schema.Types.Mixed,
    points: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalPoints: {
    type: Number,
    required: true,
    min: 1
  },
  timeLimit: {
    type: Number,
    min: 1
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(AssignmentStatus),
    default: AssignmentStatus.DRAFT
  },
  isDailyQuiz: {
    type: Boolean,
    default: false
  },
  scheduledDate: {
    type: Date
  },
  submissions: [{
    student: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      required: true
    },
    submittedAt: {
      type: Date,
      required: true
    },
    score: {
      type: Number,
      min: 0
    },
    totalQuestions: {
      type: Number,
      min: 1
    },
    answers: [Schema.Types.Mixed],
    timeSpent: {
      type: Number,
      min: 0
    },
    feedback: String,
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'D', 'F']
    }
  }],
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
assignmentSchema.index({ teacher: 1, course: 1 });
assignmentSchema.index({ course: 1, status: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isDailyQuiz: 1, scheduledDate: 1 });
assignmentSchema.index({ 'submissions.student': 1 });

// Pre-save middleware to calculate totalPoints and update averageScore
assignmentSchema.pre('save', function(next) {
  if (this.isModified('questions')) {
    this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  }
  
  if (this.isModified('submissions')) {
    const completedSubmissions = this.submissions.filter(sub => sub.score !== undefined);
    if (completedSubmissions.length > 0) {
      this.averageScore = completedSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / completedSubmissions.length;
    }
    
    // Calculate completion rate (this would need total enrolled students for accuracy)
    this.completionRate = this.submissions.length > 0 ? (this.submissions.length / 10) * 100 : 0; // Placeholder
  }
  
  next();
});

// Static method to create daily quiz
assignmentSchema.statics.createDailyQuiz = async function(
  teacherId: mongoose.Types.ObjectId,
  courseId: mongoose.Types.ObjectId,
  courseTitle: string,
  scheduledDate: Date
) {
  const quizTitle = `Daily Quiz - ${scheduledDate.toLocaleDateString()}`;
  
  // Generate random quiz questions (this would typically come from a question bank)
  const sampleQuestions = [
    {
      question: "What is the main topic of today's lesson?",
      type: "multiple_choice",
      options: ["Topic A", "Topic B", "Topic C", "Topic D"],
      correctAnswer: 0,
      points: 10
    },
    {
      question: "Did you complete yesterday's assignment?",
      type: "true_false",
      correctAnswer: true,
      points: 5
    },
    {
      question: "How would you rate your understanding of today's material?",
      type: "multiple_choice",
      options: ["Very Clear", "Clear", "Somewhat Clear", "Confused"],
      correctAnswer: 0,
      points: 5
    }
  ];

  return this.create({
    title: quizTitle,
    description: "Daily progress check and comprehension quiz",
    type: AssignmentType.QUIZ,
    teacher: teacherId,
    course: courseId,
    courseTitle,
    questions: sampleQuestions,
    timeLimit: 10, // 10 minutes for daily quiz
    dueDate: new Date(scheduledDate.getTime() + 24 * 60 * 60 * 1000), // Due next day
    status: AssignmentStatus.PUBLISHED,
    isDailyQuiz: true,
    scheduledDate
  });
};

// Instance method to submit assignment
assignmentSchema.methods.submitAssignment = async function(
  studentId: mongoose.Types.ObjectId,
  studentName: string,
  answers: any[],
  timeSpent: number
) {
  // Calculate score based on correct answers
  let score = 0;
  const gradedAnswers = answers.map((answer, index) => {
    const question = this.questions[index];
    if (question && answer === question.correctAnswer) {
      score += question.points;
    }
    return answer;
  });

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  const percentage = (score / this.totalPoints) * 100;
  if (percentage >= 90) grade = 'A';
  else if (percentage >= 80) grade = 'B';
  else if (percentage >= 70) grade = 'C';
  else if (percentage >= 60) grade = 'D';
  else grade = 'F';

  // Add submission
  this.submissions.push({
    student: studentId,
    studentName,
    submittedAt: new Date(),
    score: percentage,
    totalQuestions: this.questions.length,
    answers: gradedAnswers,
    timeSpent,
    grade
  });

  // Update average score
  const completedSubmissions = this.submissions.filter(sub => sub.score !== undefined);
  this.averageScore = completedSubmissions.reduce((sum, sub) => sum + (sub.score || 0), 0) / completedSubmissions.length;

  return this.save();
};

export default (mongoose.model<IAssignment, IAssignmentModel>('Assignment', assignmentSchema));

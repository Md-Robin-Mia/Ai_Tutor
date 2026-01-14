import mongoose, { Document, Schema } from 'mongoose';

export interface IWeakArea {
  topic: string;
  subject: string;
  mistakeCount: number;
  lastPracticed: Date;
  needsRevision: boolean;
}

export interface IGoal {
  title: string;
  description: string;
  type: 'short_term' | 'long_term';
  targetDate: Date;
  progress: number;
  isCompleted: boolean;
  createdAt: Date;
}

export interface IStudySession {
  subject: string;
  topic: string;
  duration: number;
  completionPercentage: number;
  quizScore?: number;
  timestamp: Date;
  courseId?: string;
  lessonId?: string;
  moduleId?: string;
}

export interface ICourseProgress {
  courseId: mongoose.Types.ObjectId;
  courseTitle: string;
  enrolledAt: Date;
  lastAccessed: Date;
  lessonsCompleted: string[];
  totalLessons: number;
  completionPercentage: number;
  timeSpent: number; // in minutes
  averageScore: number;
  currentLesson?: string;
  currentModule?: string;
  progress: Map<string, number>; // lessonId -> completion percentage
}

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  level: 'beginner' | 'intermediate' | 'advanced';
  xp: number;
  currentLevel: number;
  badges: string[];
  studyStreak: number;
  lastStudyDate: Date;
  weakAreas: IWeakArea[];
  goals: IGoal[];
  studySessions: IStudySession[];
  courseProgress: ICourseProgress[];
  totalStudyTime: number;
  subjects: string[];
  preferredStudyTime?: string;
  skillsAssessed: Map<string, number>;
  careerInterests: string[];
  projectsCompleted: number;
  certificatesEarned: string[];
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  xp: {
    type: Number,
    default: 0
  },
  currentLevel: {
    type: Number,
    default: 1
  },
  badges: [{
    type: String
  }],
  studyStreak: {
    type: Number,
    default: 0
  },
  lastStudyDate: {
    type: Date
  },
  weakAreas: [{
    topic: { type: String, required: true },
    subject: { type: String, required: true },
    mistakeCount: { type: Number, default: 0 },
    lastPracticed: { type: Date, default: Date.now },
    needsRevision: { type: Boolean, default: false }
  }],
  goals: [{
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['short_term', 'long_term'], required: true },
    targetDate: { type: Date, required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    isCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  studySessions: [{
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    duration: { type: Number, required: true },
    completionPercentage: { type: Number, default: 0 },
    quizScore: { type: Number },
    timestamp: { type: Date, default: Date.now },
    courseId: { type: Schema.Types.ObjectId },
    lessonId: { type: String },
    moduleId: { type: String }
  }],
  courseProgress: [{
    courseId: { type: Schema.Types.ObjectId, required: true, ref: 'Course' },
    courseTitle: { type: String, required: true },
    enrolledAt: { type: Date, default: Date.now },
    lastAccessed: { type: Date, default: Date.now },
    lessonsCompleted: [{ type: String }],
    totalLessons: { type: Number, required: true },
    completionPercentage: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }, // in minutes
    averageScore: { type: Number, default: 0 },
    currentLesson: { type: String },
    currentModule: { type: String },
    progress: { type: Map, of: Number, default: new Map() }
  }],
  totalStudyTime: {
    type: Number,
    default: 0
  },
  subjects: [{
    type: String
  }],
  preferredStudyTime: {
    type: String
  },
  skillsAssessed: {
    type: Map,
    of: Number,
    default: new Map()
  },
  careerInterests: [{
    type: String
  }],
  projectsCompleted: {
    type: Number,
    default: 0
  },
  certificatesEarned: [{
    type: String
  }]
}, {
  timestamps: true
});

studentProfileSchema.index({ 'weakAreas.subject': 1 });
studentProfileSchema.index({ xp: -1 });

export default mongoose.model<IStudentProfile>('StudentProfile', studentProfileSchema);

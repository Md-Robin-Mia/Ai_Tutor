import mongoose, { Document, Schema } from 'mongoose';

export interface IClassroom {
  name: string;
  subject: string;
  grade: string;
  students: mongoose.Types.ObjectId[];
  createdAt: Date;
}

export interface IAssignment {
  title: string;
  description: string;
  subject: string;
  dueDate: Date;
  assignedTo: mongoose.Types.ObjectId[];
  quizId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ITeacherProfile extends Document {
  userId: mongoose.Types.ObjectId;
  subjects: string[];
  qualifications: string[];
  experience: number;
  classrooms: IClassroom[];
  assignments: IAssignment[];
  totalStudents: number;
  createdAt: Date;
  updatedAt: Date;
}

const teacherProfileSchema = new Schema<ITeacherProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  subjects: [{
    type: String,
    required: true
  }],
  qualifications: [{
    type: String
  }],
  experience: {
    type: Number,
    default: 0
  },
  classrooms: [{
    name: { type: String, required: true },
    subject: { type: String, required: true },
    grade: { type: String, required: true },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
  }],
  assignments: [{
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: String, required: true },
    dueDate: { type: Date, required: true },
    assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz' },
    createdAt: { type: Date, default: Date.now }
  }],
  totalStudents: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<ITeacherProfile>('TeacherProfile', teacherProfileSchema);

import mongoose, { Document, Schema } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin'
}

export enum LearningStyle {
  VISUAL = 'visual',
  TEXT = 'text',
  PRACTICE = 'practice',
  MIXED = 'mixed'
}

export enum LanguageMode {
  ENGLISH = 'english',
  BANGLA = 'bangla',
  HINDI = 'hindi',
  MIXED = 'mixed'
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  googleId?: string;
  avatar?: string;
  age?: number;
  grade?: string;
  languageMode: LanguageMode;
  learningStyle: LearningStyle;
  dyslexiaMode: boolean;
  isActive: boolean;
  isSuperAdmin?: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  avatar: {
    type: String
  },
  age: {
    type: Number,
    min: 5,
    max: 100
  },
  grade: {
    type: String
  },
  languageMode: {
    type: String,
    enum: Object.values(LanguageMode),
    default: LanguageMode.ENGLISH
  },
  learningStyle: {
    type: String,
    enum: Object.values(LearningStyle),
    default: LearningStyle.MIXED
  },
  dyslexiaMode: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isSuperAdmin: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);

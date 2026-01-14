import mongoose, { Document, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  instructor: mongoose.Types.ObjectId;
  category: {
    name: string;
    _id: mongoose.Types.ObjectId;
  };
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  isFree: boolean;
  published: boolean;
  approvedByAdmin: boolean;
  featured: boolean;
  enrolledCount: number;
  rating: {
    average: number;
    count: number;
  };
  totalLessons: number;
  duration: number; // in hours
  requirements: string[];
  whatYouLearn: string[];
  targetAudience: string[];
  lessons: Array<{
    title: string;
    description: string;
    duration: number; // in minutes
    videoUrl?: string;
    order: number;
    isPreview: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  thumbnail: {
    type: String,
    required: true,
    default: 'https://via.placeholder.com/300x200'
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    name: { type: String, required: true },
    _id: { type: Schema.Types.ObjectId, required: true }
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isFree: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: false
  },
  approvedByAdmin: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  enrolledCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  totalLessons: {
    type: Number,
    required: true,
    min: 1
  },
  duration: {
    type: Number,
    required: true,
    min: 0.1 // in hours
  },
  requirements: [{
    type: String,
    trim: true
  }],
  whatYouLearn: [{
    type: String,
    trim: true
  }],
  targetAudience: [{
    type: String,
    trim: true
  }],
  lessons: [{
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true, min: 1 }, // in minutes
    videoUrl: { type: String },
    order: { type: Number, required: true },
    isPreview: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});

// Index for searching
courseSchema.index({ title: 'text', description: 'text' });
courseSchema.index({ instructor: 1 });
courseSchema.index({ 'category.name': 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ published: 1 });
courseSchema.index({ approvedByAdmin: 1 });
courseSchema.index({ featured: 1 });
courseSchema.index({ createdAt: -1 });

// Generate slug from title
courseSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.isModified('slug')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  next();
});

export default mongoose.model<ICourse>('Course', courseSchema);

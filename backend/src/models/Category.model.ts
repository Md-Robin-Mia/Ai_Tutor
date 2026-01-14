import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './User.model';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
    unique: true
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
    maxlength: 500,
    trim: true
  },
  icon: {
    type: String,
    default: 'BookOpen'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate slug from name before saving
categorySchema.pre('save', function(next) {
  console.log('Category pre-save hook triggered');
  console.log('Name:', this.name);
  console.log('Slug before:', this.slug);
  console.log('Is new:', this.isNew);
  console.log('Is modified name:', this.isModified('name'));
  
  // Generate slug if it's a new document or name is modified
  if (this.isNew || this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    console.log('Generated slug:', this.slug);
  }
  next();
});

// Create indexes
categorySchema.index({ isActive: 1 });
categorySchema.index({ createdBy: 1 });

const Category = mongoose.model<ICategory>('Category', categorySchema);

export default Category;

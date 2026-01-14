import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentPurchaseHistory extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  purchaseDate: Date;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId: string;
  courseTitle: string;
  teacherName: string;
  thumbnail?: string;
}

const StudentPurchaseHistorySchema = new Schema<IStudentPurchaseHistory>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'nagad', 'bkash', 'rocket', 'bank_transfer', 'wallet']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  courseTitle: {
    type: String,
    required: true
  },
  teacherName: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
StudentPurchaseHistorySchema.index({ studentId: 1, purchaseDate: -1 });
StudentPurchaseHistorySchema.index({ studentId: 1, paymentStatus: 1 });

export default mongoose.model<IStudentPurchaseHistory>('StudentPurchaseHistory', StudentPurchaseHistorySchema);

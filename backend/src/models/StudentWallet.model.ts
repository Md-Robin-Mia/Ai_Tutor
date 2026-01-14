import mongoose, { Schema, Document } from 'mongoose';

export interface IStudentWallet extends Document {
  studentId: mongoose.Types.ObjectId;
  balance: number;
  totalSpent: number;
  currency: string;
  lastUpdated: Date;
  transactions: Array<{
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    referenceId: string;
    referenceType: 'course_purchase' | 'refund' | 'wallet_recharge';
    createdAt: Date;
  }>;
}

const StudentWalletSchema = new Schema<IStudentWallet>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'BDT'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  transactions: [{
    type: {
      type: String,
      required: true,
      enum: ['credit', 'debit']
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true
    },
    referenceId: {
      type: String,
      required: true
    },
    referenceType: {
      type: String,
      required: true,
      enum: ['course_purchase', 'refund', 'wallet_recharge']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for efficient queries
StudentWalletSchema.index({ 'transactions.createdAt': -1 });

export default mongoose.model<IStudentWallet>('StudentWallet', StudentWalletSchema);

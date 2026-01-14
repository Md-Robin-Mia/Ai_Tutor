import mongoose, { Document, Schema } from 'mongoose';

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  NAGAD = 'nagad',
  BIKASH = 'bikash',
  ROCKET = 'rocket',
  BANK_TRANSFER = 'bank_transfer'
}

export interface IPaymentTransaction extends Document {
  student: mongoose.Types.ObjectId;
  course: mongoose.Types.ObjectId;
  teacher: mongoose.Types.ObjectId;
  amount: number;
  adminCommission: number;
  teacherEarnings: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string;
  paymentGatewayResponse?: any;
  refundedAmount?: number;
  refundReason?: string;
  refundDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentTransactionSchema = new Schema<IPaymentTransaction>({
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  adminCommission: {
    type: Number,
    required: true,
    min: 0
  },
  teacherEarnings: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'BDT',
    uppercase: true
  },
  paymentMethod: {
    type: String,
    enum: Object.values(PaymentMethod),
    required: true
  },
  paymentStatus: {
    type: String,
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paymentGatewayResponse: {
    type: Schema.Types.Mixed
  },
  refundedAmount: {
    type: Number,
    min: 0
  },
  refundReason: {
    type: String
  },
  refundDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
paymentTransactionSchema.index({ student: 1 });
paymentTransactionSchema.index({ teacher: 1 });
paymentTransactionSchema.index({ course: 1 });
paymentTransactionSchema.index({ paymentStatus: 1 });
paymentTransactionSchema.index({ createdAt: -1 });

// Generate unique transaction ID
paymentTransactionSchema.pre('save', function(next) {
  if (this.isNew && !this.transactionId) {
    this.transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

export default mongoose.model<IPaymentTransaction>('PaymentTransaction', paymentTransactionSchema);

import mongoose, { Document, Schema } from 'mongoose';

export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum WithdrawalMethod {
  NAGAD = 'nagad',
  BIKASH = 'bikash',
  BANK_CARD = 'bank_card',
  BANK_TRANSFER = 'bank_transfer'
}

export interface IWithdrawalRequest extends Document {
  teacher: mongoose.Types.ObjectId;
  amount: number;
  withdrawalMethod: WithdrawalMethod;
  accountInfo: {
    phoneNumber?: string; // For Nagad/Bikash
    cardNumber?: string; // For bank cards
    bankName?: string;
    accountHolderName?: string;
    routingNumber?: string;
  };
  status: WithdrawalStatus;
  transactionId?: string;
  processingDate?: Date;
  completedDate?: Date;
  failureReason?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeacherWallet extends Document {
  teacher: mongoose.Types.ObjectId;
  totalEarnings: number;
  availableBalance: number;
  pendingWithdrawals: number;
  totalWithdrawn: number;
  currency: string;
  withdrawalRequests: IWithdrawalRequest[];
  lastEarningDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  addEarnings(amount: number): Promise<void>;
  processWithdrawal(withdrawalId: mongoose.Types.ObjectId): Promise<void>;
  getEarningHistory(limit?: number): Promise<any[]>;
}

const withdrawalRequestSchema = new Schema<IWithdrawalRequest>({
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 50 // Minimum withdrawal amount
  },
  withdrawalMethod: {
    type: String,
    enum: Object.values(WithdrawalMethod),
    required: true
  },
  accountInfo: {
    phoneNumber: {
      type: String,
      validate: {
        validator: function(v: string) {
          // Bangladeshi phone number validation
          return /^(?:\+88|01)?(?:\d{11}|\d{13})$/.test(v);
        },
        message: 'Invalid Bangladeshi phone number format'
      }
    },
    cardNumber: {
      type: String,
      validate: {
        validator: function(v: string) {
          // Basic card number validation (16 digits)
          return /^\d{16}$/.test(v.replace(/\s/g, ''));
        },
        message: 'Invalid card number format'
      }
    },
    bankName: {
      type: String,
      trim: true
    },
    accountHolderName: {
      type: String,
      trim: true,
      required: function(this: IWithdrawalRequest) {
        return this.withdrawalMethod === WithdrawalMethod.BANK_CARD || 
               this.withdrawalMethod === WithdrawalMethod.BANK_TRANSFER;
      }
    },
    routingNumber: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: Object.values(WithdrawalStatus),
    default: WithdrawalStatus.PENDING
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  processingDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  failureReason: {
    type: String
  },
  adminNotes: {
    type: String
  }
}, {
  timestamps: true
});

const teacherWalletSchema = new Schema<ITeacherWallet>({
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  availableBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  pendingWithdrawals: {
    type: Number,
    default: 0,
    min: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'BDT',
    uppercase: true
  },
  withdrawalRequests: [withdrawalRequestSchema],
  lastEarningDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
withdrawalRequestSchema.index({ teacher: 1 });
withdrawalRequestSchema.index({ status: 1 });
withdrawalRequestSchema.index({ createdAt: -1 });

// Generate transaction ID for withdrawal requests
withdrawalRequestSchema.pre('save', function(next) {
  if (this.isNew && !this.transactionId) {
    this.transactionId = 'WDR' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  next();
});

// Instance method to add earnings
teacherWalletSchema.methods.addEarnings = async function(amount: number) {
  this.totalEarnings += amount;
  this.availableBalance += amount;
  this.lastEarningDate = new Date();
  return this.save();
};

// Instance method to process withdrawal
teacherWalletSchema.methods.processWithdrawal = async function(withdrawalId: mongoose.Types.ObjectId) {
  const withdrawal = this.withdrawalRequests.id(withdrawalId);
  if (!withdrawal) {
    throw new Error('Withdrawal request not found');
  }
  
  if (withdrawal.status !== WithdrawalStatus.PENDING) {
    throw new Error('Withdrawal request is not pending');
  }
  
  if (withdrawal.amount > this.availableBalance) {
    throw new Error('Insufficient balance');
  }
  
  withdrawal.status = WithdrawalStatus.PROCESSING;
  withdrawal.processingDate = new Date();
  
  this.availableBalance -= withdrawal.amount;
  this.pendingWithdrawals += withdrawal.amount;
  
  await this.save();
  return withdrawal;
};

export const TeacherWallet = mongoose.model<ITeacherWallet>('TeacherWallet', teacherWalletSchema);
export const WithdrawalRequest = mongoose.model<IWithdrawalRequest>('WithdrawalRequest', withdrawalRequestSchema);

export default TeacherWallet;

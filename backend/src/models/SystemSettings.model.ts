import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  maintenanceMode: {
    enabled: boolean;
    message: string;
    allowAdminAccess: boolean;
  };
  registrations: {
    enabled: boolean;
    requireEmailVerification: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    emailVerification: boolean;
  };
  system: {
    adminEmail: string;
    maxUsers: number;
    storageLimit: number;
  };
  updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>({
  maintenanceMode: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      default: 'System is currently under maintenance. Please try again later.'
    },
    allowAdminAccess: {
      type: Boolean,
      default: true
    }
  },
  registrations: {
    enabled: {
      type: Boolean,
      default: true
    },
    requireEmailVerification: {
      type: Boolean,
      default: false
    }
  },
  security: {
    twoFactorAuth: {
      type: Boolean,
      default: false
    },
    emailVerification: {
      type: Boolean,
      default: true
    }
  },
  system: {
    adminEmail: {
      type: String,
      default: 'admin@aitutor.com'
    },
    maxUsers: {
      type: Number,
      default: 1000
    },
    storageLimit: {
      type: Number,
      default: 1073741824 // 1GB in bytes
    }
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
SystemSettingsSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Model = this.constructor as any;
    const existingSettings = await Model.findOne();
    if (existingSettings) {
      throw new Error('System settings document already exists');
    }
  }
  next();
});

export default mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);

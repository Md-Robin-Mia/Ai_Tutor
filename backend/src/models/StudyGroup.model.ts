import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  senderId: mongoose.Types.ObjectId;
  content: string;
  timestamp: Date;
  isAIModerated: boolean;
}

export interface IStudyGroup extends Document {
  name: string;
  subject: string;
  topic: string;
  members: mongoose.Types.ObjectId[];
  moderator: mongoose.Types.ObjectId;
  messages: IMessage[];
  isActive: boolean;
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

const studyGroupSchema = new Schema<IStudyGroup>({
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    isAIModerated: { type: Boolean, default: false }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  maxMembers: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

studyGroupSchema.index({ subject: 1, topic: 1 });

export default mongoose.model<IStudyGroup>('StudyGroup', studyGroupSchema);

import mongoose, { Schema } from 'mongoose';

const VolunteerNeedSchema = new Schema(
  {
    mosqueId: {
      type: Schema.Types.ObjectId,
      ref: 'Mosque',
      required: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    category: {
      type: String,
      required: true,
      enum: ['cleaning', 'education', 'events', 'technical', 'administration', 'outreach', 'other'],
    },
    skillsRequired: {
      type: [String],
      default: [],
    },
    timeCommitment: {
      type: String,
      required: true,
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    volunteersNeeded: {
      type: Number,
      default: 1,
      min: 1,
    },
    applicants: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
      },
      message: String,
    }],
    status: {
      type: String,
      enum: ['active', 'filled', 'expired', 'cancelled'],
      default: 'active',
    },
    contactInfo: {
      email: String,
      phone: String,
    },
  },
  { timestamps: true }
);

let VolunteerNeedModel;
try {
  if (mongoose && mongoose.models) {
    VolunteerNeedModel = mongoose.models.VolunteerNeed || mongoose.model('VolunteerNeed', VolunteerNeedSchema);
  } else {
    VolunteerNeedModel = mongoose.model('VolunteerNeed', VolunteerNeedSchema);
  }
} catch (error) {
  console.error('Error initializing VolunteerNeed model:', error);
  VolunteerNeedModel = {
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve(null)
  };
}

export { VolunteerNeedModel as VolunteerNeed };
export default VolunteerNeedModel;
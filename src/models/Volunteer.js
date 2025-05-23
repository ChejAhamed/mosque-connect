import mongoose, { Schema } from 'mongoose';

const VolunteerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide your name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
    },
    skills: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
    },
    experience: {
      type: String,
    },
    interests: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    notes: {
      type: String,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    mosqueId: {
      type: Schema.Types.ObjectId,
      ref: 'Mosque',
    },
    emergencyContact: {
      name: String,
      relation: String,
      phone: String,
    },
  },
  { timestamps: true }
);

// Add error handling for model initialization
let VolunteerModel;
try {
  if (mongoose && mongoose.models) {
    VolunteerModel = mongoose.models.Volunteer || mongoose.model('Volunteer', VolunteerSchema);
  } else {
    VolunteerModel = mongoose.model('Volunteer', VolunteerSchema);
  }
} catch (error) {
  console.error('Error initializing Volunteer model:', error);
  // Fallback model that won't crash the application
  VolunteerModel = {
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve(null)
  };
}

export { VolunteerModel as Volunteer };
export default VolunteerModel;

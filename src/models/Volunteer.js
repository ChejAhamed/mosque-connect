import mongoose, { Schema } from 'mongoose';

const VolunteerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skills: {
      type: [String],
      required: [true, 'Please select at least one skill'],
    },
    otherSkills: {
      type: String,
    },
    availability: {
      monday: {
        type: [String],
      },
      tuesday: {
        type: [String],
      },
      wednesday: {
        type: [String],
      },
      thursday: {
        type: [String],
      },
      friday: {
        type: [String],
      },
      saturday: {
        type: [String],
      },
      sunday: {
        type: [String],
      },
    },
    isVisibleToAllMosques: {
      type: Boolean,
      default: false,
    },
    assignedMosqueId: {
      type: Schema.Types.ObjectId,
      ref: 'Mosque',
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

export default VolunteerModel;

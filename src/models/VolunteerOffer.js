import mongoose, { Schema } from 'mongoose';

const VolunteerOfferSchema = new Schema(
  {
    userId: {
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
    skillsOffered: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      required: true,
    },
    timeCommitment: {
      type: String,
      required: true,
    },
    preferredLocations: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
    },
    languages: {
      type: [String],
      default: [],
    },
    contactInfo: {
      email: String,
      phone: String,
    },
    interests: [{
      mosqueId: {
        type: Schema.Types.ObjectId,
        ref: 'Mosque',
      },
      interestedAt: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ['interested', 'contacted', 'matched'],
        default: 'interested',
      },
    }],
    status: {
      type: String,
      enum: ['active', 'matched', 'inactive'],
      default: 'active',
    },
    targetMosqueId: {
    type: Schema.Types.ObjectId,
    ref: 'Mosque',
    required: false, // Optional - can be general offer or mosque-specific
    },
    isGeneralOffer: {
    type: Boolean,
    default: true, // true for general offers, false for mosque-specific
    },
  },
  
  { timestamps: true }
);

let VolunteerOfferModel;
try {
  if (mongoose && mongoose.models) {
    VolunteerOfferModel = mongoose.models.VolunteerOffer || mongoose.model('VolunteerOffer', VolunteerOfferSchema);
  } else {
    VolunteerOfferModel = mongoose.model('VolunteerOffer', VolunteerOfferSchema);
  }
} catch (error) {
  console.error('Error initializing VolunteerOffer model:', error);
  VolunteerOfferModel = {
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve(null)
  };
}

export { VolunteerOfferModel as VolunteerOffer };
export default VolunteerOfferModel;
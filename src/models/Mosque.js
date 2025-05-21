import mongoose, { Schema } from 'mongoose';

const MosqueSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a mosque name'],
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
    },
    address: {
      type: String,
      required: [true, 'Please provide an address'],
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
    },
    state: {
      type: String,
      required: [true, 'Please provide a state'],
    },
    zipCode: {
      type: String,
      required: [true, 'Please provide a zip code'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    website: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    facilityFeatures: {
      type: [String],
    },
    prayerTimes: {
      type: Map,
      of: String,
    },
    imamId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create a 2dsphere index for geospatial queries
MosqueSchema.index({ location: '2dsphere' });

// Add error handling for model initialization
let MosqueModel;
try {
  if (mongoose && mongoose.models) {
    MosqueModel = mongoose.models.Mosque || mongoose.model('Mosque', MosqueSchema);
  } else {
    MosqueModel = mongoose.model('Mosque', MosqueSchema);
  }
} catch (error) {
  console.error('Error initializing Mosque model:', error);
  // Fallback model that won't crash the application
  MosqueModel = {
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve(null)
  };
}

export { MosqueModel as Mosque };
export default MosqueModel;

import mongoose, { Schema } from 'mongoose';

const MosqueSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  zipCode: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  website: {
    type: String,
  },
  facilityFeatures: [{
    type: String,
  }],
  prayerTimes: {
    fajr: String,
    dhuhr: String,
    asr: String,
    maghrib: String,
    isha: String,
  },
  imageUrl: {
    type: String,
  },
  imamId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
  verified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

let MosqueModel;
try {
  if (mongoose && mongoose.models) {
    MosqueModel = mongoose.models.Mosque || mongoose.model('Mosque', MosqueSchema);
  } else {
    MosqueModel = mongoose.model('Mosque', MosqueSchema);
  }
} catch (error) {
  console.error('Error initializing Mosque model:', error);
  MosqueModel = {
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve(null)
  };
}

export { MosqueModel as Mosque };
export default MosqueModel;
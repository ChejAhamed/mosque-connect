import mongoose, { Schema } from 'mongoose';

const HalalCertificationSchema = new Schema(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Business ID is required'],
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
    },
    businessType: {
      type: String,
      required: [true, 'Business type is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    postcode: {
      type: String,
      required: [true, 'Postcode is required'],
    },
    contactName: {
      type: String,
      required: [true, 'Contact name is required'],
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      trim: true,
    },
    details: {
      type: String,
      default: '',
    },
    supplierInfo: {
      type: String,
      default: '',
    },
    // Documents for verification (URLs or file paths)
    submittedDocuments: {
      type: [String],
      default: [],
    },
    // pending, under_review, approved, rejected
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    // Imam or admin reviewing the request
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewNotes: {
      type: String,
      default: '',
    },
    // For approved certifications
    certificateUrl: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create model with error handling
let HalalCertificationModel;
try {
  if (mongoose && mongoose.models) {
    HalalCertificationModel = mongoose.models.HalalCertification || mongoose.model('HalalCertification', HalalCertificationSchema);
  } else {
    HalalCertificationModel = mongoose.model('HalalCertification', HalalCertificationSchema);
  }
} catch (error) {
  console.error('Error initializing HalalCertification model:', error);
  // Fallback model that won't crash the application
  HalalCertificationModel = {
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve(null)
  };
}

export { HalalCertificationModel as HalalCertification };
export default HalalCertificationModel;

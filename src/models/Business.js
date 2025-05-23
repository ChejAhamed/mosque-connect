import mongoose, { Schema } from 'mongoose';

const BusinessSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a business name'],
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    type: {
      type: String,
      required: [true, 'Please provide a business type'],
    },
    address: {
      type: String,
      required: [true, 'Please provide an address'],
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
    },
    country: {
      type: String,
      required: [true, 'Please provide a country'],
      default: 'United Kingdom',
    },
    postalCode: {
      type: String,
      required: [true, 'Please provide a postal code'],
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
    images: {
      type: [String],
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    certificates: [
      {
        url: {
          type: String,
          required: true,
        },
        issueDate: {
          type: Date,
          required: true,
        },
        expiryDate: {
          type: Date,
          required: true,
        },
        isApproved: {
          type: Boolean,
          default: false,
        },
        approvedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        approvalDate: {
          type: Date,
        },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verificationNotes: {
      type: String,
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // Added products array
    products: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        price: {
          type: Number,
          required: true,
        },
        imageUrl: {
          type: String,
        },
        isHalal: {
          type: Boolean,
          default: true,
        },
        isAvailable: {
          type: Boolean,
          default: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    // Add announcements array
    announcements: [
      {
        title: {
          type: String,
          required: true,
          maxlength: [100, 'Title cannot be more than 100 characters'],
        },
        content: {
          type: String,
          required: true,
        },
        imageUrl: {
          type: String,
        },
        startDate: {
          type: Date,
          default: Date.now,
        },
        endDate: {
          type: Date,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        type: {
          type: String,
          enum: ['announcement', 'offer', 'promotion', 'news'],
          default: 'announcement',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
  },
  { timestamps: true }
);

BusinessSchema.index({ location: '2dsphere' });
BusinessSchema.index({ name: 'text', description: 'text', type: 'text' });

// Add error handling for model initialization
let BusinessModel;
try {
  if (mongoose && mongoose.models) {
    BusinessModel = mongoose.models.Business || mongoose.model('Business', BusinessSchema);
  } else {
    BusinessModel = mongoose.model('Business', BusinessSchema);
  }
} catch (error) {
  console.error('Error initializing Business model:', error);
  // Fallback model that won't crash the application
  BusinessModel = {
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve(null)
  };
}

export { BusinessModel as Business };
export default BusinessModel;

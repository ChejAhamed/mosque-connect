import mongoose from 'mongoose';

const businessHoursSchema = new mongoose.Schema({
  monday: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '17:00' },
    closed: { type: Boolean, default: false }
  },
  tuesday: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '17:00' },
    closed: { type: Boolean, default: false }
  },
  wednesday: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '17:00' },
    closed: { type: Boolean, default: false }
  },
  thursday: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '17:00' },
    closed: { type: Boolean, default: false }
  },
  friday: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '17:00' },
    closed: { type: Boolean, default: false }
  },
  saturday: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '17:00' },
    closed: { type: Boolean, default: false }
  },
  sunday: {
    open: { type: String, default: '09:00' },
    close: { type: String, default: '17:00' },
    closed: { type: Boolean, default: true }
  }
}, { _id: false });

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  category: {
    type: String,
    required: true,
    enum: [
      'restaurant', 'grocery', 'clothing', 'electronics', 'services',
      'healthcare', 'education', 'automotive', 'beauty', 'home_garden',
      'sports', 'books', 'jewelry', 'other'
    ]
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contact: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      trim: true
    },
    address: {
      street: {
        type: String,
        required: true,
        trim: true
      },
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      zipCode: {
        type: String,
        trim: true
      },
      country: {
        type: String,
        default: 'United States',
        trim: true
      },
      coordinates: {
        type: [Number] // [longitude, latitude] - removed duplicate index declaration
      }
    }
  },
  hours: {
    type: businessHoursSchema,
    default: () => ({})
  },
  images: {
    logo: {
      type: String,
      trim: true
    },
    banner: {
      type: String,
      trim: true
    },
    gallery: [{
      type: String,
      trim: true
    }]
  },
  socialMedia: {
    facebook: {
      type: String,
      trim: true
    },
    instagram: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    }
  },
  settings: {
    acceptsOrders: {
      type: Boolean,
      default: true
    },
    deliveryAvailable: {
      type: Boolean,
      default: false
    },
    pickupAvailable: {
      type: Boolean,
      default: true
    },
    onlinePayments: {
      type: Boolean,
      default: false
    }
  },
  verification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  stats: {
    totalProducts: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes - only declare once here
businessSchema.index({ owner: 1 });
businessSchema.index({ category: 1 });
businessSchema.index({ status: 1 });
businessSchema.index({ 'contact.address.city': 1 });
businessSchema.index({ 'contact.address.state': 1 });
businessSchema.index({ name: 'text', description: 'text', tags: 'text' });
businessSchema.index({ 'contact.address.coordinates': '2dsphere' });

// Virtual for products
businessSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'businessId'
});

// Virtual for offers
businessSchema.virtual('offers', {
  ref: 'Offer',
  localField: '_id',
  foreignField: 'businessId'
});

// Virtual for full address
businessSchema.virtual('fullAddress').get(function() {
  if (!this.contact?.address) return '';
  const addr = this.contact.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`.trim();
});

// Check if business is currently open
businessSchema.methods.isCurrentlyOpen = function() {
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const todayHours = this.hours[day];
  if (!todayHours || todayHours.closed) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

// Update product count
businessSchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  this.stats.totalProducts = await Product.countDocuments({ 
    businessId: this._id, 
    status: 'active' 
  });
  return this.save();
};

// Pre-save middleware
businessSchema.pre('save', function(next) {
  // Ensure coordinates are valid
  if (this.contact?.address?.coordinates) {
    const [lng, lat] = this.contact.address.coordinates;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      this.contact.address.coordinates = undefined;
    }
  }
  
  // Clean up tags
  if (this.tags) {
    this.tags = this.tags.filter(tag => tag.trim().length > 0);
  }
  
  next();
});

const Business = mongoose.models.Business || mongoose.model('Business', businessSchema);

export default Business;
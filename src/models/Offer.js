import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed_amount', 'buy_one_get_one', 'free_shipping'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: String,
    trim: true
  }],
  minimumPurchase: {
    type: Number,
    default: 0,
    min: 0
  },
  validFrom: {
    type: Date,
    required: true
  },
  validTo: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'draft'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  termsAndConditions: {
    type: String,
    maxlength: 1000
  },
  usageLimit: {
    type: Number,
    min: 1
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  customerLimit: {
    type: Number,
    min: 1
  },
  code: {
    type: String,
    trim: true,
    uppercase: true,
    sparse: true
  },
  autoApply: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0
  },
  image: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
offerSchema.index({ businessId: 1 });
offerSchema.index({ status: 1 });
offerSchema.index({ validFrom: 1, validTo: 1 });
offerSchema.index({ featured: 1 });
offerSchema.index({ code: 1 }, { unique: true, sparse: true });

// Virtual for offer validity
offerSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.validFrom && 
         now <= this.validTo &&
         (!this.usageLimit || this.usedCount < this.usageLimit);
});

// Virtual for days remaining
offerSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const timeDiff = this.validTo.getTime() - now.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
});

// Virtual for usage percentage
offerSchema.virtual('usagePercentage').get(function() {
  if (!this.usageLimit) return 0;
  return Math.round((this.usedCount / this.usageLimit) * 100);
});

// Method to check if offer is applicable to product
offerSchema.methods.isApplicableToProduct = function(productId, category) {
  // If no specific products or categories, apply to all
  if (this.applicableProducts.length === 0 && this.applicableCategories.length === 0) {
    return true;
  }
  
  // Check if product is specifically included
  if (this.applicableProducts.length > 0) {
    return this.applicableProducts.some(id => id.toString() === productId.toString());
  }
  
  // Check if product category is included
  if (this.applicableCategories.length > 0 && category) {
    return this.applicableCategories.includes(category);
  }
  
  return false;
};

// Method to calculate discount amount
offerSchema.methods.calculateDiscount = function(amount, productPrice) {
  if (!this.isValid) return 0;
  
  switch (this.discountType) {
    case 'percentage':
      return Math.min(amount * (this.discountValue / 100), amount);
    case 'fixed_amount':
      return Math.min(this.discountValue, amount);
    case 'free_shipping':
      // This would be handled separately in shipping calculation
      return 0;
    default:
      return 0;
  }
};

// Method to use offer (increment usage count)
offerSchema.methods.useOffer = async function() {
  if (!this.isValid) {
    throw new Error('Offer is not valid');
  }
  
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    throw new Error('Offer usage limit exceeded');
  }
  
  this.usedCount += 1;
  return this.save();
};

// Generate unique offer code
offerSchema.methods.generateCode = function() {
  if (this.code) return this.code;
  
  const prefix = this.businessId.toString().slice(-3).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.code = `${prefix}${random}`;
  return this.code;
};

// Pre-save middleware
offerSchema.pre('save', function(next) {
  // Auto-expire offers that have passed their end date
  const now = new Date();
  if (now > this.validTo && this.status === 'active') {
    this.status = 'expired';
  }
  
  // Auto-activate offers that have reached their start date
  if (now >= this.validFrom && now <= this.validTo && this.status === 'draft') {
    this.status = 'active';
  }
  
  // Validate discount value based on type
  if (this.discountType === 'percentage' && this.discountValue > 100) {
    this.discountValue = 100;
  }
  
  // Generate code if needed and this is a coded offer
  if (!this.code && this.discountType !== 'free_shipping') {
    this.generateCode();
  }
  
  next();
});

// Static method to find active offers for business
offerSchema.statics.findActiveOffers = function(businessId, options = {}) {
  const now = new Date();
  const query = {
    businessId,
    status: 'active',
    validFrom: { $lte: now },
    validTo: { $gte: now }
  };
  
  if (options.featured) {
    query.featured = true;
  }
  
  return this.find(query)
    .populate('applicableProducts', 'name price')
    .sort({ priority: -1, createdAt: -1 });
};

const Offer = mongoose.models.Offer || mongoose.model('Offer', offerSchema);

export default Offer;
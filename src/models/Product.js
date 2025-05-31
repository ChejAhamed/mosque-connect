import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 2000
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  images: [{
    url: {
      type: String,
      required: true,
      trim: true
    },
    alt: {
      type: String,
      trim: true
    },
    primary: {
      type: Boolean,
      default: false
    }
  }],
  inventory: {
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    unlimited: {
      type: Boolean,
      default: false
    },
    trackInventory: {
      type: Boolean,
      default: true
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
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
  }],
  specifications: {
    weight: String,
    dimensions: String,
    material: String,
    color: String,
    size: String,
    brand: String,
    model: String,
    warranty: String,
    custom: [{
      name: String,
      value: String
    }]
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    orders: {
      type: Number,
      default: 0
    },
    revenue: {
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
    }
  },
  variants: [{
    name: String, // e.g., "Size", "Color"
    options: [String] // e.g., ["Small", "Medium", "Large"]
  }],
  availability: {
    inStore: {
      type: Boolean,
      default: true
    },
    online: {
      type: Boolean,
      default: true
    },
    delivery: {
      type: Boolean,
      default: false
    },
    pickup: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ businessId: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ createdAt: -1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

// Virtual for primary image
productSchema.virtual('primaryImage').get(function() {
  if (!this.images || this.images.length === 0) return null;
  const primary = this.images.find(img => img.primary);
  return primary || this.images[0];
});

// Virtual for availability status
productSchema.virtual('availabilityStatus').get(function() {
  if (this.status !== 'active') return this.status;
  if (!this.inventory.unlimited && this.inventory.trackInventory && this.inventory.stock <= 0) {
    return 'out_of_stock';
  }
  if (!this.inventory.unlimited && this.inventory.trackInventory && this.inventory.stock <= this.inventory.lowStockThreshold) {
    return 'low_stock';
  }
  return 'in_stock';
});

// Check if product is in stock
productSchema.methods.isInStock = function(quantity = 1) {
  if (this.status !== 'active') return false;
  if (this.inventory.unlimited) return true;
  if (!this.inventory.trackInventory) return true;
  return this.inventory.stock >= quantity;
};

// Generate SEO slug
productSchema.methods.generateSlug = function() {
  if (!this.name) return;
  
  let slug = this.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Add business ID to ensure uniqueness
  slug = `${slug}-${this.businessId.toString().slice(-6)}`;
  
  this.seo = this.seo || {};
  this.seo.slug = slug;
};

// Update inventory after sale
productSchema.methods.updateInventoryAfterSale = function(quantity = 1) {
  if (!this.inventory.trackInventory || this.inventory.unlimited) return this;
  
  this.inventory.stock = Math.max(0, this.inventory.stock - quantity);
  this.stats.orders += 1;
  this.stats.revenue += this.price * quantity;
  
  if (this.inventory.stock === 0) {
    this.status = 'out_of_stock';
  }
  
  return this.save();
};

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Ensure at least one image is marked as primary
  if (this.images && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.primary);
    if (!hasPrimary) {
      this.images[0].primary = true;
    }
  }
  
  // Generate slug if not exists
  if (!this.seo?.slug) {
    this.generateSlug();
  }
  
  // Clean up tags
  if (this.tags) {
    this.tags = this.tags.filter(tag => tag.trim().length > 0);
  }
  
  // Validate price
  if (this.compareAtPrice && this.compareAtPrice <= this.price) {
    this.compareAtPrice = undefined;
  }
  
  next();
});

// Post-save middleware to update business product count
productSchema.post('save', async function() {
  try {
    const Business = mongoose.model('Business');
    const business = await Business.findById(this.businessId);
    if (business) {
      await business.updateProductCount();
    }
  } catch (error) {
    console.error('Error updating business product count:', error);
  }
});

// Post-remove middleware to update business product count
productSchema.post('remove', async function() {
  try {
    const Business = mongoose.model('Business');
    const business = await Business.findById(this.businessId);
    if (business) {
      await business.updateProductCount();
    }
  } catch (error) {
    console.error('Error updating business product count:', error);
  }
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
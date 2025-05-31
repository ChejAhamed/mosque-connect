import mongoose from 'mongoose';

const mosqueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  imam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contact: {
    phone: String,
    email: String,
    website: String,
    address: {
      street: {
        type: String,
        required: true
      },
      city: String,
      state: String,
      zipCode: String,
      country: {
        type: String,
        default: 'United States'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        validate: {
          validator: function(v) {
            return v.length === 2;
          },
          message: 'Coordinates must be an array of [longitude, latitude]'
        }
      }
    }
  },
  capacity: {
    type: Number,
    min: 1
  },
  services: [{
    type: String,
    enum: [
      'Daily Prayers',
      'Friday Prayers', 
      'Islamic Education',
      'Quran Classes',
      'Youth Programs',
      'Women Programs',
      'Community Events',
      'Marriage Services',
      'Funeral Services',
      'Counseling',
      'Food Bank',
      'Library'
    ]
  }],
  facilities: [String],
  prayerTimes: {
    fajr: String,
    dhuhr: String,
    asr: String,
    maghrib: String,
    isha: String,
    jumma: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verified: {
    type: Boolean,
    default: false
  },
  stats: {
    totalMembers: {
      type: Number,
      default: 0
    },
    totalEvents: {
      type: Number,
      default: 0
    },
    totalVolunteers: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
mosqueSchema.index({ imam: 1 });
mosqueSchema.index({ status: 1 });
mosqueSchema.index({ 'contact.address.city': 1 });
mosqueSchema.index({ 'contact.address.state': 1 });
mosqueSchema.index({ name: 'text', description: 'text' });
mosqueSchema.index({ 'contact.address.coordinates': '2dsphere' });

// Virtual for full address
mosqueSchema.virtual('fullAddress').get(function() {
  if (!this.contact?.address) return '';
  const addr = this.contact.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}`.trim();
});

const Mosque = mongoose.models.Mosque || mongoose.model('Mosque', mosqueSchema);

export default Mosque;
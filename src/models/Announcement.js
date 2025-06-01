import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['event', 'general', 'urgent', 'promotion', 'sale', 'news', 'service', 'system', 'maintenance', 'update'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: false // Optional for admin announcements
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  targetAudience: {
    type: String,
    enum: ['all', 'members', 'visitors', 'businesses'],
    default: 'all'
  },
  attachments: [{
    url: String,
    filename: String,
    fileType: String
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  isAdminAnnouncement: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for better performance
announcementSchema.index({ businessId: 1, createdAt: -1 });
announcementSchema.index({ type: 1, isActive: 1 });
announcementSchema.index({ isAdminAnnouncement: 1, isActive: 1 });

const Announcement = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

export default Announcement;
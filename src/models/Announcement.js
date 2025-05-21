import mongoose, { Schema } from 'mongoose';

const AnnouncementSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an announcement title'],
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide content'],
    },
    mosqueId: {
      type: Schema.Types.ObjectId,
      ref: 'Mosque',
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    expiryDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Create index for mosque announcements
AnnouncementSchema.index({ mosqueId: 1 });
// Create index for pinned announcements
AnnouncementSchema.index({ isPinned: 1 });

// Add error handling for model initialization
let AnnouncementModel;
try {
  if (mongoose && mongoose.models) {
    AnnouncementModel = mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
  } else {
    AnnouncementModel = mongoose.model('Announcement', AnnouncementSchema);
  }
} catch (error) {
  console.error('Error initializing Announcement model:', error);
  // Fallback model that won't crash the application
  AnnouncementModel = {
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve(null)
  };
}

export default AnnouncementModel;

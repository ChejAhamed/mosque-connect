import mongoose, { Schema } from 'mongoose';

const EventSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an event title'],
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date'],
    },
    endDate: {
      type: Date,
    },
    location: {
      type: String,
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
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    volunteers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        role: {
          type: String,
        },
      },
    ],
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: [
        'fundraising',
        'class',
        'lecture',
        'community',
        'charity',
        'other',
      ],
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Create index for querying upcoming events
EventSchema.index({ startDate: 1 });
// Create index for mosque events
EventSchema.index({ mosqueId: 1 });

// Add error handling for model initialization
let EventModel;
try {
  if (mongoose && mongoose.models) {
    EventModel = mongoose.models.Event || mongoose.model('Event', EventSchema);
  } else {
    EventModel = mongoose.model('Event', EventSchema);
  }
} catch (error) {
  console.error('Error initializing Event model:', error);
  // Fallback model that won't crash the application
  EventModel = {
    find: () => Promise.resolve([]),
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve(null)
  };
}

export default EventModel;

import mongoose, { Schema } from 'mongoose';

const VolunteerApplicationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mosqueId: {
      type: Schema.Types.ObjectId,
      ref: 'Mosque',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    motivationMessage: {
      type: String,
      required: [true, 'Please provide your motivation'],
    },
    category: {
      type: String,
      required: true,
      enum: ['cleaning', 'education', 'events', 'technical', 'administration', 'outreach', 'other'],
    },
    skillsOffered: {
      type: [String],
      default: [],
    },
    availability: {
      type: String,
      required: true,
    },
    timeCommitment: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
    },
    languages: {
      type: [String],
      default: [],
    },
    contactInfo: {
      email: {
        type: String,
        required: true,
      },
      phone: String,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    mosqueResponse: {
      respondedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      respondedAt: {
        type: Date,
      },
      message: String,
      notes: String,
    },
    adminNotes: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

VolunteerApplicationSchema.index({ mosqueId: 1, status: 1 });
VolunteerApplicationSchema.index({ userId: 1 });
VolunteerApplicationSchema.index({ createdAt: -1 });
VolunteerApplicationSchema.index({ status: 1 });

export default mongoose.models.VolunteerApplication || mongoose.model('VolunteerApplication', VolunteerApplicationSchema);
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'imam', 'business', 'admin', 'super_admin'],
      default: 'user',
    },
    volunteerStatus: {
      type: String,
      enum: ['not_volunteer', 'pending', 'active'],
      default: 'not_volunteer',
    },
    profilePicture: {
      type: String,
    },
    phone: {
      type: String,
    },
    city: {
      type: String,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    wantsToVolunteer: {
      type: Boolean,
      default: false,
    },
    // Admin-specific fields
    permissions: {
      type: Map,
      of: {
        read: { type: Boolean, default: false },
        write: { type: Boolean, default: false },
        delete: { type: Boolean, default: false }
      },
      default: () => ({})
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    // Notification preferences
    notificationPreferences: {
      email: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
      push: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

// Index for faster lookups
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });

let UserModel;
try {
  if (mongoose && mongoose.models) {
    UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
  } else {
    UserModel = mongoose.model('User', UserSchema);
  }
} catch (error) {
  console.error('Error initializing User model:', error);
  UserModel = {
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve(null),
    find: () => Promise.resolve([]),
    findByIdAndUpdate: () => Promise.resolve(null),
    findByIdAndDelete: () => Promise.resolve(null)
  };
}

export { UserModel as User };
export default UserModel;

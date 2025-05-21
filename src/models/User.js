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
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
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
      enum: ['admin', 'imam', 'volunteer', 'business', 'user'],
      default: 'user',
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
  },
  { timestamps: true }
);

// Don't overwrite the model if it's already defined
// Add try/catch to handle cases where mongoose.models might be undefined
let UserModel;
try {
  // Check if mongoose and mongoose.models are defined
  if (mongoose && mongoose.models) {
    UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
  } else {
    // Fallback in case mongoose.models is undefined
    UserModel = mongoose.model('User', UserSchema);
  }
} catch (error) {
  console.error('Error initializing User model:', error);
  // Provide a fallback empty model that won't crash the application
  UserModel = {
    findOne: () => Promise.resolve(null),
    findById: () => Promise.resolve(null),
    create: () => Promise.resolve(null)
  };
}

export { UserModel as User };
export default UserModel;

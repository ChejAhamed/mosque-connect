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
      enum: ['admin', 'imam', 'business', 'user'],
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
  },
  { timestamps: true }
);

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
    create: () => Promise.resolve(null)
  };
}

export { UserModel as User };
export default UserModel;

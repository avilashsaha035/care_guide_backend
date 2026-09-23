import mongoose, { Document, Schema, Model } from 'mongoose';

export type UserRole = 'user' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  interests: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    interests: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================================
// DATABASE INDEXING REQUIREMENTS (Strictly required for queries & review)
// Note: You must use the schema.index method for defining indexes in your code
// so they are visible during review.
// =========================================================================

// 1. Read / Login Query Index: Fast lookup and unique constraint for authentication
userSchema.index({ email: 1 }, { unique: true });

// 2. Admin List Operation Indexing: Paginated retrieval of users ordered by newest
userSchema.index({ createdAt: -1 });

// 3. Scenario 1 Aggregation Index: Multikey index supporting $unwind / filtering by user interests
userSchema.index({ interests: 1 });

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

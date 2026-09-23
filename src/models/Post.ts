import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IPost extends Document {
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author userId is required'],
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================================
// DATABASE INDEXING REQUIREMENTS
// Supports Scenario 2 ($lookup aggregation joining foreignField 'userId')
// and sorting posts by creation timestamp
// =========================================================================
postSchema.index({ userId: 1, createdAt: -1 });

export const Post: Model<IPost> = mongoose.model<IPost>('Post', postSchema);

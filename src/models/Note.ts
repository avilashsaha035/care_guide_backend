import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner userId is required'],
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================================
// DATABASE INDEXING REQUIREMENTS
// Note: You must use the schema.index method for defining indexes in your code
// so they are visible during review.
// =========================================================================

// 1. User List Operation Indexing (Compound Index):
// Equality on userId, Sort on createdAt: allows efficient paginated retrieval of a user's notes without in-memory sorting
noteSchema.index({ userId: 1, createdAt: -1 });

// 2. Admin List Operation Indexing:
// Supports Admin viewing all users' notes paginated and sorted by newest
noteSchema.index({ createdAt: -1 });

export const Note: Model<INote> = mongoose.model<INote>('Note', noteSchema);

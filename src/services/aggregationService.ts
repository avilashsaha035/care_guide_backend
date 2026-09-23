import mongoose from 'mongoose';
import { User } from '../models/User.js';

export class AggregationService {
  /**
   * Scenario 1: Group by Interests
   * Constraint: Exactly one collection.aggregate() call.
   * Supported by Index: userSchema.index({ interests: 1 })
   */
  async getGroupedByInterests() {
    return User.aggregate([
      // 1. Deconstruct array of interests
      { $unwind: '$interests' },

      // 2. Group by interest
      {
        $group: {
          _id: '$interests',
          interest: { $first: '$interests' },
          count: { $sum: 1 },
          users: {
            $push: {
              _id: '$_id',
              name: '$name',
              email: '$email',
              role: '$role',
            },
          },
        },
      },

      // 3. Sort by highest frequency, then alphabetically
      { $sort: { count: -1, _id: 1 } },
    ]);
  }

  /**
   * Scenario 2: User Posts ($lookup)
   * Constraint: Single aggregation pipeline with a $lookup stage.
   * Supported by Index: postSchema.index({ userId: 1, createdAt: -1 })
   */
  async getUserPostsWithLookup(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const error: any = new Error('Invalid target user ID format.');
      error.statusCode = 400;
      throw error;
    }

    const targetObjectId = new mongoose.Types.ObjectId(userId);

    const result = await User.aggregate([
      // Stage 1: Match target user (uses _id primary key index)
      { $match: { _id: targetObjectId } },

      // Stage 2: $lookup stage joining separate 'posts' collection
      // (supported by postSchema.index({ userId: 1, createdAt: -1 }))
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts',
        },
      },

      // Stage 3: Clean projection
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          interests: 1,
          posts: 1,
          postCount: { $size: '$posts' },
        },
      },
    ]);

    if (!result || result.length === 0) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return result[0];
  }
}

export const aggregationService = new AggregationService();

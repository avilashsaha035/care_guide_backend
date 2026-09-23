import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Post } from '../models/Post.js';

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    const userId = req.user?.userId;

    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Post title and content are required.' });
      return;
    }

    const post = await Post.create({
      title: title.trim(),
      content: content.trim(),
      userId: new mongoose.Types.ObjectId(userId),
    });

    res.status(201).json({
      success: true,
      message: 'Post published successfully.',
      data: post,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create post.' });
  }
};

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      Post.find()
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to list posts.' });
  }
};

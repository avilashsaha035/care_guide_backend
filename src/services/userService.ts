import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, IUser, UserRole } from '../models/User.js';
import { Note } from '../models/Note.js';
import { Post } from '../models/Post.js';
import { PaginatedResult } from './noteService.js';

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  interests?: string[];
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  role?: UserRole;
  interests?: string[];
}

export class UserService {
  async getPaginatedUsers(page: number = 1, limit: number = 10): Promise<PaginatedResult<IUser>> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const skip = (safePage - 1) * safeLimit;

    // Supported by index: userSchema.index({ createdAt: -1 })
    const [items, totalItems] = await Promise.all([
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      User.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalItems / safeLimit) || 1;

    return {
      items: items as unknown as IUser[],
      pagination: {
        totalItems,
        totalPages,
        currentPage: safePage,
        limit: safeLimit,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }

  async getUserById(id: string): Promise<IUser> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid user ID format.');
      error.statusCode = 400;
      throw error;
    }

    // Supported by default indexed read on _id
    const user = await User.findById(id).select('-password').lean();
    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    return user as unknown as IUser;
  }

  async createUser(dto: CreateUserDTO): Promise<IUser> {
    const normalizedEmail = dto.email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      const error: any = new Error('Email is already registered.');
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    return User.create({
      name: dto.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: dto.role === 'admin' ? 'admin' : 'user',
      interests: Array.isArray(dto.interests) ? dto.interests : [],
    });
  }

  async updateUser(id: string, dto: UpdateUserDTO): Promise<IUser> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid user ID format.');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findById(id);
    if (!user) {
      const error: any = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    if (dto.name !== undefined) user.name = dto.name.trim();
    if (dto.role !== undefined && ['user', 'admin'].includes(dto.role)) user.role = dto.role;
    if (dto.interests !== undefined && Array.isArray(dto.interests)) user.interests = dto.interests;

    if (dto.email && dto.email.toLowerCase().trim() !== user.email) {
      const emailTaken = await User.findOne({ email: dto.email.toLowerCase().trim() });
      if (emailTaken) {
        const error: any = new Error('Email address already in use.');
        error.statusCode = 409;
        throw error;
      }
      user.email = dto.email.toLowerCase().trim();
    }

    await user.save();
    return user;
  }

  async deleteUserWithCascade(id: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error: any = new Error('Invalid user ID format.');
      error.statusCode = 400;
      throw error;
    }

    let session: mongoose.ClientSession | null = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();

      const user = await User.findByIdAndDelete(id, { session });
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        const error: any = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }

      await Note.deleteMany({ userId: id }, { session });
      await Post.deleteMany({ userId: id }, { session });

      await session.commitTransaction();
      session.endSession();
    } catch (txError: any) {
      if (session) {
        try {
          await session.abortTransaction();
          session.endSession();
        } catch (_) {}
      }

      // Standalone MongoDB fallback
      const user = await User.findByIdAndDelete(id);
      if (!user) {
        const error: any = new Error('User not found.');
        error.statusCode = 404;
        throw error;
      }
      await Note.deleteMany({ userId: id });
      await Post.deleteMany({ userId: id });
    }
  }
}

export const userService = new UserService();

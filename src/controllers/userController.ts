import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService.js';

export const getUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const data = await userService.getPaginatedUsers(page, limit);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await userService.getUserById(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role, interests } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const user = await userService.createUser({ name, email, password, role, interests });

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { name, email, role, interests } = req.body;

    const user = await userService.updateUser(id, { name, email, role, interests });

    res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        interests: user.interests,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Prevent admin from self-deletion
    if (req.user?.userId === id) {
      res.status(400).json({ success: false, message: 'Admins cannot delete their own account.' });
      return;
    }

    await userService.deleteUserWithCascade(id);

    res.status(200).json({
      success: true,
      message: 'User and associated data deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

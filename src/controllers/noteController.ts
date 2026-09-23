import { Request, Response, NextFunction } from 'express';
import { noteService } from '../services/noteService.js';

export const getNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const isAdmin = req.user?.role === 'admin';
    const viewAll = req.query.all === 'true' && isAdmin;
    const userId = req.user?.userId as string;

    const data = await noteService.getPaginatedNotes(userId, isAdmin, viewAll, page, limit);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId as string;
    const isAdmin = req.user?.role === 'admin';

    const note = await noteService.getNoteById(id, userId, isAdmin);

    res.status(200).json({
      success: true,
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, content } = req.body;
    const userId = req.user?.userId as string;

    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Note title and content are required.' });
      return;
    }

    const note = await noteService.createNote({ title, content, userId });

    res.status(201).json({
      success: true,
      message: 'Note created successfully.',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, content } = req.body;
    const userId = req.user?.userId as string;
    const isAdmin = req.user?.role === 'admin';

    const note = await noteService.updateNote(id, userId, isAdmin, { title, content });

    res.status(200).json({
      success: true,
      message: 'Note updated successfully.',
      data: note,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId as string;
    const isAdmin = req.user?.role === 'admin';

    await noteService.deleteNote(id, userId, isAdmin);

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

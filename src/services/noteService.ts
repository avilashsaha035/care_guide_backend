import mongoose from 'mongoose';
import { Note, INote } from '../models/Note.js';

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateNoteDTO {
  title: string;
  content: string;
  userId: string;
}

export interface UpdateNoteDTO {
  title?: string;
  content?: string;
}

export class NoteService {
  async getPaginatedNotes(
    userId: string,
    isAdmin: boolean,
    viewAll: boolean,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<INote>> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.max(1, Math.min(100, limit));
    const skip = (safePage - 1) * safeLimit;

    // Filter strategy:
    // If Admin viewAll is true -> query {} (supported by index: { createdAt: -1 })
    // Standard query -> query { userId } (supported by compound index: { userId: 1, createdAt: -1 })
    const filter = viewAll && isAdmin ? {} : { userId: new mongoose.Types.ObjectId(userId) };

    const [items, totalItems] = await Promise.all([
      Note.find(filter)
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Note.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / safeLimit) || 1;

    return {
      items: items as unknown as INote[],
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

  async getNoteById(noteId: string, currentUserId: string, isAdmin: boolean): Promise<INote> {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      const error: any = new Error('Invalid note identifier format.');
      error.statusCode = 400;
      throw error;
    }

    // Supported by default indexed read on _id
    const note = await Note.findById(noteId).populate('userId', 'name email role').lean();
    if (!note) {
      const error: any = new Error('Note not found.');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = note.userId && (note.userId as any)._id.toString() === currentUserId;
    if (!isOwner && !isAdmin) {
      const error: any = new Error('Access denied. You do not own this note.');
      error.statusCode = 403;
      throw error;
    }

    return note as unknown as INote;
  }

  async createNote(dto: CreateNoteDTO): Promise<INote> {
    return Note.create({
      title: dto.title.trim(),
      content: dto.content.trim(),
      userId: new mongoose.Types.ObjectId(dto.userId),
    });
  }

  async updateNote(
    noteId: string,
    currentUserId: string,
    isAdmin: boolean,
    dto: UpdateNoteDTO
  ): Promise<INote> {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      const error: any = new Error('Invalid note identifier format.');
      error.statusCode = 400;
      throw error;
    }

    const note = await Note.findById(noteId);
    if (!note) {
      const error: any = new Error('Note not found.');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = note.userId.toString() === currentUserId;
    if (!isOwner && !isAdmin) {
      const error: any = new Error('Access denied. You do not own this note.');
      error.statusCode = 403;
      throw error;
    }

    if (dto.title !== undefined) note.title = dto.title.trim();
    if (dto.content !== undefined) note.content = dto.content.trim();

    await note.save();
    return note;
  }

  async deleteNote(noteId: string, currentUserId: string, isAdmin: boolean): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      const error: any = new Error('Invalid note identifier format.');
      error.statusCode = 400;
      throw error;
    }

    const note = await Note.findById(noteId);
    if (!note) {
      const error: any = new Error('Note not found.');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = note.userId.toString() === currentUserId;
    if (!isOwner && !isAdmin) {
      const error: any = new Error('Access denied. You do not own this note.');
      error.statusCode = 403;
      throw error;
    }

    await Note.findByIdAndDelete(noteId);
  }
}

export const noteService = new NoteService();

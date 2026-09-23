import { Request, Response, NextFunction } from 'express';
import { aggregationService } from '../services/aggregationService.js';

/**
 * Scenario 1: Group by Interests
 * Constraint: Exactly one collection.aggregate() call.
 */
export const getGroupedByInterests = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await aggregationService.getGroupedByInterests();

    res.status(200).json({
      success: true,
      message: 'Users grouped by interests retrieved via single aggregation pipeline.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Scenario 2: User Posts ($lookup)
 * Constraint: Single aggregation pipeline with a $lookup stage.
 */
export const getUserPostsWithLookup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId as string;

    const result = await aggregationService.getUserPostsWithLookup(userId);

    res.status(200).json({
      success: true,
      message: 'User posts retrieved via single aggregation pipeline with $lookup.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

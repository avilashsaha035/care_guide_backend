import { Router } from 'express';
import {
  getGroupedByInterests,
  getUserPostsWithLookup,
} from '../controllers/aggregationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Protected by token so authenticated users / reviewers can test aggregations
router.use(authenticateToken);

// Scenario 1: Group by Interests
router.get('/grouped-by-interests', getGroupedByInterests);

// Scenario 2: User Posts ($lookup)
router.get('/user-posts/:userId', getUserPostsWithLookup);

export default router;

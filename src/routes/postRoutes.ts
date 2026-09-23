import { Router } from 'express';
import { createPost, getPosts } from '../controllers/postController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', getPosts);
router.post('/', authenticateToken, createPost);

export default router;

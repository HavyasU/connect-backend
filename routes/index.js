import { Router } from "express";
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import postRoutes from './postRoutes.js';
import adminRoutes from './adminRoutes.js';
import chatRoutes from "./chatRoutes.js";
const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/admin', adminRoutes);
router.use('/chats', chatRoutes);

export default router;
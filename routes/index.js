import { Router } from "express";
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import postRoutes from './postRoutes.js';
import adminRoutes from './adminRoutes.js';
import chatRoutes from "./chatRoutes.js";
const router = Router();
// Prefix all routes with version for future evolution
// Final mount in app is /api, so these become /api/v1/*
router.use('/v1/auth', authRoutes);
router.use('/v1/users', userRoutes);
router.use('/v1/posts', postRoutes);
router.use('/v1/admin', adminRoutes);
router.use('/v1/chats', chatRoutes);

// Temporary legacy mounts for backward compatibility; remove after clients migrate
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/admin', adminRoutes);
router.use('/chats', chatRoutes);

export default router;
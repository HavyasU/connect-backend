import express from 'express';
import userAuth from '../middleware/authMiddleware.js';
import {
  commentPost,
  createPost,
  deletePost,
  getComments,
  getPost,
  getPosts,
  getUserPost,
  likePost,
  likePostComment,
  replyPostComment,
} from '../controllers/postController.js';
import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

import uploads from '../utils/uploads.js';

// Create post with media upload
router.post('/create-post', uploads.single('media'), userAuth, createPost);

// Get all posts
router.post('/', userAuth, getPosts);

// Get single post
router.get('/:id', userAuth, getPost);

// Get user posts
router.get('/get-user-post/:id', userAuth, getUserPost);

// Get comments
router.get('/comments/:postId', getComments);

// Like and comment on posts
router.post('/like/:id', userAuth, likePost);
router.post('/like-comment/:id/:rid?', userAuth, likePostComment);
router.post('/comment/:id', userAuth, commentPost);
router.post('/reply-comment/:id', userAuth, replyPostComment);

// Delete post
router.delete('/delete-post/:id', userAuth, deletePost);

export default router;

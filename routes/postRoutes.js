import express from "express";
import userAuth from "../middleware/authMiddleware.js";
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
} from "../controllers/postController.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  }
});
const upload = multer({
  storage: storage
});

// crete post
router.post("/create-post", upload.single('media'), userAuth, createPost);
// get posts
router.post("/", userAuth, getPosts);
router.post("/:id", userAuth, getPost);

router.post("/get-user-post/:id", userAuth, getUserPost);

// get comments
router.get("/comments/:postId", getComments);

//like and comment on posts
router.post("/like/:id", userAuth, likePost);
router.post("/like-comment/:id/:rid?", userAuth, likePostComment);
router.post("/comment/:id", userAuth, commentPost);
router.post("/reply-comment/:id", userAuth, replyPostComment);

//delete post
router.delete("/delete-post/:id", userAuth, deletePost);

export default router;

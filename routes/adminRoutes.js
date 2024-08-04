import { Router } from "express";
import { adminDeletePost, adminGetAnalytics, adminGetComments, adminGetPosts, adminGetUsers, adminLogin } from "../controllers/adminController.js";
import { checkAdminToken } from "../middleware/adminAuthMiddleware.js";

const router = Router();

router.post('/login', adminLogin);
router.post('/posts', checkAdminToken, adminGetPosts);
router.get('/comments/:postId', checkAdminToken, adminGetComments);
router.get('/users', checkAdminToken, adminGetUsers);
router.get('/analytics', checkAdminToken, adminGetAnalytics);
router.post('/post/delete/:id', checkAdminToken, adminDeletePost);
// router.post('/register', register);
// router.post('/login', login);
// router.get('/hey', (req, res) => {
//     res.send("hey");
// });

export default router;
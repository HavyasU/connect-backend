import express from "express";
import path from "path";
import {
    acceptRequest,
    changePassword,
    friendRequest,
    getFriendRequest,
    getUser,
    profileViews,
    requestPasswordReset,
    resetPassword,
    suggestedFriends,
    updateUser,
    verifyEmail,
} from "../controllers/userController.js";
import userAuth from "../middleware/authMiddleware.js";
const router = express.Router();
import multer from "multer";


const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`);
    }
});

const upload = multer({
    storage: storage
});

//verify email
router.post("/verify-email", verifyEmail);

// PASSWORD RESET
router.post("/request-resetpassword", requestPasswordReset); //requests an otp to send
router.post("/resetpassword", changePassword);

// user routes
router.post("/get-user/:id?", userAuth, getUser);
router.put("/update-user", upload.single('profilePhoto'), userAuth, updateUser);

// friend request
router.post("/friend-request", userAuth, friendRequest);
router.post("/get-friend-request", userAuth, getFriendRequest);

// accept / deny friend request
router.post("/accept-request", userAuth, acceptRequest);

// view profile
router.post("/profile-view", userAuth, profileViews);

//suggested friends
router.post("/suggested-friends", userAuth, suggestedFriends);



export default router;

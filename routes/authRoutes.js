import { Router } from "express";
import { login, register } from "../controllers/authController.js";
import userAuth from "../middleware/authMiddleware.js";

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/checkToken', userAuth, (req, res) => {
    console.log("User checked");
    res.json({
        success: true,
        message: "Token is Valid"
    });
});
// router.get('/hey', (req, res) => {
//     res.send("hey");
// });

export default router;
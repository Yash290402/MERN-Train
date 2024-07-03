import { Router } from "express";
import { feedback } from "../controller/feedback.js";
import { registerUser, login, logout } from "../controller/user.controller.js"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router()


router.route('/feedback').post(feedback)

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },

    ]), registerUser)

    
router.route('/login').post(login)

router.route('/logout').post(verifyJWT, logout)

export default router
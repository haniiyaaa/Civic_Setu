import express from "express";
import { getUserProfile } from "../controllers/userProfile.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { updateAddress } from "../controllers/userProfile.controller.js";
import { requestPasswordResetOtp } from "../controllers/auth.controller.js";
import { verifyPasswordResetOtp } from "../controllers/auth.controller.js";

const router = express.Router();

router.get("/getUserProfile", authMiddleware, getUserProfile);
router.put("/updateAddress", authMiddleware, updateAddress);
router.post("/resetPassword/reqOtp", authMiddleware, requestPasswordResetOtp);
router.post("/resetPassword/verifyOtp", authMiddleware, verifyPasswordResetOtp);
export default router;
import express from "express";
const router = express.Router();


// const {
//   requestOtp,
//   verifyOtp,
//   generateAdminOtp,
//   login,
//   requestPasswordResetOtp,
//   verifyPasswordResetOtp
// } = require("../controllers/auth.controller");

import {
  requestPasswordResetOtp,
  verifyPasswordResetOtp,
  requestOtp,
  verifyOtp,
  generateAdminOtp,
  login,
  verifyAdminOtp
} from "../controllers/auth.controller.js";


// Citizen signup (OTP flow)
router.post("/citizen/reqOtp", requestOtp);
router.post("/citizen/verifyOtp", verifyOtp);


// Admin signup (requires secret key + OTP)
router.post("/admin/generateOtp", generateAdminOtp);
router.post("/admin/verifyAdminOtp", verifyAdminOtp);


// Login
router.post("/citizen/signin", login);
router.post("/admin/signin", login);



// Forgot Password
router.post("/forgotPass/reqOtp", requestPasswordResetOtp);
router.post("/forgotPass/verifyOtp", verifyPasswordResetOtp);


export default router;

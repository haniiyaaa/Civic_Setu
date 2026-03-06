const express = require("express");
const router = express.Router();

const {
  requestOtp,
  verifyOtp,
  generateAdminOtp,
  login,
  requestPasswordResetOtp,
  verifyPasswordResetOtp
} = require("../controllers/auth.controller");


// Citizen signup (OTP flow)
router.post("/citizen/reqOtp", citizenRequestOtp);
router.post("/citizen/verifyOtp", citizenVerifyOtp);


// Admin signup (requires secret key + OTP)
router.post("/admin/generateOtp", adminGenerateOtp);


// Login
router.post("/citizen/signin", citizenLogin);
router.post("/admin/signin", adminLogin);


// Forgot Password
router.post("/forgotPass/reqOtp", requestPasswordResetOtp);
router.post("/forgotPass/verifyOtp", verifyPasswordResetOtp);


module.exports = router;
const User = require("../models/user");
const Otp = require("../models/otpSchema");

const generateOTP = require("../utils/otp");
const sendEmail = require("../utils/sendEmail");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.requestOtp = async (req, res) => {

  try {

    const { email } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const otp = generateOTP();

    await Otp.create({
      email,
      otp
    });

    await sendEmail(email, otp);

    res.status(200).json({
      message: "OTP sent successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

exports.verifyOtp = async (req, res) => {

  try {

    const { name, email, phone, address, password, otp } = req.body;

    // Find OTP record by email
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP expired or not found"
      });
    }

    // Compare OTP
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // Check if user already exists (safety check)
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      role: "citizen"
    });

    // Delete OTP after successful verification
    await Otp.deleteMany({ email });

    res.status(201).json({
      message: "User registered successfully",
      user: newUser
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

exports.generateAdminOtp = async (req, res) => {

  try {

    const { email, adminKey } = req.body;

    // check admin key
    if (!adminKey || adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({
        message: "Invalid admin secret key"
      });
    }

    // check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // delete old otp if exists
    await Otp.deleteMany({ email });

    // generate otp
    const otp = generateOTP();

    // store otp
    await Otp.create({
      email,
      otp
    });

    // send email
    await sendEmail(email, otp);

    res.status(200).json({
      message: "Admin OTP sent successfully"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

exports.verifyAdminOtp = async (req, res) => {

  try {

    const { name, email, phone, address, password, otp } = req.body;

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP expired or not found"
      });
    }

    // compare otp
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create admin
    const admin = await User.create({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      role: "admin"
    });

    // delete otp
    await Otp.deleteMany({ email });

    res.status(201).json({
      message: "Admin registered successfully",
      user: admin
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

exports.login = async (req, res) => {

  try {

    const { email, password } = req.body;

    // check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // create jwt token
    const token = jwt.sign(

      {
        id: user._id,
        role: user.role
      },

      process.env.JWT_SECRET,

      { expiresIn: "1d" }

    );

    res.status(200).json({

      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }

    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};




exports.requestPasswordResetOtp = async (req, res) => {

  try {

    const { email } = req.body;

    // check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // remove old OTPs
    await Otp.deleteMany({ email });

    // generate OTP
    const otp = generateOTP();

    // store OTP
    await Otp.create({
      email,
      otp
    });

    // send email
    await sendEmail(email, otp);

    res.status(200).json({
      message: "OTP sent for password reset"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};



exports.verifyPasswordResetOtp = async (req, res) => {

  try {

    const { email, otp, newPassword } = req.body;

    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord) {
      return res.status(400).json({
        message: "OTP expired or not found"
      });
    }

    // compare otp
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update password
    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword }
    );

    // delete OTP
    await Otp.deleteMany({ email });

    res.status(200).json({
      message: "Password reset successful"
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};
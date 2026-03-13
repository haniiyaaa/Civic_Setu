//const User = require("../models/user");
import User from "../models/user.js";
import Otp from "../models/otpSchema.js";

import generateOTP from "../utils/otp.js";
import {sendEmail} from "../utils/sendEmail.js";  
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { email, z } from "zod";
// const Otp = require("../models/otpSchema");

// const generateOTP = require("../utils/otp");
// const sendEmail = require("../utils/sendEmail");

// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const z = require("zod");
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100)
});

const requestOtpSchema = z.object({
  email: z.string().email()
});

const generateAdminOtpSchema = z.object({
  email: z.string().email(),
  adminKey: z.string().min(6)
});

const verifyOtpSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  address: z.string().min(10).max(200),
  password: z.string().min(6).max(100),
  otp: z.string().length(6)
});

 const newpass = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6).max(100)
 });



export const requestOtp = async (req, res) => {

  try {

    const { email } = req.body;
    const { success, error } = requestOtpSchema.safeParse({ email });

    if (!success) {
      return res.status(400).json({
        message: error.errors[0].message
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const otp = generateOTP();

    const otpRecord = await Otp.create({
      email,
      otp
    });
    console.log(otpRecord);



   

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

export const verifyOtp = async (req, res) => {

  try {

    const { name, email, phone, address, password, otp } = req.body;
    const { success, error } = verifyOtpSchema.safeParse({ name, email, phone, address, password, otp });
    if (!success) {
      return res.status(400).json({
        message: error?.errors?.[0]?.message || "Validation error"
      });
    }

    // Find OTP record by email
    const user = await Otp.findOne({ email });
    
    if (!user) {
      return res.status(400).json({
        message: "OTP expired or not found"
      });
    }
    // Compare OTP
    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }
    console.log("done");

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
    console.log(error);
    res.status(500).json({
      message: error.message
    });

  }

};

export const generateAdminOtp = async (req, res) => {

  try {

    const { email, adminKey } = req.body;
    const { success, error } = generateAdminOtpSchema.safeParse({ email, adminKey });

    if (!success) {
      return res.status(400).json({
        message: error.errors[0].message
      });
    }

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

export const verifyAdminOtp = async (req, res) => {

  try {

    const { name, email, phone, address, password, otp } = req.body;
        const { success, error } = verifyOtpSchema.safeParse({ name, email, phone, address, password, otp });

    if (!success) {
      return res.status(400).json({
        message: error.errors[0].message
      });
    }

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

export const login = async (req, res) => {

  try {

    const { email, password } = req.body;
    const { success, error } = loginSchema.safeParse({ email, password });

    if (!success) {
      return res.status(400).json({
        message: "Validation error"
      });
    }

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




export const requestPasswordResetOtp = async (req, res) => {

  try {

    const { email } = req.body;
        const { success, error } = requestOtpSchema.safeParse({ email });

    if (!success) {
      return res.status(400).json({
        message: error.errors[0].message
      });
    }

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



export const verifyPasswordResetOtp = async (req, res) => {

  try {

    const { email, otp, newPassword } = req.body;
    const { success, error } = newpass.safeParse({ email, otp, newPassword });

    if (!success) {
      return res.status(400).json({
        message: error.errors[0].message
      });
    }

    
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
    
     const user = await User.findOne({email});
     const oldpass = user.password;
    if (await bcrypt.compare(newPassword, oldpass)) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password"
      });
    }


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
import User from "../models/user.js";
import {requestPasswordResetOtp} from "./auth.controller.js";
import {verifyPasswordResetOtp} from "./auth.controller.js";


export const getUserProfile = async (req, res) => {
  try {

    const user = await User.findById(req.user.id)
      .select("name email phone address");

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.status(200).json({
      user
    });

  } catch (error) {

    console.error("Error fetching user profile:", error);

    res.status(500).json({
      message: "Failed to fetch user profile"
    });

  }
};


export const updateAddress = async (req, res) => {
  try {

    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        message: "Address is required"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { address },
      { new: true }
    ).select("name email phone address");

    res.status(200).json({
      message: "Address updated successfully",
      user: updatedUser
    });

  } catch (error) {

    console.error("Error updating address:", error);

    res.status(500).json({
      message: "Failed to update address"
    });

  }
};


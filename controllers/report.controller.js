import Report from "../models/report.js";
import mongoose from "mongoose";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import formatLocation from "../utils/formatLocation.js";
import getPublicId from "../utils/getPublicId.js";
import cloudinary from "../config/cloudinary.js";

export const createReport = async (req, res) => {

  try {

    const { description, category, longitude, latitude, address } = req.body;

    if (!description || !category || !longitude || !latitude) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    // upload media files to Cloudinary
    let mediaUrls = [];
    console.log("FILES:", req.files);
    console.log("BODY:", req.body);

    if (req.files && req.files.length > 0) {
      mediaUrls = await uploadToCloudinary(req.files);
    }

    // convert coordinates to GeoJSON
    const location = formatLocation(longitude, latitude);

    const report = await Report.create({
      userId: req.user.id,
      media: mediaUrls,
      description,
      category,
      location,
      address
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report
    });

  } catch (error) {
    console.error("Error creating report:", error);

    res.status(500).json({
      message: "failed to upload report"
    });

  }

};

export const getAllReports = async (req, res) => {
  try {

    const reports = await Report.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: reports.length,
      reports
    });

  } catch (error) {

    console.error("Error fetching reports:", error);

    res.status(500).json({
      message: "Failed to fetch reports"
    });

  }
};

export const getMyReports = async (req, res) => {
  try {

    const userId = req.user.id;
    const { status } = req.query;

    // base query: reports belonging to the logged-in user
    const query = { userId };

    // add filter if status is provided
    if (status) {
      query.status = status;
    }

    const reports = await Report.find(query)
      .select("description category status media address createdAt resolution location")
      .sort({ createdAt: -1 });

    res.status(200).json({
      totalReports: reports.length,
      reports
    });

  } catch (error) {

    console.error("Error fetching user reports:", error);

    res.status(500).json({
      message: "Failed to fetch your reports"
    });

  }
};

export const getReportDetails = async (req, res) => {
  try {

    const { reportId } = req.params;

    const report = await Report.findById(reportId)
      .populate("userId", "name email phone address");

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    res.status(200).json({
      report
    });

  } catch (error) {

    console.error("Error fetching report details:", error);

    res.status(500).json({
      message: "Failed to fetch report details"
    });

  }
};

export const deleteReport = async (req, res) => {

  try {

    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        message: "Invalid report ID"
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    // delete images from cloudinary
    if (report.media && report.media.length > 0) {

      for (const url of report.media) {

        const publicId = getPublicId(url);

        await cloudinary.uploader.destroy(publicId);

      }

    }
 
    // delete report from DB
    await Report.findByIdAndDelete(reportId);

    res.status(200).json({
      message: "Report and associated images deleted successfully"
    });

  } catch (error) {

    console.error("Error deleting report:", error);

    res.status(500).json({
      message: "Failed to delete report"
    });

  }

};

export const updateReportStatus = async (req, res) => {

  try {

    const { reportId } = req.params;
    const { status, resolutionDescription } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({
        message: "Invalid report ID"
      });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        message: "Report not found"
      });
    }

    let proofImageUrl = null;

    // upload resolution proof if provided
    if (req.files && req.files.length > 0) {

      const uploadedImages = await uploadToCloudinary(req.files);

      proofImageUrl = uploadedImages[0]; // only one proof image

    }

    report.status = status;

    if (status === "Resolved") {

      report.resolution = {
        proofImage: proofImageUrl,
        description: resolutionDescription,
        resolvedAt: new Date()
      };

    }

    await report.save();

    res.status(200).json({
      message: "Report status updated successfully",
      report
    });

  } catch (error) {

    console.error("Error updating report status:", error);

    res.status(500).json({
      message: "Failed to update report status"
    });

  }

};
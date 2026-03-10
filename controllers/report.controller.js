import Report from "../models/report.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import formatLocation from "../utils/formatLocation.js";

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
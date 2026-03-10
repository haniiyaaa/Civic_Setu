import cloudinary from "../config/cloudinary.js";

const uploadToCloudinary = async (files) => {

  const uploadedUrls = [];

  for (const file of files) {

    const result = await cloudinary.uploader.upload(file.path, {
      folder: "civic_setu_reports"
    });

    uploadedUrls.push(result.secure_url);
  }

  return uploadedUrls;
};

export default uploadToCloudinary;
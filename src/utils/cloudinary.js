import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

console.log("Cloudinary ENV:", {
  cloud: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET ? "LOADED" : "NOT LOADED"
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    try { fs.unlinkSync(localFilePath); } catch (err) {}

    return response;
  } catch (error) {
    try { fs.unlinkSync(localFilePath); } catch (err) {}
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

// New: delete image from Cloudinary
const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    // Extract public_id from the URL
    const segments = imageUrl.split("/");
    const filename = segments[segments.length - 1];
    const publicId = filename.split(".")[0]; // remove file extension

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary deletion failed:", err);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };

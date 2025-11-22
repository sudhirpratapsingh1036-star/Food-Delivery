import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// Get all videos (public)
const getAllVideos = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const videos = await Video.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

// Get only the videos of the logged-in owner
const getOwnerVideos = asyncHandler(async (req, res) => {
  // support either req.user (user middleware) or req.owner (owner middleware)
  const ownerId = req.user?._id || req.owner?._id;
  if (!ownerId) throw new ApiError(401, "Unauthorized");

  const videos = await Video.find({ owner: ownerId }).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Owner videos fetched successfully"));
});

// Upload a video (owner only)
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!req.file) {
    throw new ApiError(400, "Video file is required");
  }

  const uploadedVideo = await uploadOnCloudinary(req.file.path);

  // prefer secure_url returned by Cloudinary
  const videoUrl = uploadedVideo?.secure_url || uploadedVideo?.url || null;
  if (!videoUrl) throw new ApiError(400, "Failed to get uploaded video URL");

  const ownerId = req.user?._id || req.owner?._id;
  if (!ownerId) throw new ApiError(401, "Unauthorized");

  const video = await Video.create({
    title,
    description: description || "",
    videoUrl,
    owner: ownerId, // save owner ID
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

// Update a video
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  video.title = title || video.title;
  video.description = description || video.description;

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

// Delete a video
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findByIdAndDelete(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
});

export {
  getAllVideos,
  getOwnerVideos,
  publishAVideo,
  updateVideo,
  deleteVideo,
};

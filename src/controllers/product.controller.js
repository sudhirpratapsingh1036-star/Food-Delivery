import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"; 

// Get all products (for home page)
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, products, "Products fetched successfully"));
});

// Get owner-specific products (for owner dashboard)
const getOwnerProducts = asyncHandler(async (req, res) => {
  const ownerId = req.owner?._id || req.user?._id;
  if (!ownerId) throw new ApiError(401, "Unauthorized");

  const products = await Product.find({ restaurant: ownerId }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, products, "Owner products fetched successfully"));
});

// Add product
const addProduct = asyncHandler(async (req, res) => {
  const { name, price, category, qty, type } = req.body;

  if (!req.file) throw new ApiError(400, "Product image is required");

  const uploadedImage = await uploadOnCloudinary(req.file.path);
  if (!uploadedImage) throw new ApiError(400, "Failed to upload image");

  const ownerId = req.owner?._id || req.user?._id;
  if (!ownerId) throw new ApiError(401, "Unauthorized");

  const product = await Product.create({
    name,
    price,
    category,
    type,
    qty,
    restaurant: ownerId,
    image: uploadedImage.secure_url
  });

  return res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { name, price, category, qty, type } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const ownerId = req.owner?._id || req.user?._id;
  if (product.restaurant.toString() !== ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to update this product");
  }

  // Handle image update
  if (req.file) {
    // Delete old image from Cloudinary
    if (product.image) {
      try {
        await deleteFromCloudinary(product.image);
      } catch (err) {
        console.error("Cloudinary old image deletion failed:", err);
      }
    }

    const updatedImage = await uploadOnCloudinary(req.file.path);
    if (!updatedImage) throw new ApiError(400, "Failed to upload new image");
    product.image = updatedImage.secure_url;
  }

  // Update other fields
  product.name = name || product.name;
  product.price = price || product.price;
  product.category = category || product.category;
  product.type = type || product.type;
  product.qty = qty || product.qty;

  await product.save();

  return res.status(200).json(new ApiResponse(200, product, "Product updated successfully"));
});

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const ownerId = req.owner?._id || req.user?._id;
  if (product.restaurant.toString() !== ownerId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this product");
  }

  // Delete image from Cloudinary
  if (product.image) {
    try {
      await deleteFromCloudinary(product.image); // expects image URL or public_id
    } catch (err) {
      console.error("Cloudinary deletion failed:", err);
    }
  }

  // Delete product from DB
  await product.deleteOne();

  return res.status(200).json(new ApiResponse(200, product, "Product deleted successfully"));
});



export { getAllProducts, getOwnerProducts, addProduct, updateProduct, deleteProduct };

import {Restaurant}  from "../models/restaurant.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";



const getAllRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, restaurants, "Restaurants fetched"));
});



const addRestaurant = asyncHandler(async (req, res) => {
    const { name, address, description } = req.body;

    if (!req.file) {
        throw new ApiError(400, "Restaurant image is required");
    }

    const uploadedImage = await uploadOnCloudinary(req.file.path);

    const restaurant = await Restaurant.create({
        name,
        address,
        description,
        image: uploadedImage.url,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, restaurant, "Restaurant created"));
});



const updateRestaurant = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;
    const { name, address, description } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) throw new ApiError(404, "Restaurant not found");

    if (req.file) {
        const updatedImage = await uploadOnCloudinary(req.file.path);
        restaurant.image = updatedImage.url;
    }

    restaurant.name = name || restaurant.name;
    restaurant.address = address || restaurant.address;
    restaurant.description = description || restaurant.description;

    await restaurant.save();

    return res
        .status(200)
        .json(new ApiResponse(200, restaurant, "Restaurant updated"));
});



const deleteRestaurant = asyncHandler(async (req, res) => {
    const { restaurantId } = req.params;

    const restaurant = await Restaurant.findByIdAndDelete(restaurantId);
    if (!restaurant) throw new ApiError(404, "Restaurant not found");

    return res
        .status(200)
        .json(new ApiResponse(200, restaurant, "Restaurant deleted"));
});


export {
    getAllRestaurants,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant,
};

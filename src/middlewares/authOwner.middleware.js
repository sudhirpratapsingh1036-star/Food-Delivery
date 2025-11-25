import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { Owner } from "../models/owner.model.js";

export const verifyOwnerJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            return next(new ApiError(401, "Unauthorized request: No token provided"));
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
     

        const owner = await Owner.findById(decodedToken._id).select("-password -refreshToken");
        if (!owner) {
            return next(new ApiError(401, "Invalid Access Token: Owner not found"));
        }

        req.owner = owner;
        next();
    } catch (error) {
        next(new ApiError(401, error?.message || "Invalid access token"));
    }
});


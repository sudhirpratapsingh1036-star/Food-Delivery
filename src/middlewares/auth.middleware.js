import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Owner } from "../models/owner.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // 1. GET TOKEN FROM COOKIE OR HEADER
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");
           


        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        // 2. VERIFY TOKEN
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            throw new ApiError(401, "Invalid or expired access token");
        }

        // 3. FIND USER FROM TOKEN
            let user = await User.findById(decoded._id).select(
                "-password -refreshToken"
            );

            // If not found in users, try owners (some tokens may belong to owners)
            if (!user) {
                const owner = await Owner.findById(decoded._id).select("-password -refreshToken");
                if (owner) {
                    // attach both for compatibility
                    req.owner = owner;
                    req.user = owner;
                } else {
                    throw new ApiError(401, "Invalid Access Token: User does not exist");
                }
            } else {
                // 4. ATTACH USER TO REQUEST
                req.user = user;
            }

        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized");
    }
});

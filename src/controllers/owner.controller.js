import { Owner } from "../models/owner.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateAccessAndRefreshToken = async (ownerId) => { 
    try {
        const owner = await Owner.findById(ownerId);
        if (!owner) throw new ApiError(500, "Owner not found during token generation");

        const accessToken = owner.generateAccessToken();
        const refreshToken = owner.generateRefreshToken();
        
        owner.refreshToken = refreshToken;
        await owner.save({ validateBeforeSave: false });
        
        return { accessToken, refreshToken };
    } catch (error) {
         throw new ApiError(500, error.message || "Something went wrong during token generation");
    }
};

const registerOwner = async (req, res) => {
    const { name, email, password } = req.body;

    const OWNER_EMAIL = "sudhirpratapsingh1036@gmail.com";

    if (email !== OWNER_EMAIL) {
        return res.status(403).json({ message: "You are not allowed to register as owner." });
    }

    try {
        // Let the Owner model's pre-save hook handle password hashing.
        const owner = await Owner.create({
            name,
            email,
            password, // plain password; ownerSchema.pre('save') will hash it
        });

        res.status(201).json({ message: "Owner account created successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error creating owner." });
    }
};



const loginOwner = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if ([email, password].some((field) => !field || field.trim() === "")) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const owner = await Owner.findOne({ email });
    if (!owner) throw new ApiError(404, "Owner not found");

    const isPasswordValid = await owner.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(400, "Email or password is incorrect");

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(owner._id);

    const loggedInOwner = await Owner.findById(owner._id).select("-password -refreshToken");

    const cookieOptions = {
        httpOnly: true,
      secure: false,   // because localhost is HTTP
sameSite: "lax",

    };

    res.status(200)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { owner: loggedInOwner, accessToken, refreshToken },
                "Owner logged in successfully"
            )
        );
});

const logoutOwner = asyncHandler(async (req, res) => {
    await Owner.findByIdAndUpdate(req.user._id, 
        { $set: { refreshToken: undefined } }, 
        { new: true }
    );

    const expiredOptions = { 
        httpOnly: true, 
        secure: true, 
        expires: new Date(Date.now())
    };

    return res.status(200)
        .cookie("refreshToken", "", expiredOptions)
        .cookie("accessToken", "", expiredOptions)
        .json(new ApiResponse(200, {}, "Owner logged out successfully"));
});

const getOwnerProfile = asyncHandler(async (req, res) => {
    const ownerId = req.user?._id || req.owner?._id;
    if (!ownerId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const owner = await Owner.findById(ownerId).select("name email avatarUrl");
    if (!owner) {
        return res.status(404).json({ message: "Owner not found" });
    }
    res.status(200).json({ name: owner.name, email: owner.email, avatarUrl: owner.avatarUrl || null });
});

export { registerOwner, loginOwner, logoutOwner, getOwnerProfile };
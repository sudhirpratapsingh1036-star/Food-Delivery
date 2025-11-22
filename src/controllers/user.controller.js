import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser= asyncHandler(async(req,res)=>{
    const {username, email,password, phoneNumber}= req.body;

    if(
        [username, email,password, phoneNumber].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    const existedUser= await User.findOne({
        $or: [{email}, {phoneNumber}]
    })
    if(existedUser){
        throw new ApiError(409, "User already exists with this email or phone number");
    }

    const user= await User.create({
        username,
        email,
        password,
        phoneNumber
    });

      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, phoneNumber, password } = req.body;

    // Password must be provided
    if (!password) {
        throw new ApiError(400, "Password is required");
    }

    // At least one identifier required
    if (!email && !phoneNumber) {
        throw new ApiError(400, "Email or phone number is required");
    }

    // Find the user by email OR phone
    const user = await User.findOne({
        $or: [{ email }, { phoneNumber }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Incorrect password");
    }

    // Create access + refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    // Get user without password/refreshToken
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Cookies for local development
    const options = {
        httpOnly: true,
        secure: false, // IMPORTANT for localhost
        sameSite: "Lax",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});


const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

export {registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}
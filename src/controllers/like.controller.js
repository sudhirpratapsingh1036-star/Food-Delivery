import {Video} from "../models/video.model.js";

export const toggleLike = async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user._id;

        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: "Video not found" });
        }

        let isLiked;

        if (video.likes.includes(userId)) {
            // Unlike
            video.likes.pull(userId);
            isLiked = false;
        } else {
            // Like
            video.likes.push(userId);
            isLiked = true;
        }

        await video.save();

        return res.status(200).json({
            message: "Like toggled",
            data: {
                likesCount: video.likes.length,
                isLiked
            }
        });
    } catch (error) {
        console.error("Toggle Like Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

import React, { useState, useContext } from 'react';
import { Heart } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LikeButton = ({ videoId, initialIsLiked, initialLikesCount }) => {
    const [isLiked, setIsLiked] = useState(initialIsLiked);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [loading, setLoading] = useState(false);

    const { token, isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLikeToggle = async () => {
        if (!isLoggedIn || !token) {
            navigate('/login');
            return;
        }

        const previousLikedState = isLiked;
        const previousCount = likesCount;

        // Optimistic UI update
        setIsLiked(!isLiked);
        setLikesCount(prev => prev + (isLiked ? -1 : 1));
        setLoading(true);

        try {
            // Adjust this depending on your backend:
            // If your backend expects the ID in params:
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/likes/toggle/${videoId}`,
                {}, // empty body
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // OR if your backend expects the ID in body instead, use:
            // const response = await axios.post(
            //     `${import.meta.env.VITE_API_URL}/likes/toggle`,
            //     { videoId },
            //     { headers: { Authorization: `Bearer ${token}` } }
            // );

            console.log("Like response:", response.data);

            const { likesCount: newCount, isLiked: newIsLiked } = response.data.data;
            setLikesCount(newCount);
            setIsLiked(newIsLiked);
        } catch (error) {
            // Revert UI on failure
            setIsLiked(previousLikedState);
            setLikesCount(previousCount);
            console.error("Like API Error:", error.response?.data || error.message);

            const statusCode = error.response?.status;
            if (statusCode === 401 || statusCode === 403) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-1">
            <button
                onClick={handleLikeToggle}
                disabled={loading}
                className={`p-3 rounded-full shadow-lg transition-colors duration-150 ${
                    isLiked ? 'bg-red-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } ${loading ? 'opacity-50 cursor-wait' : ''}`}
                aria-label={isLiked ? "Unlike video" : "Like video"}
            >
                <Heart className="w-6 h-6 fill-current" />
            </button>
            <span className="text-sm font-semibold text-white">{likesCount}</span>
        </div>
    );
};

export default LikeButton;

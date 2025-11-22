import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, Upload, X, File, Clock } from 'lucide-react';
import axios from 'axios';
import LikeButton from '../component/LikeButton.jsx';

// VideoPlayer now accepts onLikeUpdate prop
const VideoPlayer = ({ video, index, activeIndex, onLikeUpdate }) => {
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const isVisible = index === activeIndex;
    const longPressTimeout = useRef(null);

    useEffect(() => {
        if (videoRef.current) {
            if (isVisible) {
                videoRef.current.play().catch(() => {});
            } else {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
            }
        }
    }, [isVisible]);

    const handleTap = () => {
        if (videoRef.current) {
            const newMuteState = !isMuted;
            setIsMuted(newMuteState);
            videoRef.current.muted = newMuteState;
        }
    };

    const handlePressStart = () => {
        longPressTimeout.current = setTimeout(() => {
            if (videoRef.current && !isPaused) {
                videoRef.current.pause();
                setIsPaused(true);
            }
        }, 500);
    };

    const handlePressEnd = () => {
        clearTimeout(longPressTimeout.current);
        if (isPaused && videoRef.current) {
            videoRef.current.play();
            setIsPaused(false);
        }
    };

    return (
        <div
            className="w-full h-screen relative bg-black flex flex-col justify-center snap-start"
            onClick={handleTap}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
        >
            <video
                ref={videoRef}
                src={video.videoUrl}
                className="w-full h-full object-cover"
                autoPlay={false}
                controls={false}
                loop
                muted={isMuted}
            />

            <div className="absolute bottom-0 left-0 p-4 text-white w-full bg-gradient-to from-black/50 to-transparent">
                <h3 className="text-lg font-bold">{video.title}</h3>
                <p className="text-sm text-gray-300">{video.description}</p>
                <div className="flex items-center text-xs mt-1">
                    <User className="w-3 h-3 mr-1" />
                    <span>{video.owner?.name || 'Unknown Owner'}</span>
                </div>
            </div>

            <div className="absolute inset-y-0 right-0 p-4 flex flex-col justify-end items-center space-y-6 z-20 mb-12">
                <LikeButton
                    videoId={video._id}
                    initialIsLiked={video.isLikedByUser || false}
                    initialLikesCount={video.likesCount || 0}
                    onLikeUpdate={onLikeUpdate} // pass callback to update parent state
                />
            </div>

            <div className="absolute bottom-24 left-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
            </div>
        </div>
    );
};

// VideoUploadModal remains the same
const VideoUploadModal = ({ isOpen, onClose, token }) => {
    const [formData, setFormData] = useState({ title: '', description: '' });
    const [videoFile, setVideoFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const navigate = useNavigate();

    const handleTextChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setVideoFile(file);
        setProgress(0);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        setLoading(true);
        setProgress(1);

        if (!token || !videoFile) {
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description || "");
        data.append('video', videoFile);

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/videos/upload`, data, {
                headers: { Authorization: `Bearer ${token}` },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percentCompleted);
                },
            });

            setFormData({ title: '', description: '' });
            setVideoFile(null);
            setProgress(0);
            onClose();
        } catch (error) {
            const statusCode = error.response?.status;
            if (statusCode === 401 || statusCode === 403) {
                navigate('/login');
            }
            setProgress(0);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
                >
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2 flex items-center space-x-2">
                    <Upload className="w-5 h-5 text-emerald-600" />
                    <span>Share New Reel (Owner Only)</span>
                </h2>

                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Video Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleTextChange}
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                            placeholder="e.g., New Dish Launch"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Description (Optional)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleTextChange}
                            rows="2"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Video File
                        </label>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            required
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                        />
                        {videoFile && (
                            <p className="mt-2 text-xs text-gray-500 flex items-center space-x-1">
                                <File className="w-3 h-3" />
                                <span>
                                    {videoFile.name} (
                                    {(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                            </p>
                        )}
                    </div>

                    {loading && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-emerald-600 h-2.5 rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                            <p className="text-xs text-gray-500 mt-1 text-center">
                                {progress}% Uploaded
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                            loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-emerald-600 hover:bg-emerald-700 transition'
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        <span>{loading ? 'Processing...' : 'Share Video Reel'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

const VideoReel = () => {
    const scrollContainerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const { token, isLoggedIn, userData } = useContext(AuthContext);
    const [videos, setVideos] = useState([]);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [loadingFeed, setLoadingFeed] = useState(true);
    const isOwner = isLoggedIn && (userData?.role === 'owner' || userData?.role === 'admin');

    useEffect(() => {
        const fetchFeed = async () => {
            setLoadingFeed(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/videos/feed`);
                const fetchedVideos = response.data.data || response.data;
                setVideos(fetchedVideos);
            } catch (error) {
                console.error('Feed fetch error:', error);
            } finally {
                setLoadingFeed(false);
            }
        };
        fetchFeed();
    }, []);

    // NEW: update video like state
    const handleVideoLikeUpdate = (videoId, newIsLiked, newLikesCount) => {
        setVideos(prevVideos =>
            prevVideos.map(v =>
                v._id === videoId
                    ? { ...v, isLikedByUser: newIsLiked, likesCount: newLikesCount }
                    : v
            )
        );
    };

    const handleScroll = () => {
        if (!scrollContainerRef.current || videos.length === 0) return;
        const container = scrollContainerRef.current;
        const scrollPosition = container.scrollTop;
        const viewportHeight = container.clientHeight;
        const newIndex = Math.round(scrollPosition / viewportHeight);
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex);
        }
    };

    const handleUploadSuccess = () => {
        setIsUploadOpen(false);
        document.location.reload();
    };

    return (
        <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full h-screen bg-gray-900 overflow-y-scroll snap-y snap-mandatory relative"
        >
            {loadingFeed && (
                <div className="h-screen flex items-center justify-center text-white">
                    Loading Video Feed...
                </div>
            )}

            <div className="w-full h-full">
                {videos.length > 0 ? (
                    videos.map((video, index) => (
                        <VideoPlayer
                            key={video._id}
                            video={video}
                            index={index}
                            activeIndex={activeIndex}
                            onLikeUpdate={handleVideoLikeUpdate} // pass the callback
                        />
                    ))
                ) : (
                    !loadingFeed && (
                        <div className="h-screen flex items-center justify-center text-white text-lg">
                            No reels available yet.
                        </div>
                    )
                )}
            </div>

            {isOwner && (
                <button
                    onClick={() => setIsUploadOpen(true)}
                    className="fixed bottom-12 right-6 p-4 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition z-20"
                    title="Share New Reel"
                >
                    <Upload className="w-6 h-6" />
                </button>
            )}

            <VideoUploadModal
                isOpen={isUploadOpen}
                onClose={handleUploadSuccess}
                token={token}
            />
        </div>
    );
};

export default VideoReel;

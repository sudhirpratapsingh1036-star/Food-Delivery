import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Trash2, PlayCircle, Video, Home } from 'lucide-react';

const OwnerVideoList = () => {
    const { token, isLoggedIn, userData } = useContext(AuthContext);
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const ownerName = userData?.username || 'Owner';

    // Fetch owner's videos
    const fetchVideos = async () => {
        if (!token) return setError("Authentication required.");

        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/videos/ownervideos`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(res.data.data || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to load videos.");
            if (err.response?.status === 401 || err.response?.status === 403) navigate('/owner/login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [token]);

    // Handle delete
    const handleDelete = async (videoId) => {
        if (!window.confirm("Are you sure you want to delete this video?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/videos/${videoId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVideos(prev => prev.filter(v => v._id !== videoId));
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    // Handle upload
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!videoFile || !title || !description) return alert("All fields are required");
        setUploading(true);
        const formData = new FormData();
        formData.append("video", videoFile);
        formData.append("title", title);
        formData.append("description", description);

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/videos/upload`, formData, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
            });
            setVideos(prev => [res.data.data, ...prev]);
            setVideoFile(null);
            setTitle('');
            setDescription('');
        } catch (err) {
            console.error("Upload error:", err);
            alert(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    if (!isLoggedIn || error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <h1 className="text-xl mb-4">{error || "Please log in"}</h1>
                <Link to="/owner/login" className="px-4 py-2 bg-green-500 text-white rounded">Go to Login</Link>
            </div>
        );
    }

    if (loading) return <div className="text-center mt-20">Loading...</div>;

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Video className="w-6 h-6"/> {ownerName}'s Videos
            </h1>

            {/* Upload Form */}
            <form onSubmit={handleUpload} className="bg-white p-4 rounded shadow mb-6 space-y-3">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                />
                <input
                    type="file"
                    accept="video/*"
                    onChange={e => setVideoFile(e.target.files[0])}
                    required
                />
                <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                >
                    {uploading ? "Uploading..." : "Upload Video"}
                </button>
            </form>

            {/* Video List */}
            <div className="space-y-4">
                {videos.length === 0 && <p>No videos uploaded yet.</p>}
                {videos.map(video => (
                    <div key={video._id} className="flex justify-between items-center bg-white p-3 rounded shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                <PlayCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <p className="font-semibold">{video.title}</p>
                                <p className="text-sm text-gray-500">{video.description}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(video._id)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 />
                        </button>
                    </div>
                ))}
            </div>

            <Link
                to="/owner/profile"
                className="fixed bottom-6 right-6 p-4 bg-green-500 text-white rounded-full shadow-lg"
            >
                <Home className="w-6 h-6"/>
            </Link>
        </div>
    );
};

export default OwnerVideoList;

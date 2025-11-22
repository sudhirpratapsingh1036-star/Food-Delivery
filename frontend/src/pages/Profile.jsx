import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, MapPin, LogOut, Home, Gamepad, Edit, ChevronRight, X, Camera, Save, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

// --- Edit Profile Modal ---
const EditProfileModal = ({ isOpen, onClose, userData, onSave }) => {
    const [formData, setFormData] = useState({ name: userData.name, address: userData.address });
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(userData.profilePicUrl);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData({ name: userData.name, address: userData.address });
        setPreviewUrl(userData.profilePicUrl);
    }, [userData]);

    if (!isOpen) return null;

    const handleTextChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleImageChange = e => {
        const file = e.target.files[0];
        setImageFile(file);
        if (file) setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData, imageFile);
            toast.success("Profile updated!");
        } catch {
            toast.error("Failed to update profile.");
        } finally {
            setLoading(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <X className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Edit Profile</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <img src={previewUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-gray-200" />
                            <label htmlFor="profile-image" className="absolute bottom-0 right-0 p-1 bg-orange-500 rounded-full cursor-pointer border-2 border-white shadow-md">
                                <Camera className="w-4 h-4 text-white" />
                                <input id="profile-image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleTextChange} required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea name="address" value={formData.address} onChange={handleTextChange} rows="2"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition duration-150">
                        <Save className="w-4 h-4" />
                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

// --- Profile Page ---
const defaultUserData = {
    _id: '',
    name: "Loading User...",
    email: "loading@app.com",
    address: "Fetching address...",
    profilePicUrl: "https://placehold.co/100x100/CCCCCC/ffffff?text=U",
    role: "User"
};

const Profile = () => {
    const { token, isLoggedIn, setToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const [userData, setUserData] = useState(defaultUserData);
    const [isEditing, setIsEditing] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // Fetch user profile
    useEffect(() => {
        if (!isLoggedIn || !token) {
            setLoadingData(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                console.log("Profile API response:", response.data); // <-- debug log

                const data = response.data.data?.user || response.data.data || response.data;

                setUserData({
                    _id: data._id,
                    name: data.name || defaultUserData.name,
                    email: data.email || defaultUserData.email,
                    address: data.address || "No address saved.",
                    profilePicUrl: data.avatarUrl || defaultUserData.profilePicUrl,
                    role: data.role || defaultUserData.role
                });
            } catch (err) {
                console.error("Error fetching profile:", err);
                toast.error("Failed to load profile. Please refresh.");
            } finally {
                setLoadingData(false);
            }
        };
        fetchProfile();
    }, [isLoggedIn, token]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        toast.success("Logged out successfully!");
        navigate('/');
    };

    const handleSaveProfile = async (formData, imageFile) => {
        if (!token) return toast.error("Authentication required.");

        const data = new FormData();
        data.append('name', formData.name);
        data.append('address', formData.address);
        if (imageFile) data.append('avatar', imageFile);

        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/user/update`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const updated = res.data.user || res.data;

            setUserData(prev => ({
                ...prev,
                name: updated.name,
                address: updated.address,
                profilePicUrl: updated.avatarUrl || prev.profilePicUrl
            }));
        } catch (err) {
            console.error("Profile update failed:", err);
            throw err;
        }
    };

    if (!isLoggedIn && !loadingData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Access Denied</h1>
                <p className="text-gray-600 mb-6">Please log in to view your profile.</p>
                <button onClick={() => navigate('/login')}
                    className="px-6 py-2 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition">
                    Go to Login
                </button>
            </div>
        );
    }

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-lg font-semibold text-orange-500">Loading Profile...</div>
            </div>
        );
    }

    const navItems = [
        { name: "Home", icon: Home, path: "/" },
        { name: "Play", icon: Gamepad, path: "/vedioreel" },
        { name: "My Orders", icon: ShoppingBag, path: "/profile/orders" },
    ];

    return (
        <div className="min-h-screen bg-orange-50 flex flex-col">

            {/* Header / Wave */}
            <div className="relative pt-12 pb-24">
                <div className="absolute inset-x-0 top-0 h-40 bg-orange-500 clip-bottom-wave"></div>

                <div className="relative mx-auto max-w-sm w-11/12 bg-white rounded-xl shadow-xl p-6 text-center z-10">
                    <img src={userData.profilePicUrl} alt="Profile"
                        className="w-20 h-20 rounded-full object-cover mx-auto -mt-16 border-4 border-white shadow-lg"
                        onError={e => { e.target.onerror = null; e.target.src = defaultUserData.profilePicUrl; }} />
                    <h1 className="text-xl font-bold text-gray-800 mt-3">{userData.name}</h1>
                    <p className="text-sm text-gray-500">{userData.role}</p>
                    <div className="mt-2 flex justify-center space-x-2 items-center">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600">{userData.email}</span>
                    </div>
                </div>
            </div>

            {/* Navigation / Options */}
            <div className="grow p-4 space-y-4">

                <div className="bg-white rounded-xl shadow-md divide-y divide-gray-100">
                    <h2 className="text-lg font-semibold p-4 text-gray-700">Quick Access</h2>
                    {navItems.map(item => (
                        <Link key={item.name} to={item.path} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                            <div className="flex items-center space-x-3">
                                <item.icon className="w-5 h-5 text-orange-500" />
                                <span className="text-base font-medium text-gray-700">{item.name}</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </Link>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow-md divide-y divide-gray-100">
                    <h2 className="text-lg font-semibold p-4 text-gray-700">Account Management</h2>
                    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition cursor-pointer" onClick={() => setIsEditing(true)}>
                        <div className="flex items-center space-x-3">
                            <Edit className="w-5 h-5 text-orange-500" />
                            <span className="text-base font-medium text-gray-700">Edit Profile</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-orange-500" />
                        <div className="flex flex-col">
                            <span className="text-base font-medium text-gray-700">Shipping Address</span>
                            <span className="text-xs text-gray-500 w-64 truncate">{userData.address}</span>
                        </div>
                    </div>
                    <Edit className="w-5 h-5 text-gray-400 cursor-pointer hover:text-orange-500" />
                </div>

                <button onClick={() => handleLogout()}
                    className="w-full flex items-center justify-center space-x-3 p-4 bg-white text-red-500 rounded-xl shadow-md hover:bg-gray-100 transition font-semibold">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>

            <EditProfileModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                userData={userData}
                onSave={handleSaveProfile}
            />

            <style jsx="true">{`
                .clip-bottom-wave {
                    clip-path: polygon(0 0, 100% 0, 100% 75%, 50% 100%, 0 75%);
                }
            `}</style>
        </div>
    );
};

export default Profile;

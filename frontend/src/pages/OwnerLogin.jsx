import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import { Lock, LogIn } from 'lucide-react'; 
import { AuthContext } from '../context/AuthContext'; // Path set to: ../context/AuthContext

const OwnerLogin = () => {
    // Access setters from AuthContext
    const { setToken } = useContext(AuthContext); 
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            // 1. Attempt standard login
           const response = await axios.post(
    `${import.meta.env.VITE_API_URL}/owners/login`,
    { email, password },
    { withCredentials: true }
);

            
            const tokenPayload = response.data.data || response.data;
            const userToken = tokenPayload.accessToken;

            if (!userToken) {
                setMessage("Login failed: Token missing in response.");
                setLoading(false);
                return;
            }
            
            // 2. Verify role using the newly received token (if not needed, this can be skipped)
            // Note: Since we are using the simplified flow, we assume the backend handles role check and only returns token for authorized users.
            
            // 3. Finalize login: Save token and update global context
            localStorage.setItem('authToken', userToken);
            setToken(userToken); // Update AuthContext state
            
            // toast removed
            navigate('/owner/profile'); // Navigate directly

        } catch (error) {
            // Standard error handling for failed authentication (400, 404, 500)
            setMessage(error.response?.data?.message || "Login failed. Check credentials.");
            console.error("Login Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-linear-to-r from-gray-400 to-orange-700">
            <div className="flex flex-1 items-center justify-center">
                <div className="bg-white/80 rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 bg-black rounded flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">A</span>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Food Owner Login</h2>
                    
                    {message && (
                        <div className={`p-3 rounded-lg text-sm mb-4 ${message.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-black'}`}>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-100"
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-100"
                            />
                            <span
                                className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </span>
                        </div>
                        
                        <div className="flex justify-between text-sm mb-2">
                            <Link to="/owner/register" className="text-black hover:underline">
                                Need an Owner Account? Register here.
                            </Link>
                            <Link to="/login" className="text-gray-600 hover:underline">
                                Return to User Login
                            </Link>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 rounded-lg text-white font-semibold transition-all ${loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-800'}`}
                        >
                            {loading ? 'Verifying Access...' : 'Login in'}
                        </button>
                    </form>
                    <div className="flex justify-center gap-4 mt-6">
                        <button className="bg-white border rounded-full p-2 shadow hover:bg-gray-100"><span className="text-xl">G</span></button>
                        <button className="bg-white border rounded-full p-2 shadow hover:bg-gray-100"><span className="text-xl">F</span></button>
                    </div>
                </div>
            </div>
            {/* Simple visual graphic for desktop view */}
            <div className="hidden md:flex flex-1 items-center justify-center">
                 <svg width="300" height="200" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="50" y="80" width="180" height="60" rx="10" fill="#222" />
                    <rect x="70" y="60" width="140" height="40" rx="8" fill="#222" />
                    <circle cx="70" cy="150" r="15" fill="#222" />
                    <circle cx="210" cy="150" r="15" fill="#222" />
                 </svg>
            </div>
        </div>
    );
};

export default OwnerLogin;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import { Lock, User } from 'lucide-react';

const OwnerRegister = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
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
            // CRITICAL: Connect to your standard registration endpoint but include the role
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/owners/register`, {
                name,
                email,
                password,
                role: 'owner' // Assign the privileged role
            });

            setMessage("Registration successful! You may now log in.");
            // toast removed
            
            // Redirect to the Owner Login page after successful registration
            navigate('/owner/login');

        } catch (error) {
            const errorMessage = error.response?.data?.message || "Registration failed. Check server status.";
            setMessage(errorMessage);
            // toast removed
            console.error("Registration Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        // Preserve original gradient styling
        <div className="flex min-h-screen bg-linear-to-r from-gray-400 to-orange-400">
            <div className="flex flex-1 items-center justify-center">
                <div className="bg-white/80 rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
                    <div className="flex justify-center mb-6">
                        <div className="w-12 h-12 bg-black rounded flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">A</span>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">Food Owner Register</h2>
                    
                    {message && (
                        <div className={`p-3 rounded-lg text-sm mb-4 ${message.includes('successful') ? 'bg-green-100 text-black' : 'bg-red-100 text-red-700'}`}>
                            {message}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name Input */}
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-100"
                        />
                        {/* Email Input */}
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-100"
                        />
                        {/* Password Input */}
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
                                className="absolute right-3 top-2 cursor-pointer text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '🙈' : '👁️'}
                            </span>
                        </div>
                        
                        <div className="flex justify-between text-sm mb-2">
                             <Link to="/owner/login" className="text-black hover:underline">Login in</Link>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-2 rounded-lg text-white font-semibold transition-all ${loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-700'}`}
                        >
                            {loading ? 'Signing Up...' : 'Sign up'}
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

export default OwnerRegister;
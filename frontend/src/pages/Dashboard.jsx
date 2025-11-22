import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight, Home } from 'lucide-react';


// This is the gatekeeper page that routes users to the correct login interface.
const DashboardSelector = () => {
    const navigate = useNavigate();
    const PRIMARY_COLOR = 'text-emerald-600';

    // Function to handle navigation to the User Profile (standard path)
    const handleUserAccess = () => {
        // Standard user login/profile is at the main login page
        navigate('/login'); 
    };

    // Function to handle navigation to the Owner Access page
    const handleOwnerAccess = () => {
        // Owner access requires the dedicated owner login page
        navigate('/owner/login'); 
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-orange-300 p-4">
            <div className="w-full max-w-lg space-y-6">
                
                <h1 className="text-3xl font-extrabold text-center text-gray-900 flex items-center justify-center space-x-2">
                    <Home className="w-8 h-8 text-black" />
                    <span>Select Access Level</span>
                </h1>
                <p className="text-center text-gray-900">
                    Please select your role to proceed to the correct dashboard.
                </p>

                {/* --- User Dashboard Access Card --- */}
                <div 
                    onClick={handleUserAccess}
                    className="bg-orange-200 hover:bg-orange-600 p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition cursor-pointer flex items-center justify-between"
                >
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full bg-orange-100 ${PRIMARY_COLOR}`}>
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">User Dashboard</h2>
                            <p className="text-sm text-gray-800">Access profile, orders, and shopping.</p>
                        </div>
                    </div>
                    <ArrowRight className={`w-6 h-6 ${PRIMARY_COLOR}`} />
                </div>

                {/* --- Owner/Admin Dashboard Access Card --- */}
                <div 
                    onClick={handleOwnerAccess}
                    className="bg-orange-200 hover:bg-orange-600 p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition cursor-pointer flex items-center justify-between"
                >
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full bg-red-100 text-red-600`}>
                            <Lock className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Owner Access Panel</h2>
                            <p className="text-sm text-gray-800">Manage videos, inventory, and analytics.</p>
                        </div>
                    </div>
                    <ArrowRight className={`w-6 h-6 text-red-600`} />
                </div>
            </div>
        </div>
    );
};

export default DashboardSelector;
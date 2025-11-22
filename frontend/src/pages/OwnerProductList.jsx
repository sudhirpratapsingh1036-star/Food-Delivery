import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';

const OwnerProductList = () => {
    const { token, isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        if (!token) {
            setError("Authentication required.");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/products/ownerproducts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setProducts(res.data.data || []);
            setError(null);
        } catch (err) {
            console.error("Fetch Error:", err);
            setError(err.response?.data?.message || "Failed to load products.");
            if (err.response?.status === 401 || err.response?.status === 403) navigate('/owner-login');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [token]);

    const handleDelete = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/products/${productId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success("Product deleted successfully");
            setProducts(prev => prev.filter(p => p._id !== productId));
        } catch (err) {
            toast.error(err.response?.data?.message || "Deletion failed");
        }
    };

    if (!isLoggedIn || error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-orange-200 p-4">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h1 className="text-xl font-bold text-gray-800">{error || "Please log in."}</h1>
                <Link to="/owner-login" className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg">Go to Login</Link>
            </div>
        );
    }

    if (loading) return <div className="text-center mt-20 text-lg text-green-500">Loading products...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">QTY</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.length > 0 ? (
                            products.map(product => (
                                <tr key={product._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img 
                                                src={product.image} 
                                                alt={product.name} 
                                                className="h-10 w-10 rounded object-cover" 
                                                onError={e => e.target.src = "https://placehold.co/40x40/CCCCCC/fff?text=NoImg"}
                                            />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                <div className="text-xs text-gray-500">{product.type}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rs {product.price}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.qty}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="w-5 h-5 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                                    <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                    No products added yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OwnerProductList;

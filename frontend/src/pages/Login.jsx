import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useDispatch } from 'react-redux';
import { AddItem } from '../redux/cartSlice';

const Login = () => {
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddPendingItem = (accessToken) => {
    const pendingItem = sessionStorage.getItem('pendingCartItem');
    if (pendingItem) {
      const item = JSON.parse(pendingItem);
      // Update Redux
      dispatch(AddItem(item));

      // Update localStorage cart
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const index = localCart.findIndex(cartItem => cartItem.id === item.id);
      if (index !== -1) localCart[index].qty += item.qty;
      else localCart.push(item);
      localStorage.setItem('cart', JSON.stringify(localCart));

      // Optionally, send to backend
      axios.post(`${import.meta.env.VITE_API_URL}/cart/add`, {
        productId: item.id,
        qty: item.qty,
      }, { headers: { Authorization: `Bearer ${accessToken}` }})
      .catch(err => console.error("Failed to sync pending cart item:", err));

      sessionStorage.removeItem('pendingCartItem');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, {
        email: emailOrPhone,
        phoneNumber: emailOrPhone,
        password
      });

      const userData = response.data.data || response.data;
      const accessToken = userData.accessToken;

      if (!accessToken) {
        setError("Login failed: Token missing in response.");
        setLoading(false);
        return;
      }

      localStorage.setItem('authToken', accessToken);
      setToken(accessToken);

      // Process pending cart item
      handleAddPendingItem(accessToken);

      navigate('/'); // Redirect to home or cart page

    } catch (err) {
      console.error("Login Error:", err.response?.data || err);
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-linear-to-r from-gray-400 to-orange-700">
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white/80 rounded-3xl shadow-2xl p-8 w-full max-w-md mx-4">
          <h2 className="text-2xl font-bold text-center mb-6">User Login</h2>

          {error && (
            <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Email or Phone Number"
              value={emailOrPhone}
              onChange={e => setEmailOrPhone(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-100"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-100"
              />
              <span
                className="absolute right-3 top-2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>

            <div className="flex justify-between text-sm mb-2">
              <Link to="/register" className="text-black hover:underline">Sign up</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-semibold transition-all ${loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-800'}`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

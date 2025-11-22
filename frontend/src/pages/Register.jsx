import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/register`, // Corrected API path
        { username, email, password, phoneNumber }
      );

      console.log("Registration response:", response.data);
      navigate('/login'); // Redirect to login after successful registration

    } catch (err) {
      console.error("Registration error:", err.response?.data || err);
      setError(err.response?.data?.message || "Registration failed");
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

          <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>

          {error && (
            <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-100"
            />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-100"
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-100"
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
                className="absolute right-3 top-2 cursor-pointer text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>

            <div className="flex justify-between text-sm mb-2">
              <a href="/login" className="text-black hover:underline">Login</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-semibold transition-all ${loading ? 'bg-gray-400' : 'bg-orange-500 hover:bg-orange-700'}`}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

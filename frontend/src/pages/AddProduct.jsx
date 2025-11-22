import React, { useState, useRef, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AddProduct = () => {
    const { token } = useContext(AuthContext);
    const [productData, setProductData] = useState({
        name: '',
        price: '',
        qty: 1,
        type: '',
        category: '',
        id: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleTextChange = (e) => {
        setProductData({ ...productData, [e.target.name]: e.target.value });
    };

    const clearImage = () => {
        setImageFile(null);
        setImagePreviewUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreviewUrl(URL.createObjectURL(file));
        } else {
            clearImage();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setError("You are not logged in!");
            return;
        }

        if (!imageFile) {
            setError("Please select an image.");
            return;
        }

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('name', productData.name);
        formData.append('price', productData.price);
        formData.append('qty', productData.qty);
        formData.append('type', productData.type);
        formData.append('category', productData.category);
        if (imageFile) formData.append('image', imageFile);

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/products/add`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}` // Send the token correctly
                    }
                }
            );

            console.log('Success:', response.data);
            alert('Product added successfully!');
            setProductData({ name: '', price: '', qty: 1, type: '', category: '', id: '' });
            clearImage();
        } catch (err) {
            console.error('Submission Error:', err);
            setError(err.response?.data?.message || 'Failed to add product. Check server logs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-orange-300 flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-orange-400 p-8 rounded-2xl shadow-xl border border-gray-200">
                <h2 className="text-3xl font-extrabold text-[#161817] mb-8 text-center">🛒 Add New Product</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="text"
                        name="name"
                        placeholder="Product Name"
                        value={productData.name}
                        onChange={handleTextChange}
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                    <div className="flex space-x-4">
                        <input
                            type="number"
                            name="price"
                            placeholder="Price"
                            value={productData.price}
                            onChange={handleTextChange}
                            required
                            className="w-1/3 px-4 py-2 border rounded-lg"
                        />
                        <input
                            type="text"
                            name="type"
                            placeholder="Type (Veg/Non-Veg)"
                            value={productData.type}
                            onChange={handleTextChange}
                            required
                            className="w-1/3 px-4 py-2 border rounded-lg"
                        />
                        <input
                            type="text"
                            name="category"
                            placeholder="Category"
                            value={productData.category}
                            onChange={handleTextChange}
                            required
                            className="w-1/3 px-4 py-2 border rounded-lg"
                        />
                    </div>
                    <input
                        type="number"
                        name="qty"
                        placeholder="Quantity"
                        value={productData.qty}
                        onChange={handleTextChange}
                        min={1}
                        required
                        className="w-full px-4 py-2 border rounded-lg"
                    />
                    <div className="flex items-center space-x-4">
                       <input
  id="file-upload"
  type="file"
  accept="image/*"
  onChange={handleImageChange}
  ref={fileInputRef}
  className="sr-only" // makes it invisible
  required
/>
<label
  htmlFor="file-upload"
  className="... cursor-pointer ..."
>
  {imageFile ? "Change Image" : "Upload Image"}
</label>

                        {imageFile && (
                            <button type="button" onClick={clearImage} className="text-red-600">
                                Remove
                            </button>
                        )}
                        {imagePreviewUrl && (
                            <img src={imagePreviewUrl} alt="Preview" className="w-16 h-16 object-cover rounded" />
                        )}
                    </div>

                    {error && <div className="text-red-600">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-orange-600 text-black rounded-lg hover:bg-orange-700"
                    >
                        {loading ? "Adding Product..." : "Save Product"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;

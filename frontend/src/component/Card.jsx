import React, { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { AddItem } from '../redux/cartSlice';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Card = ({ name, id, price, image, type }) => {
    const dispatch = useDispatch();
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    // Backend update
    const updateBackendCart = async (qtyDiff) => {
        if (!token) return false;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/cart/add`, {
                productId: id,
                qty: qtyDiff,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return true;
        } catch (err) {
            console.error("Backend update failed:", err);
            return false;
        }
    };

    // Add to cart handler
    const handleAddToCart = async () => {
        if (!token) {
            // Store pending item for login redirect
            sessionStorage.setItem('pendingCartItem', JSON.stringify({ _id: id, name, price, image, qty: 1, type }));
            navigate('/login');
            return;
        }

        // Update backend
        const success = await updateBackendCart(1);
        if (!success) return;

        // Update Redux
        dispatch(AddItem({ _id: id, name, price, image, qty: 1, type }));

        // Update localStorage safely
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const index = currentCart.findIndex(item => item._id === id);
        let updatedCart;
        if (index !== -1) {
            updatedCart = currentCart.map(item =>
                item._id === id ? { ...item, qty: item.qty + 1 } : item
            );
        } else {
            updatedCart = [...currentCart, { _id: id, name, price, image, qty: 1, type }];
        }
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    return (
        <div className='w-[220px] h-[300px] bg-orange-100 shadow-lg rounded-lg flex flex-col p-4 items-center justify-between'>
            <div className='w-full h-[150px] overflow-hidden rounded-lg'>
                <img src={image} alt={name} className='object-cover w-full h-full' />
            </div>
            <div className='flex flex-col items-center gap-2 mt-2'>
                <div className='font-semibold text-lg text-black'>{name}</div>
                <div className='text-black font-semibold text-xl'>Rs {price}/-</div>
            </div>
            <button
                className='mt-3 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-900 transition-all'
                onClick={handleAddToCart}
            >
                Add to Cart
            </button>
        </div>
    );
};

export default Card;

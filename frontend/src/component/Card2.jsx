import React, { useContext } from 'react';
import { MdAutoDelete } from "react-icons/md";
import { useDispatch } from 'react-redux';
import { DecreamentQty, IncreamentQty, RemoveItem, AddItem } from '../redux/cartSlice';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Card2 = ({ name, id, price, image, qty }) => {
    const dispatch = useDispatch();
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();

    // Backend update helper
    const updateBackendCart = async (qty) => {
        if (!token) return false;
        try {
            console.log("Sending to backend:", { productId: id, qty }); // debug
            await axios.post(`${import.meta.env.VITE_API_URL}/cart/add`, {
                productId: id,
                qty,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return true;
        } catch (err) {
            console.error("Backend update failed:", err);
            return false;
        }
    };

    // Add to cart
    const handleAddToCart = async () => {
        if (!token) {
            sessionStorage.setItem('pendingCartItem', JSON.stringify({ id, name, price, image, qty: 1 }));
            navigate('/login');
            return;
        }

        const success = await updateBackendCart(1); // always add 1
        if (!success) return;

        // Update Redux
        dispatch(AddItem({ _id: id, name, price, image, qty: 1 }));

        // Update localStorage
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const index = currentCart.findIndex(item => item._id === id);
        let updatedCart;
        if (index !== -1) {
            updatedCart = currentCart.map(item =>
                item._id === id ? { ...item, qty: item.qty + 1 } : item
            );
        } else {
            updatedCart = [...currentCart, { _id: id, name, price, image, qty: 1 }];
        }
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    // Increment / Decrement qty
    const handleQuantityChange = async (action) => {
        if (!token) {
            sessionStorage.setItem('pendingCartItem', JSON.stringify({ id, name, price, image, qty: 1 }));
            navigate('/login');
            return;
        }

        let newQty = qty;
        if (action === 'increment') newQty += 1;
        else if (action === 'decrement' && qty > 1) newQty -= 1;
        else return;

        const qtyDiff = newQty - qty; // diff for backend
        const success = await updateBackendCart(qtyDiff);
        if (!success) return;

        if (action === 'increment') dispatch(IncreamentQty(id));
        else dispatch(DecreamentQty(id));

        // Update localStorage
        const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updatedCart = currentCart.map(item =>
            item._id === id ? { ...item, qty: newQty } : item
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    // Remove item
    const handleRemoveItem = async () => {
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/cart/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            dispatch(RemoveItem(id));

            const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
            const updatedCart = currentCart.filter(item => item._id !== id);
            localStorage.setItem('cart', JSON.stringify(updatedCart));

        } catch (err) {
            console.error("Remove failed:", err);
        }
    };

    return (
        <div className='w-full h-[120px] p-2 shadow-lg flex justify-between'>
            <div className='w-[70%] h-full flex gap-5'>
                <div className='w-[60%] h-full overflow-hidden rounded-lg'>
                    <img src={image} alt={name} className='object-cover' />
                </div>
                <div className='w-[40%] h-full flex flex-col gap-3'>
                    <div className='text-lg text-gray-900 font-semibold'>{name}</div>
                    <div className='w-[110px] h-[70px] bg-orange-300 flex rounded-lg overflow-hidden shadow-lg font-semibold border-2 border-orange-400 text-xl'>
                        <button
                            className='w-[30%] h-full bg-white flex justify-center items-center text-black hover:bg-gray-200'
                            onClick={() => handleQuantityChange('decrement')}
                        >-</button>
                        <span className='w-[40%] h-full bg-slate-200 flex justify-center items-center text-black'>{qty}</span>
                        <button
                            className='w-[30%] h-full text-black bg-white flex justify-center items-center hover:bg-gray-200'
                            onClick={() => handleQuantityChange('increment')}
                        >+</button>
                    </div>
                    <button
                        className='mt-1 px-3 py-1 bg-orange-500 text-white rounded-lg'
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
            <div className='flex flex-col justify-start items-end gap-6'>
                <MdAutoDelete
                    className='w-[30px] h-[30px] text-red-900 cursor-pointer'
                    onClick={handleRemoveItem}
                />
            </div>
        </div>
    );
};

export default Card2;

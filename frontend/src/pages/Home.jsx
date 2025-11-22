import React, { useContext, useState, useEffect } from 'react';
import Nav from '../component/Nav';
import Categories from '../Category';
import Card from '../component/Card';
import Card2 from '../component/Card2';
import { DataContext } from '../context/UserContext.jsx';
import { RxCross1 } from "react-icons/rx";
import { useSelector, useDispatch } from 'react-redux';
import { AuthContext } from '../context/AuthContext';
import { setCartItems } from '../redux/cartSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const { cate, setCate, input, showCart, setShowCart } = useContext(DataContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const { token } = useContext(AuthContext);
    const dispatch = useDispatch();

    const categoryMap = {
        All: "All",
        breakfast: "Breakfast",
        soups: "Soups",
        pasta: "Pasta",
        main_course: "Main Course",
        pizza: "Pizza",
        burger: "Burger"
    };

    // --- Fetch products ---
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/products/`);
                const fetchedProducts = res.data.data || [];
                setProducts(fetchedProducts);
                setFilteredProducts(fetchedProducts);
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        };
        fetchProducts();
    }, []);

    // --- Fetch cart ---
    useEffect(() => {
        const fetchUserCart = async () => {
            try {
                let cartFromBackend = [];

                if (token) {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/cart/`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    cartFromBackend = res.data.cartItems.map(item => ({
                        _id: item.productId._id,
                        name: item.productId.name,
                        price: item.productId.price,
                        image: item.productId.image,
                        type: item.productId.type,
                        qty: item.qty
                    }));

                    // Save backend cart to localStorage
                    localStorage.setItem('cart', JSON.stringify(cartFromBackend));
                } else {
                    // No token? Load from localStorage
                    cartFromBackend = JSON.parse(localStorage.getItem('cart') || '[]');
                }

                dispatch(setCartItems(cartFromBackend));

            } catch (err) {
                console.error("Error fetching cart:", err);
                // fallback to localStorage
                const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                dispatch(setCartItems(localCart));
            }
        };
        fetchUserCart();
    }, [token, dispatch]);

    // --- Filter products ---
    useEffect(() => {
        let filtered = products;

        if (selectedCategory && selectedCategory !== 'All') {
            filtered = filtered.filter(item => item.category === categoryMap[selectedCategory]);
        }

        if (input) {
            const search = input.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(search) ||
                (item.category && item.category.toLowerCase().includes(search))
            );
        }

        setFilteredProducts(filtered);
    }, [input, products, selectedCategory]);

    const handleCategoryClick = category => setSelectedCategory(category);

    // --- Cart calculations ---
    const items = useSelector(state => state.cart);
    const subTotal = items.reduce((total, item) => total + item.qty * item.price, 0);
    const deliveryFee = 20;
    const taxes = subTotal * 0.5 / 100;
    const total = Math.floor(subTotal + deliveryFee + taxes);

    return (
        <div className='bg-orange-400 w-full min-h-screen'>
            <Nav />

            {/* Categories */}
            <div className='flex flex-wrap justify-center items-center gap-5 w-full'>
                {Categories.map(item => (
                    <div
                        key={item.name}
                        className={`w-[140px] h-[150px] bg-orange-100 flex flex-col items-start gap-5 p-5 justify-start text-[20px] font-semibold text-gray-600 rounded-lg shadow-xl hover:bg-orange-900 cursor-pointer transition-all duration-200 ${selectedCategory === item.name ? 'border-2 border-orange-500' : ''}`}
                        onClick={() => handleCategoryClick(item.name)}
                    >
                        {item.icon}
                        {item.name}
                    </div>
                ))}
            </div>

            {/* Products */}
            <div className='w-full flex flex-wrap gap-5 px-5 justify-center items-center pt-8 pb-8'>
                {filteredProducts.length > 0
                    ? filteredProducts.map(item => (
                        <Card
                            key={item._id}
                            name={item.name}
                            image={item.image}
                            price={item.price}
                            id={item._id}
                            type={item.type}
                        />
                    ))
                    : <div className='text-8xl text-black flex justify-center items-center pt-[200px]'>Not Found...</div>}
            </div>

            {/* Cart Sidebar */}
            <div className={`w-full md:w-[40vw] h-full fixed top-0 right-0 bg-orange-100 shadow-xl p-6 ${showCart ? "translate-x-0" : "translate-x-full"} transition-all duration-500 flex flex-col items-center overflow-auto`}>
                <header className='w-full flex justify-between items-center'>
                    <span className='text-black text-[18px] font-semibold'>Order items</span>
                    <RxCross1 className='w-[30px] h-5 text-black text-[18px] font-semibold cursor-pointer hover:text-gray-600' onClick={() => setShowCart(false)} />
                </header>

                {items.length > 0
                    ? <>
                        <div className='w-full mt-9 flex flex-col gap-8'>
                            {items.map(item => (
                                <Card2
                                    key={item._id}
                                    name={item.name}
                                    price={item.price}
                                    image={item.image}
                                    id={item._id}
                                    qty={item.qty}
                                    type={item.type}
                                />
                            ))}
                        </div>

                        <div className='w-full border-t-2 border-b-2 border-orange-900 mt-7 flex flex-col gap-2 p-8'>
                            <div className='w-full flex justify-between items-center'>
                                <span className='text-lg text-gray-900 font-semibold'>SubTotal</span>
                                <span className='text-black font-semibold text-lg'>Rs {subTotal}/-</span>
                            </div>
                            <div className='w-full flex justify-between items-center'>
                                <span className='text-lg text-gray-900 font-semibold'>Delivery Fee</span>
                                <span className='text-black font-semibold text-lg'>Rs {deliveryFee}/-</span>
                            </div>
                            <div className='w-full flex justify-between items-center'>
                                <span className='text-lg text-gray-900 font-semibold'>Taxes</span>
                                <span className='text-black font-semibold text-lg'>Rs {taxes}/-</span>
                            </div>
                        </div>
                        <div className='w-full flex justify-between items-center p-9'>
                            <span className='text-2xl text-gray-900 font-semibold'>Total</span>
                            <span className='text-black font-semibold text-2xl'>Rs {total}/-</span>
                        </div>
                        <button className='w-[80%] p-3 bg-orange-500 hover:bg-orange-900 rounded-lg text-white transition-all cursor-pointer' onClick={() => navigate("/payment")}>Place Order</button>
                    </>
                    : <div className='text-center text-2xl text-black font-semibold pt-5'>Empty Cart</div>}
            </div>
        </div>
    );
};

export default Home;

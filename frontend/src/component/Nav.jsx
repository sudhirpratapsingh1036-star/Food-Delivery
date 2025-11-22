import React, { useContext, useEffect } from 'react';
import { MdFastfood } from "react-icons/md";
import { IoMdSearch } from "react-icons/io";
import { HiShoppingBag } from "react-icons/hi2";
import { DataContext } from '../context/UserContext'; 
import { AuthContext } from '../context/AuthContext';
import { food_items } from '../Food';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// NEW ICON
import { PlayCircle } from "lucide-react";

const Nav = () => {
    const { input, setInput, cate, setCate, showCart, setShowCart } = useContext(DataContext);
    const { isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const newlist = food_items.filter(item => 
            item.food_name.toLowerCase().includes(input.toLowerCase())
        );
        setCate(newlist);
    }, [input, setCate]);

    const items = useSelector(state => state.cart);

    const handleProfileClick = async () => {
        if (isLoggedIn) {
            await navigate('/userprofilepage');
        } else {
            await navigate('/dashboard');
        }
    };

    return (
        <div className='w-full h-[100px] flex justify-between items-center px-5 md:px-8'>
            
            {/* LOGO */}
            <div 
                className='w-[60px] h-[60px] bg-orange-100 flex justify-center items-center rounded-md shadow-xl cursor-pointer'
                onClick={handleProfileClick}
            >
                <MdFastfood className='w-[30px] h-[30px] text-orange-500'/>
            </div>
            
            {/* SEARCH BAR */}
            <form 
                onSubmit={(e) => e.preventDefault()} 
                className='w-[45%] h-[60px] bg-orange-100 flex items-center px-5 gap-5 shadow-xl rounded-md md:w-[65%]'
            >
                <IoMdSearch className='text-orange-500 w-5 h-5'/>
                <input 
                    className='w-full outline-none text-[16px] md:text-[20px]' 
                    onChange={(e) => setInput(e.target.value)} 
                    value={input} 
                    type="text" 
                    placeholder='Search Items--' 
                />
            </form>

            {/* REELS ICON */}
            <div 
                className='w-[60px] h-[60px] bg-orange-100 flex justify-center items-center rounded-md shadow-xl cursor-pointer'
                onClick={() => navigate('/reels')}
                title="Watch Reels"
            >
                <PlayCircle className="w-8 h-8 text-orange-500" />
            </div>
            
            {/* CART */}
            <div 
                className='w-[60px] h-[60px] bg-orange-100 flex justify-center items-center rounded-md shadow-xl relative cursor-pointer' 
                onClick={() => setShowCart(true)}
            >
                <span className='absolute top-0 right-2 text-orange-500 font-semibold text-[18px]'>{items.length}</span>
                <HiShoppingBag className='w-[30px] h-[30px] text-orange-500'/>
            </div>

        </div>
    );
}

export default Nav;

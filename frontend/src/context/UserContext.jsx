// src/context/UserContext.jsx
import React, { createContext, useState } from 'react';
import { food_items } from '../Food';

export const DataContext = createContext();

export const UserContextProvider = ({ children }) => {
  const [cate, setCate] = useState(food_items);
  const [input, setInput] = useState("");
  const [showCart, setShowCart] = useState(false);

  const data = { input, setInput, cate, setCate, showCart, setShowCart };

  return (
    <DataContext.Provider value={data}>
      {children}
    </DataContext.Provider>
  );
};

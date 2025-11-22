import { createSlice } from "@reduxjs/toolkit";

const cartslice = createSlice({
    name: "cart",
    initialState: [],
    reducers: {
        AddItem: (state, action) => {
            let existing = state.find(item => item._id === action.payload._id);
            if (existing) {
                existing.qty += 1;
            } else {
                state.push({ ...action.payload, qty: 1 });
            }
        },

        RemoveItem: (state, action) => {
            const index = state.findIndex(item => item._id === action.payload);
            if (index !== -1) {
                state.splice(index, 1);
            }
        },

        IncreamentQty: (state, action) => {
            const item = state.find(item => item._id === action.payload);
            if (item) item.qty += 1;
        },

        DecreamentQty: (state, action) => {
            const item = state.find(item => item._id === action.payload);
            if (item && item.qty > 1) item.qty -= 1;
        },

        setCartItems: (state, action) => {
            return Array.isArray(action.payload) ? action.payload : [];
        }
    }
});

export const {
    AddItem,
    RemoveItem,
    IncreamentQty,
    DecreamentQty,
    setCartItems
} = cartslice.actions;

export default cartslice.reducer;

import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addToCart = asyncHandler(async (req, res) => {
    const { productId, qty } = req.body;

    if (!productId || !qty) {
        throw new ApiError(400, "Product ID and quantity are required");
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        cart = await Cart.create({ user: req.user._id, items: [] });
    }

    const index = cart.items.findIndex(item => String(item.product) === String(productId));

    if (index !== -1) {
        cart.items[index].qty += qty;
    } else {
        cart.items.push({ product: productId, qty });
    }

    await cart.save();
    cart = await cart.populate("items.product");

    res.status(200).json(new ApiResponse(200, cart.items, "Added to cart successfully"));
});


// Get cart
const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    res.status(200).json(new ApiResponse(200, cart?.items || [], "Cart fetched successfully"));
});

// Remove from cart
const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) throw new ApiError(404, "Cart not found");

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    res.status(200).json(new ApiResponse(200, cart.items, "Removed from cart"));
});

export { addToCart, getCart, removeFromCart };

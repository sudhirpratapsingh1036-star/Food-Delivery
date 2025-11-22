import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addToCart, getCart, removeFromCart } from "../controllers/cart.controller.js";

const router = Router();

// Add product to cart
router.post("/add", verifyJWT, addToCart);

// Get user cart
router.get("/", verifyJWT, getCart);

// Remove product from cart
router.delete("/:productId", verifyJWT, removeFromCart);

export default router;

import { Router } from "express";
import {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelMyOrder
} from "../controllers/order.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


// USER ROUTES
router.post("/create", verifyJWT, createOrder);
router.get("/my-orders",verifyJWT, getMyOrders);
router.put("/cancel/:orderId", verifyJWT, cancelMyOrder);


// ADMIN ROUTES
router.get("/", verifyJWT, getAllOrders);
router.put("/status/:orderId", verifyJWT, updateOrderStatus);


export default router;

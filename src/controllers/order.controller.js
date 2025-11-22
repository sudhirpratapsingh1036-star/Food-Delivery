
import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { items, totalAmount, address } = req.body;

    if (!items || items.length === 0) {
        throw new ApiError(400, "Order items cannot be empty");
    }

    const order = await Order.create({
        user: userId,
        items,
        totalAmount,
        address,
        status: "pending"
    });

    return res
        .status(201)
        .json(new ApiResponse(201, order, "Order placed successfully"));
});



const getMyOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
        .populate("items.product")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "User orders fetched"));
});


const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate("user", "name email")
        .populate("items.product")
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "All orders fetched"));
});



const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatus = ["pending", "preparing", "out_for_delivery", "delivered", "cancelled"];
    if (!allowedStatus.includes(status)) {
        throw new ApiError(400, "Invalid order status");
    }

    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, "Order not found");

    order.status = status;
    await order.save();

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order status updated"));
});



const cancelMyOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, user: userId });

    if (!order) throw new ApiError(404, "Order not found");

    if (order.status !== "pending") {
        throw new ApiError(400, "You can cancel only pending orders");
    }

    order.status = "cancelled";
    await order.save();

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order cancelled"));
});


export {
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    cancelMyOrder
};

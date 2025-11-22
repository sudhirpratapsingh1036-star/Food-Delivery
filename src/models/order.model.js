import mongoose, {Schema} from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      }
    }
  ],

  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },

  totalAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "accepted", "preparing", "on the way", "delivered", "cancelled"],
    default: "pending"
  },

  address: {
    type: String,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["cod", "online"],
    default: "cod"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Order  = mongoose.model("Order", orderSchema);

import mongoose, {Schema} from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  description: {
    type: String,
    default: ""
  },

  image: {
    type: String,  
    required: true
  },

  address: {
    type: String,
    required: true
  },

  category: {
    type: String,  
    default: "General"
  },

  rating: {
    type: Number,
    default: 4.5
  },

  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});
export const Restaurant = mongoose.model("Restaurant", restaurantSchema);

import express from 'express'
import cors from 'cors';
import cookieParser from 'cookie-parser';


const app= express();

app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        "http://localhost:5173"
    ],
    credentials: true,
}));


app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static('public'));

app.use(cookieParser());

//routes import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import productRouter from './routes/product.routes.js'
import orderRouter from './routes/order.routes.js'
import ownerRouter from './routes/owner.routes.js'
import restaurantRouter from './routes/restaurant.routes.js'
import cartRoutes from "./routes/cart.routes.js";
import likeRoutes from "./routes/like.routes.js";





//routes declaration
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/owners", ownerRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/restaurants", restaurantRouter);
app.use("/api/v1/cart", cartRoutes);
app.use("/likes", likeRoutes);





//http://localhost:8000/api/v1/users/register


export {app};
import mongoose from "mongoose";
import { DB_NAME } from "../../constant.js";

const connectDB = async()=>{
    try {
        const connection= await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected! HOST:${connection.connection.host}`)
    } catch (error) {
        console.error("error in db connection", error);
        process.exit(1);
    }
}

export {connectDB};
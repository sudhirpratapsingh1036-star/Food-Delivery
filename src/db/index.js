import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`MongoDB connected! HOST: ${connection.connection.host}`);
    } catch (error) {
        console.error("Error in DB connection", error);
        process.exit(1);
    }
};

export { connectDB };

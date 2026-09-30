import mongoose from "mongoose";

const connectdb = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || process.env.Mongo_url;

        if (!mongoUrl) {
            throw new Error("MongoDB connection URL is not configured");
        }

        await mongoose.connect(
            mongoUrl
        );

        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error.message);
        throw error;
    }
};

export default connectdb;
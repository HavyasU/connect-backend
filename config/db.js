import mongoose from "mongoose";
import dotenv from "dotenv";
import Grid from "gridfs-stream";

dotenv.config();

const connectDB = (cb) => {
    const url = process.env.DB_URL;
    console.log(url);
    mongoose.connect(url)
        .then(() => {
            console.log("MongoDB connected.⚡");
            cb();
        })
        .catch((err) => {
            console.error("MongoDBs connection error:", err);
        });

};

export default connectDB;

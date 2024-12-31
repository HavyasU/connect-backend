import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = (cb) => {
    const url = process.env.DB_URL;
    // console.log(url, { useNewUrlParser: true });
    mongoose.connect(url, { useNewUrlParser: true })
        .then(() => {
            console.log("MongoDB connected.⚡");
            cb();
        })
        .catch((err) => {
            console.error("MongoDBs connection error:", err);
        });

};

export default connectDB;

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const connectDB = (cb) => {
    // const url = "mongodb://127.0.0.1:27017/connect";
    // const url = "mongodb+srv://test:test@cluster1.wjkzthq.mongodb.net/connect";
    const url = process.env.DB_URL;
    mongoose.connect(url).then(() => {
        console.log("DB connected.⚡");
        cb();
    }).catch((err) => {
        console.log("DB connection Error");
        console.log(err);
    });
};

export default connectDB;
import adminModel from "../models/adminModel.js";
import JWT from "jsonwebtoken";
import { config } from "dotenv";

config();
export const checkAdminToken = async (req, res, next) => {

    const authHeader = req?.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({ success: "false", message: "Authentication failed" });
    }

    const token = authHeader.split(" ")[1];

    if (token === null) {
        return res.status(401).json({ success: "false", message: "Authentication failed" });
    }
    try {
        const adminToken = JWT.verify(token, process.env.JWT_SECRET_KEY);
        let adminId = adminToken?.userId;
        let adminExists = await adminModel.findById(adminId);
        if (!adminExists) {
            return res.json({
                success: false,
                message: "unAuthorized"
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "Error"
        });
    }
};
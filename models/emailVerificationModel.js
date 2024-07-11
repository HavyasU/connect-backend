import mongoose, { Schema } from "mongoose";

const emailVerificationSchema = new Schema({
    userId: String,
    otp: String,
    createdAt: Date,
    expiresAt: Date,
}
);
const EmailVerifications = mongoose.model("EmailVerifications", emailVerificationSchema);

export default EmailVerifications


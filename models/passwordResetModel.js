import mongoose, { Schema } from "mongoose";

const passwordResetSchema = new Schema({
    userId: { type: String, unique: true },
    email: { type: String, unique: true },
    otp: String,
    createdAt: Date,
    updatedAt: Date
}
);
const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);
export default PasswordReset


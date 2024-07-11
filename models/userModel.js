import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    firstName: { type: String, required: [true, "First Name is Required"] },
    lastName: { type: String, required: [true, "Last Name is Required"] },
    email: { type: String, required: [true, "Email is Required"], unique: true },
    password: { type: String, required: [true, "Password is Required"] },
    password: {
        type: String,
        required: [true, "Password is Required"],
        minLength: [6, "Password Length Should be Greater than 6 chanaracters"],
        select: true
    },
    location: { type: String },
    profileUrl: { type: String },
    profession: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    views: [{ type: String }],
    verified: { type: Boolean, default: false }
},
    { timestamps: true }
);
const Users = mongoose.model("Users", userSchema);
export default Users


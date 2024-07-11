import mongoose, { Schema } from "mongoose";

const FriendRequestsSchema = new Schema({
    requestTo: { type: Schema.Types.ObjectId, ref: "Users" },
    requestFrom: { type: Schema.Types.ObjectId, ref: "Users" },
    status: { type: String, default: "Pending" },
},
    {
        timestamps: true
    }
);
const FriendRequests = mongoose.model("FriendRequests", FriendRequestsSchema);
export default FriendRequests


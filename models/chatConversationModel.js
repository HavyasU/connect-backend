import mongoose from "mongoose";

const chatConversationSchema = new mongoose.Schema({
    members: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Users"
    }]
}, { timestamps: true });

export default mongoose.model('chatConversations', chatConversationSchema);
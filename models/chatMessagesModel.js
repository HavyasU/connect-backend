import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "chatConversations"
    },
    recieverId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Users"
    },
    senderId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Users"
    },
    "type": {
        type: "String"
    },
    "text": {
        type: "String"
    },
    "fileUrl": {
        type: "String"
    },
    "read": {
        type: "Boolean",
        default: false
    },

}, { timestamps: true });

export default mongoose.model('chatMessages', chatMessageSchema);
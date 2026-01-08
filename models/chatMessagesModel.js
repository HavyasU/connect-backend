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
    "recieved": {
        type: String,
        default: null
    },
    "read": {
        type: String,
        default: null
    },

}, { timestamps: true });

export default mongoose.model('chatMessages', chatMessageSchema);
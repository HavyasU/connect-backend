import mongoose from "mongoose";
import chatConversationModel from "../models/chatConversationModel.js";
import chatMessagesModel from "../models/chatMessagesModel.js";
import Users from "../models/userModel.js";

export const createConversation = async (req, res) => {
    try {
        //get id of users
        const { user1, user2 } = req.body;
        const existingConversation = await chatConversationModel.findOne({
            members: { $all: [user1, user2] }
        });

        if (existingConversation) {
            return res.status(200).send({
                success: false,
                message: "Conversation already exists",
                conversationId: existingConversation._id
            });
        }
        let convoCreated = await chatConversationModel.create({
            members: [
                user1,
                user2
            ]
        });
        if (convoCreated) {
            return res.status(201).send({
                success: true,
                message: "Conversation Saved",
                conversationId: convoCreated._id
            });
        }
        else {
            return res.status(200).send({
                success: false,
                message: "Conversation Not Created"
            });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error"
        });
    }
};

export const saveMessage = async (req, res) => {
    try {
        const {
            conversationId,
            senderId,
            recieverId,
            text,
            type,
            fileUrl
        } = req.body;

        const chatSaved = await chatMessagesModel.create({
            conversationId,
            senderId,
            recieverId,
            text,
            type,
            fileUrl: type != null ? req.body.fileUrl : null
        });
        if (chatSaved) {
            res.status(201).send({
                success: true,
                message: "Chat Saved"
            });
        }
        else {
            res.status(200).send({
                success: false,
                message: "Chat Not Saved"
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error"
        });
    }
};

//optional
const findConversations = async (req, res) => {
    try {
        const { user } = req.body;

        const conversations = await chatConversationModel.findOne({
            members: { $in: [user] }
        }).populate('members');


        if (conversations) {
            console.log(conversations);
            res.send({
                success: true,
                data: conversations
            });
        } else {
            res.send({
                success: true,
                data: conversations
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error"
        });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.body;
        const chatMessages = await chatMessagesModel.find({
            "conversationId": conversationId
        }).populate("senderId").populate("recieverId");
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        console.log();
        res.status(200).send({
            success: true,
            data: chatMessages
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            "success": false,
            "message": "Error"
        });
    }
};

export const UploadFile = async (req, res) => {
    try {
        const file = req.file; // `req.file` contains the file information
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        console.log(file); // Log file info for debugging

        return res.status(200).json({
            success: true,
            fileUrl: file.filename // Correct property to access the filename
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error uploading file",
            error: error.message // Include error message for debugging
        });
    }
};


//get count of messages that are not read
export const getUnreadMessageCount = async (req, res) => {
    try {
        const { recieverId } = req.params;

        // Aggregate to group unread messages by senderId and count them
        const unreadMessages = await chatMessagesModel.aggregate([
            {
                $match: {
                    recieverId: new mongoose.Types.ObjectId(recieverId),
                    read: false
                }
            },
            {
                $group: {
                    _id: "$senderId", // Group by senderId
                    unreadCount: { $sum: 1 } // Count the number of unread messages per sender
                }
            }
        ]);

        res.status(200).send({
            success: true,
            unreadMessages
        });
    } catch (error) {
        console.error('Error fetching unread message count:', error);
        res.status(500).send({
            success: false,
            message: "Error fetching unread messages"
        });
    }
};

//update the messages as read

export const updateMessageAsRead = async (req, res) => {
    try {
        const { conversationId, recieverId } = req.params;

        let messageUpdate = await chatMessagesModel.updateMany({
            conversationId, recieverId, read: false
        },
            {
                $set: { read: true }
            }
        );
        if (messageUpdate) {
            res.status(200).send({
                "success": true,
                "message": "Messages Updated"
            });
        }
        else {
            res.status(200).send({
                success: false,
                "message": "Messages Not Updated"
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            "success": false,
            "message": "Error"
        });
    }
};


export const getUserChatStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const User = await Users.findById(userId);
        res.status(200).send({
            "success": true,
            "chatStatus": User?.chatStatus
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            "success": false,
            "message": "Error"
        });
    }
};
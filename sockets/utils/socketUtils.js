import { Timestamp } from "mongodb";
import chatConversationModel from "../../models/chatConversationModel.js";
import chatMessagesModel from "../../models/chatMessagesModel.js";

export const findConversationId = async (user1, user2) => {
    try {
        //get id of users   
        const existingConversation = await chatConversationModel.findOne({
            members: { $all: [user1, user2] }
        });

        if (existingConversation) {
            return existingConversation._id;
        }

        let convoCreated = await chatConversationModel.create({
            members: [
                user1,
                user2
            ]
        });
        if (convoCreated) {
            return convoCreated._id;
        }
        else {
            return -1;
        }

    } catch (error) {
        return -1;
    }
};
export const findChats = async (conversationId) => {
    try {
        const chatMessages = await chatMessagesModel.find({
            "conversationId": conversationId
        })
            .populate("senderId")
            .populate("recieverId");


        return chatMessages;

    } catch (error) {
        console.error("Error fetching chats:", error);
        return -1;
    }
};

export const findConversationChats = async (from, to) => {
    const conversationId = await findConversationId(from, to);
    if (conversationId == -1) {
        return;
    }

    const Messages = await findChats(conversationId);
    return Messages;
};
export const saveMessage = async (data) => {
    try {
        const { recieverId, senderId } = data;
        const conversationId = await findConversationId(recieverId, senderId);
        if (conversationId == -1) {
            return;
        }
        const savedChat = await chatMessagesModel.create(
            {
                ...data, conversationId
            }
        );
        await savedChat.save();
        const populatedData = await chatMessagesModel.findById(savedChat._id).populate("senderId").populate("recieverId");
        return populatedData;
    } catch (error) {
        console.log(error);
        return -1;
    }
};

export const set_message_recieved = async (conversationId) => {
    try {

        const messages = await chatMessagesModel.find({ conversationId }).updateMany({
            recieved: Date.now()
        });
        return;

    } catch (error) {
        return -1;
    }
};

export const set_message_read = async (conversationId) => {
    try {
        const messages = await chatMessagesModel.find({ conversationId }).updateMany({
            read: true
        });
    } catch (error) {
        return -1;
    }
};

import { findChats, findConversationChats, findConversationId, saveMessage, set_message_read, set_message_recieved } from "./utils/socketUtils.js";

export const socketHandler = (io) => {

    let users = [];


    const findUserByUserId = (userId) => {
        return users.findIndex((user) => user.userId === userId);
    };
    const findUserBySocketId = (socketId) => {
        return users.findIndex(user => user.socketId == socketId);
    };

    io.on("connection", (socket) => {
        // console.log(`New client connected: ${socket.id}`);

        socket.on("active", (userData) => {
            const userIndex = findUserByUserId(userData?._id);
            if (userIndex == -1)
                users.push({ ...userData, socketId: socket.id, status: "online", typing: false });
            else {
                users[userIndex] = { ...userData, socketId: socket.id, status: "online", typing: false };
            }
            // console.log(users);
            io.emit("users", users);
        });

        socket.on("get_conversation_chats", async ({ currentChat: toUser }) => {
            const fromUser = users[findUserBySocketId(socket?.id)]?.userId;
            const chatDetails = await findConversationChats(fromUser, toUser);
            io.to(socket?.id).emit("conversation_chats", chatDetails);
        });

        socket.on("private_message", async (data) => {
            console.log(data);
            const {
                recieverId } = data;

            const savedMessage = await saveMessage(data);
            let userIndex = findUserByUserId(recieverId);

            const toSocketId = users[userIndex]?.socketId;
            console.log(userIndex);

            io.to(socket.id)?.emit("private_message", savedMessage);
            if (toSocketId) {
                console.log("Message is sent");
                io.to(toSocketId)?.emit("private_message", savedMessage);
                // update message as recived to sender
                // io.to(socket.id).emit("message_delivered", );
            }
        });


        socket.on("user_typing", ({ isTyping, toUserID }) => {
            let data = { isTyping, fromUserID: users[findUserBySocketId(socket.id)]?.userId };
            let toSocketId = users[findUserByUserId(toUserID)]?.socketId;
            socket.to(toSocketId).emit("user_typing", data);
        });

        //on message recieve by user
        // socket.on("message_recieved", async ({ recieverId, senderId }) => {
        //     const conversationId = await findConversationId(recieverId, senderId);

        //     await set_message_recieved(conversationId);

        //     const chatDetails = await findChats(conversationId);
        //     const userIndex = findUserByUserId(senderId?._id);
        //     let recivingUser = users[userIndex];
        //     console.log(recivingUser);
        //     io.to(recivingUser?.socketId).emit("conversation_chats", chatDetails);
        // });

        socket.on("disconnect", () => {
            // console.log(`Client disconnected: ${socket.id}`);
            const disConnectedUser = findUserBySocketId(socket.id);
            if (disConnectedUser >= 0) {
                users = users.filter(ele => ele.socketId != socket.id);
                io.emit("users", users);
            }
        });
    });


};

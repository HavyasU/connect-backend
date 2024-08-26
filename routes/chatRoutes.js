import { Router } from "express";
import { saveMessage, createConversation, getMessages, UploadFile, getUnreadMessageCount, updateMessageAsRead, getUserChatStatus } from "../controllers/chatController.js";
import upload from "../utils/uploads.js";

const chatRouter = Router();

//upload the files of chats and get the uload file link
chatRouter.post('/uploadFile', upload.single('file'), UploadFile);

//save the messages of conversation
chatRouter.post('/saveMessage', saveMessage);

//create if the noverstion is not created
chatRouter.post('/conversation', createConversation);

//get all the messages
chatRouter.post('/getMessages', getMessages);

//get count of messages that are not read
chatRouter.post('/getUnreadCount/:recieverId', getUnreadMessageCount);

//update all the messages as read
chatRouter.post('/updateReadMessages/:conversationId/:recieverId', updateMessageAsRead);

//to get the users initial chat status
chatRouter.get('/getChatStatus/:userId', getUserChatStatus);


export default chatRouter;
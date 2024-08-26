import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import morgan from "morgan";
import { config } from "dotenv";
import bodyParser from "body-parser";
import router from "./routes/index.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { Server } from "socket.io";
import { getImage } from "./controllers/fileControllers.js";
import { createServer } from "http";
import { error } from "console";
import { updateStatus } from "./utils/chatUtils.js";

config(); // Load environment variables

const app = express();
const port = process.env.PORT || 8000;

const allowedOrigins = [
    'https://connect-social-media-havyasrais-projects.vercel.app',
    'http://192.168.255.237:5500',
    'https://connect-social-media-mu.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://192.168.199.237:5173'
];

// Create HTTP server and Socket.io instance
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    }
});

const users = [];

// Helper function to find user by userId
const findUserById = (userId) => users.find(user => user.userId === userId);

// Helper function to find user by socketId
const findUserBySocketId = (socketId) => users.find(user => user.socketId === socketId);

// Socket.io connection handler
io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`); // Log connection

    socket.on("join", (user) => {
        try {
            const existingUserIndex = users.findIndex(curUser => curUser.userId === user.userId);
            if (existingUserIndex === -1) {
                users.push({ ...user, socketId: socket.id, status: "online" });
            } else {
                users[existingUserIndex].socketId = socket.id;
                users[existingUserIndex].status = "online";
            }

            io.emit('getUsers', users);
            socket.emit("user_status", { userId: user.userId, status: "online" });
            updateStatus(user.userId, "online");
        } catch (error) {
            console.error("Error handling join event:", error);
        }
    });

    socket.on('private_message', (data) => {
        try {
            const { toUserId, message, createdAt } = data;
            const toUser = findUserById(toUserId);
            const fromUser = findUserBySocketId(socket.id);
            if (toUser && fromUser) {
                console.log(data);
                socket.to(toUser.socketId).emit("private_message", { ...data, fromUserId: fromUser.userId, });
            } else {
                console.log("Message not sent. From user or To user not found.");
            }
        } catch (error) {
            console.error("Error handling private_message event:", error);
        }
    });

    socket.on("typing", (data) => {
        try {
            const { currentChat, typing } = data;
            const toUser = findUserById(currentChat);
            const fromUser = findUserBySocketId(socket.id);
            if (fromUser && toUser) {
                socket.to(toUser.socketId).emit("typing", { userId: fromUser.userId, typing });
            }
        }
        catch (err) {
            console.log(error);
        }
    });
    socket.on("message_read", (data) => {
        try {
            let { currentChat } = data;
            const toUser = findUserById(currentChat);
            console.log(toUser);
            const fromUser = findUserBySocketId(socket.id);
            console.log(fromUser);
            socket.to(toUser?.socketId).emit("message_read", { userId: fromUser?.userId });
        } catch (error) {
            console.log(error);
        }
    });

    socket.on("disconnect", () => {
        try {
            const userIndex = users.findIndex(user => user.socketId === socket.id);
            if (userIndex !== -1) {
                users[userIndex].status = `Last seen at ${new Date().toLocaleString()}`;
                io.emit('getUsers', users);
                updateStatus(users[userIndex].userId, users[userIndex].status);
            }
        } catch (error) {
            console.error("Error handling disconnect event:", error);
        }
    });
});

// Middlewares
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(errorMiddleware); // Error middleware

app.get('/uploads/:filename', getImage);

// Routes
app.use(router);
app.get('/', (req, res) => {
    res.send("Connect");
});

// Start the server and connect to the database
const listenApp = () => {
    server.listen(port, () => {
        console.log("App is Live🚀");
        console.log("PORT http://localhost:" + port);
    });
};

connectDB(listenApp);

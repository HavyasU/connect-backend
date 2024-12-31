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
import { socketHandler } from "./sockets/socketsHandler.js";

config();

const app = express();
const port = process.env.PORT || 8000;

const allowedOrigins = [
    'https://connect-social-media-havyasrais-projects.vercel.app',
    'http://192.168.255.237:5500',
    'https://connect-social-media-mu.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://192.168.199.237:5173',
    'https://admin.socket.io'
];

// Create HTTP server and Socket.io instance
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        transports: ["websocket", "polling"],
    },
    allowEIO3: true
});
socketHandler(io);

// Middlewares

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(morgan("dev"));
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

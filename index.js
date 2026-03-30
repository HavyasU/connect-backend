import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { config } from "dotenv";
import router from "./routes/index.js";
import errorMiddleware from "./middleware/errorMiddleware.js";
import { Server } from "socket.io";
import { getImage } from "./controllers/fileControllers.js";
import { createServer } from "http";
// removed unused imports
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
    'https://admin.socket.io',
    'https://connect.havyas.in',
    'https://admin.connect.havyas.in',
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
app.options('*', cors());

// Security & common middlewares
app.use(helmet());
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
// app.use(morgan("dev"));

app.get('/uploads/:filename', getImage);

// Routes
app.use('/api', router);
// Temporary backward-compatibility (to be removed after frontend switches to /api)
app.use(router);
// Healthcheck / root
app.get('/', (req, res) => {
    res.send("Connect");
});

// Not Found handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error middleware (must be last)
app.use(errorMiddleware);

// Start the server and connect to the database
const listenApp = () => {
    server.listen(port, () => {
        console.log("App is Live🚀");
        console.log("PORT http://localhost:" + port);
    });
};

connectDB(listenApp);

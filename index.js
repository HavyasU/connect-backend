import express from "express";
import connectDB from "./config/db.js";
import cors from "cors";
import morgan from "morgan";
import { config } from "dotenv";
import bodyParser from "body-parser";
import router from "./routes/index.js";
import path from "path";
import helmet from "helmet"; //security 
import errorMiddleware from "./middleware/errorMiddleware.js";
config(); //dot env
const app = express();
const port = process.env.PORT || 8000;
const __dirname = path.resolve(path.dirname(""));

const allowedOrigins = ['https://connect-social-media-mu.vercel.app/'];

app.use(cors({
    origin: allowedOrigins
}));

app.use((req, res, next) => {
    console.log(req.headers.origin);
    res.header('Access-Control-Allow-Origin', 'https://connect-social-media-n5fznp35i-havyasrais-projects.vercel.app');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
//middlewares
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
// app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use(errorMiddleware); // error middleware
//routes
app.use(router);
app.get('/', (req, res) => {
    res.send("Connect");
});

//runnning app
const listenApp = () => {
    app.listen(port, () => {
        console.log("App is Live🚀");
        console.log("PORT http://localhost:" + port);
    });
};

//database connecting
connectDB(listenApp)


import multer from 'multer';
import { GridFsStorage } from 'multer-gridfs-storage';
import dotenv from 'dotenv';

dotenv.config();
const DB_URL = process.env.DB_URL;

const storage = new GridFsStorage({
    url: DB_URL,
    options: { useUnifiedTopology: true, useNewUrlParser: true },
    file: (request, file) => {
        return {
            bucketName: "uploads",
            filename: `${Date.now()}-file-${file.originalname}`
        };

    }

}
);


// const storage = new GridFsStorage({
//     url: "mongodb://127.0.0.1:27017",
//     file: (req, file) => {
//         return {
//             bucketName: 'uploads',
//             filename: `${Date.now()}-file-${file.originalname}`
//         };
//     }
// });

const upload = multer({ storage: storage });

export default upload;

import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'connect-social-media', // Cloudinary folder name
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'pdf'], // add other formats if needed
        public_id: (req, file) => `${Date.now()}-${file.originalname}`,
        resource_type: 'auto',
    },
});

const upload = multer({ storage });

export default upload;

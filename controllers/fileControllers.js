import grid from 'gridfs-stream';
import mongoose from 'mongoose';


let gfs, gridFSBucket;
const conn = mongoose.connection;
conn.once('open', () => {
    gridFSBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
    gfs = grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});


export const getImage = async (request, response) => {
    try {
        console.log(request.params.filename);
        const file = await gfs.files.findOne({ filename: request.params.filename });
        if (!file) {
            response.json({
                success: "false",
                "message": "Image not found"
            });
            return;
        }
        const readStream = gridFSBucket.openDownloadStream(file._id);
        readStream.pipe(response);
    } catch (error) {
        response.status(500).json(error.message);
    }
};
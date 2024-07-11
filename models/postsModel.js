import mongoose, { Schema } from "mongoose";

const postsSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId, ref: "Users"
    },
    description: { type: String, required: true },
    type: { type: String },
    media: { type: String },
    likes: [{ type: String }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }]
},
    { timestamps: true }
);
const Posts = mongoose.model("Posts", postsSchema);
export default Posts;
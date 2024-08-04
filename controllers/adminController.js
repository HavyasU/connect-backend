import adminModel from "../models/adminModel.js";
import Comments from "../models/commentsModel.js";
import FriendRequests from "../models/friendRequestsModel.js";
import Posts from "../models/postsModel.js";
import Users from "../models/userModel.js";
import fs from "fs";
import { compareString, createJWT } from "../utils/index.js";

export const adminLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        let adminExists = await adminModel.findOne({ username });
        if (!adminExists) {
            return res.status(401).json({
                sucess: false,
                message: "Invalid Username"
            });
        }

        const isPassMatch = await compareString(password, adminExists.password);
        if (!isPassMatch) {
            return res.status(401).json({
                success: false,
                message: "Wrong Password"
            });
        }
        let token = createJWT(adminExists._id);
        return res.status(200).json({
            success: true,
            message: "Login success",
            token
        });
    } catch (error) {
        console.log("Error in Admin Login " + error);
        res.status(500).json({
            success: false,
            message: "Error"
        });
    }
};

export const adminGetPosts = async (req, res, next) => {
    try {
        const { search } = req.body;

        const searchPostQuery = {
            $or: [
                {
                    description: { $regex: search, $options: "i" },
                },
            ],
        };

        const posts = await Posts.find(search ? searchPostQuery : {})
            .populate({
                path: "userId",
                select: "firstName lastName location profileUrl -password",
            })
            .sort({ _id: -1 });

        res.status(200).json({
            sucess: true,
            message: "successfully",
            data: posts,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

export const adminGetComments = async (req, res, next) => {
    try {
        const { postId } = req.params;

        const postComments = await Comments.find({ postId })
            .populate({
                path: "userId",
                select: "firstName lastName location profileUrl -password",
            })
            .populate({
                path: "replies.userId",
                select: "firstName lastName location profileUrl -password",
            })
            .sort({ _id: -1 });

        res.status(200).json({
            sucess: true,
            message: "successfully",
            data: postComments,
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: error.message });
    }
};

export const adminGetUsers = async (req, res) => {
    try {
        let users = await Users.find({}).populate({
            path: "friends",
            select: "-password"
        });
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }

};
export const adminGetAnalytics = async (req, res) => {
    try {
        // Get the users count by date
        const usersByDate = await Users.aggregate([
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: {
                                    $toDate: "$createdAt"
                                }
                            }
                        }
                    },
                    users: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id.date",
                    users: 1
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ]);

        // Get the posts count by date
        const postsByDate = await Posts.aggregate([
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: {
                                    $toDate: "$_id"
                                }
                            }
                        }
                    },
                    posts: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id.date",
                    posts: 1
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ]);

        // Get the comments count by date
        const commentsByDate = await Comments.aggregate([
            {
                $group: {
                    _id: {
                        date: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: {
                                    $toDate: "$_id"
                                }
                            }
                        }
                    },
                    comments: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id.date",
                    comments: 1
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ]);

        // Get the user verification counts
        const userVerificationCounts = await Users.aggregate([
            {
                $group: {
                    _id: "$verified",  // Group by the verified status
                    count: { $sum: 1 } // Count the number of users in each group
                }
            },
            {
                $project: {
                    _id: 0,
                    verified: "$_id",
                    count: 1
                }
            }
        ]);
        let userCount = await Users.countDocuments();
        let postCount = await Posts.countDocuments();
        let commentCount = await Comments.countDocuments();
        let connectionsCount = await FriendRequests.countDocuments();
        const StatCounts = [{
            name: "Users",
            count: userCount
        },
        {
            name: "Posts",
            count: postCount,
        },
        {
            name: "Connections",
            count: connectionsCount
        },
        {
            name: "Comments",
            count: commentCount
        },
        ];

        res.status(200).json({
            success: true,
            usersByDate,
            postsByDate,
            commentsByDate,
            userVerificationCounts,
            StatCounts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
};

export const adminDeletePost = async (req, res) => {
    try {
        const { id } = req.params;
        let deletedPost = await Posts.findById(id);
        if (deletedPost?.media) {
            fs.unlink(`uploads/${deletedPost.media}`, () => { });
        }
        let postDeleted = await Posts.findByIdAndDelete(id);
        re.status(200).json({
            success: true,
            message: "Post Deleted"
        });
    } catch (error) {
        console.log(error);
        res.status(404).json({ success: false, message: error });
    }
}




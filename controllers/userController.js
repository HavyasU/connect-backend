import mongoose from "mongoose";
import Verification from "../models/emailVerificationModel.js";
import Users from "../models/userModel.js";
import { compareString, createJWT, hashString } from "../utils/index.js";
import PasswordReset from "../models/passwordResetModel.js";
import { resetPasswordLink } from "../utils/sendEmail.js";
import FriendRequest from "../models/friendRequestsModel.js";



export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    try {
        const result = await Verification.findOne({ userId });
        if (result) {
            const { expiresAt, otp: hashedOtp } = result;

            if (expiresAt < Date.now()) {
                await Verification.findOneAndDelete({ userId });
                await Users.findOneAndDelete({ _id: userId });
                return res.json({ success: false, message: "Otp Expired" });
            } else {
                compareString(otp, hashedOtp)
                    .then(async (isMatch) => {
                        if (isMatch) {
                            await Users.findOneAndUpdate({ _id: userId }, { verified: true });
                            await Verification.findOneAndDelete({ userId });
                            return res.json({ success: true, message: "Verification Success" });
                        } else {
                            return res.json({ success: false, message: "Verification failed or otp is invalid" });
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        return res.json({ success: false, message: "Something went wrong" });
                    });
            }
        } else {
            return res.json({ success: false, message: "Something went wrong. Try again later." });
        }
    } catch (error) {
        console.log(error);
        return res.json({ success: false, message: "Something went wrong" });
    }
};

export const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "Email address not found." });
        }

        const existingRequest = await PasswordReset.findOne({ email });

        if (existingRequest) {
            if (existingRequest.expiresAt > Date.now()) {
                return res.status(201).json({ success: false, message: "Reset password otp has already been sent to your email." });
            }
            await PasswordReset.findOneAndDelete({ email });
        }

        await resetPasswordLink(user, res);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const resetPassword = async (req, res) => {
    const { userId, token } = req.params;

    try {
        const user = await Users.findById(userId);

        if (!user) {
            const message = "User Not found. Try again";
            return res.redirect(`/users/resetpassword?status=error&message=${message}`);
        }

        const resetPassword = await PasswordReset.findOne({ userId });

        if (!resetPassword) {
            const message = "Invalid password reset link. Try again";
            return res.redirect(`/users/resetpassword?status=error&message=${message}`);
        }

        const { expiresAt, token: resetToken } = resetPassword;

        if (expiresAt < Date.now()) {
            const message = "Reset Password link has expired. Please try again";
            return res.redirect(`/users/resetpassword?status=error&message=${message}`);
        } else {
            const isMatch = await compareString(token, resetToken);

            if (!isMatch) {
                const message = "Invalid reset password link. Please try again";
                return res.redirect(`/users/resetpassword?status=error&message=${message}`);
            } else {
                return res.redirect(`/users/resetpassword?type=reset&id=${userId}`);
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { userId, password, otp } = req.body;
        const resetPassword = await PasswordReset.findOne({ userId });

        if (!resetPassword) {
            return res.send({ success: false, message: "Something Went Wrong. Try again later" });
        }

        const isMatch = await compareString(otp, resetPassword.otp);

        if (isMatch) {
            const hashedPass = await hashString(password);
            await Users.findOneAndUpdate({ _id: userId }, { password: hashedPass });
            await PasswordReset.findOneAndDelete({ userId });
            return res.send({ success: true, message: "Password Reset Successful" });
        } else {
            return res.send({ success: false, message: "Invalid Otp" });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

export const getUser = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.params;
        const user = await Users.findById(id ?? userId).populate({
            path: "friends",
            select: "-password",
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User Not Found" });
        }

        user.password = undefined;

        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { firstName, lastName, location, profession } = req.body;
        const profileUrl = req?.file?.filename;
        if (!firstName || !lastName || !profession || !location) {
            return res.json({
                status: "failed",
                message: "Please provide all required fields",
            });
        }

        const { userId } = req.body.user;

        const updateUser = {
            firstName,
            lastName,
            location,
            profileUrl,
            profession,
            _id: userId,
        };

        const user = await Users.findByIdAndUpdate(userId, updateUser, {
            new: true,
        }).populate({ path: "friends", select: "-password" });

        const token = createJWT(user?._id);

        user.password = undefined;

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            user,
            token,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const friendRequest = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { requestTo } = req.body;

        const requestExist = await FriendRequest.findOne({
            requestFrom: userId,
            requestTo,
        });
        console.log(requestExist);

        if (requestExist) {
            return res.status(400).json({ success: false, message: "Friend Request already sent." });
        }

        const accountExist = await FriendRequest.findOne({
            requestFrom: requestTo,
            requestTo: userId,
        });

        if (accountExist) {
            return res.status(400).json({ success: false, message: "Friend Request already sent." });
        }

        await FriendRequest.create({
            requestTo,
            requestFrom: userId,
        });

        res.status(201).json({ success: true, message: "Friend Request sent successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getFriendRequest = async (req, res) => {
    try {
        const { userId } = req.body.user;
        console.log(userId);
        const requests = await FriendRequest.find({
            requestTo: userId,
            status: "Pending",
        }).populate({
            path: "requestFrom",
            select: "firstName lastName profileUrl profession -password",
        }).limit(10).sort({ _id: -1 });
        console.log(requests);
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const acceptRequest = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { rid, status } = req.body;

        const requestExist = await FriendRequest.findById(rid);

        if (!requestExist) {
            return res.json({ success: false, message: "No Friend Request Found." });
        }

        const updatedRequest = await FriendRequest.findByIdAndUpdate(rid, { status: status });
        console.log(updateUser);
        if (status === "Accepted") {
            const user = await Users.findById(userId);
            user.friends.push(updatedRequest?.requestFrom);
            await user.save();

            const friend = await Users.findById(updatedRequest?.requestFrom);
            friend.friends.push(userId);
            await friend.save();
            return res.status(200).json({ success: true, message: `Friend Request Accepted` });
        }
        return res.status(200).json({ success: true, message: `Friend Request Rejected` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const profileViews = async (req, res) => {
    try {
        const { userId } = req.body.user;
        const { id } = req.body;

        const user = await Users.findById(id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.views.push(userId);
        await user.save();

        res.status(200).json({ success: true, message: "Profile view recorded successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const suggestedFriends = async (req, res) => {
    try {
        const { userId } = req.body;

        // Ensure userId is provided
        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        // Query to find users that are not the current user and not already friends
        const queryObject = {
            _id: { $ne: userId },
            friends: { $nin: userId }
        };

        // Execute the query and select specific fields
        const queryResult = await Users.find(queryObject)
            .limit(15)
            .select("firstName lastName profileUrl profession -password");

        // Send the response with the found users
        res.status(200).json({ success: true, data: queryResult });
    } catch (error) {
        console.error("Error in suggestedFriends:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
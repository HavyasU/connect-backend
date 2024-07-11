import Users from "../models/userModel.js";
import { sendVerificationEmail } from "../utils/sendEmail.js";
import { compareString, createJWT, hashString } from "../utils/index.js";

export const register = async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;
    if (!(firstName || lastName || email || password)) {
        return res.json({
            status: false,
            message: "Please provide all required fields",
        });
    }
    try {
        const userExists = await Users.findOne({ email });
        if (userExists) {
            return res.json({
                status: false,
                message: "Email Address Already Exists..Please Login",
            });
        }
        const hashedPassword = await hashString(password);

        const newUser = await Users.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        sendVerificationEmail(newUser, res);

    } catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Error"
        });
    }


};

export const login = async (req, res, next) => {

    const { email, password } = req.body;
    if (!(email || password)) {
        return res.json({
            status: false,
            message: "Please provide all required fields",
        });
    }
    try {
        const userExists = await Users.findOne({ email }).select("+password").populate({
            path: "friends",
            select: "firstName lastName location ProfileUrl -password"
        });

        if (!userExists) {
            return res.json({
                status: false,
                message: "User Does Not Exists",
            });
        }
        if (!userExists.verified) {
            return res.json({
                status: false,
                message: "User email if not verified, Please check your email",
            });

        }

        const isPassMatch = await compareString(password, userExists?.password);
        console.log(isPassMatch);
        if (!isPassMatch) {
            res.json({
                success: false,
                message: "Wrong Password"
            });
            return;
        }
        userExists.password = undefined;

        const token = await createJWT(userExists?._id);
        return res.json({
            success: true,
            message: "Login Successfull",
            "user": userExists,
            token
        });
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error",
        });
        return;
    }
};
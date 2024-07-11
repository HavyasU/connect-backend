import nodeMailer from "nodemailer";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import EmailVerifications from "../models/emailVerificationModel.js";
import { createOtp, hashString } from "./index.js";
import PasswordReset from "../models/passwordResetModel.js";
dotenv.config();

const { AUTH_EMAIL, AUTH_PASSWORD, APP_URL } = process.env;

let transporter = nodeMailer.createTransport({
    service: "gmail",
    auth: {
        user: AUTH_EMAIL,
        pass: AUTH_PASSWORD,
    }
});

export const sendVerificationEmail = async (user, res) => {
    const { _id, email, firstName } = user;
    const otp = createOtp();
    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: "Email Verification",
        html: `
            <div style='font-family: Arial, sans-serif; font-size: 20px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;'>
                <h3 style="color: rgb(8, 56, 188)">Please verify your email address</h3>
                <hr>
                <h4>Hi ${firstName},</h4>
                <p>Please use below link to verify it's really you.</p>
                <p>This link <b>expires in 1 hour</b></p>
                <br>
                <a href="${APP_URL}/verify/verifyEmail/${_id}/${otp}" style="color: #fff; padding: 10px; text-decoration: none; background-color: #000;  border-radius: 8px; font-size: 18px; ">Verify Email</a>.                
                <div style="margin-top: 20px;">
                    <h5>Best Regards</h5>
                    <h5>Team Connect.</h5>
                </div>
            </div>
        `
    };

    try {
        const hashedOTP = await hashString(otp);

        const newVerifiedEmail = await EmailVerifications.create({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000 // 1 hour in milliseconds
        });

        if (newVerifiedEmail) {
            await transporter.sendMail(mailOptions);
            res.status(201).send({
                success: "Pending",
                message: "Verification OTP has been sent to your Account. Please Check your E-Mail.",
                userId: newVerifiedEmail.userId
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error sending verification email."
        });
    }
};

export const resetPasswordLink = async (user, res) => {
    const { _id, email } = user;

    const otp = createOtp();
    //   mail options
    const mailOptions = {
        from: AUTH_EMAIL,
        to: email,
        subject: "Password Reset link",
        html: `<p style="font-family: Arial, sans-serif; font-size: 16px; color: #333; background-color: #f7f7f7; padding: 20px; border-radius: 5px;">
           Please visit the below link to reset your Password.
          <br>
          <p style="font-size: 18px;"><b>This OTP expires in 10 minutes</b></p>
          <br>
          <a href="${APP_URL}/verify/resetpassword/${_id}/${otp}" style="color: #fff; padding: 10px; text-decoration: none; background-color: #000;  border-radius: 8px; font-size: 18px; ">Reset Password</a>.
      </p>`,
    };

    try {
        const hashedOTP = await hashString(otp);

        const resetEmail = await PasswordReset.create({
            userId: _id,
            email: email,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 600000,
        });

        if (resetEmail) {
            transporter
                .sendMail(mailOptions)
                .then(() => {
                    res.status(201).send({
                        success: "PENDING",
                        message: "Reset Password OTP has been sent.",
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(404).json({ message: "Something went wrong" });
                });
        }
    } catch (error) {
        console.log(error);
        res.status(404).json({ message: "Something went wrong" });
    }
};
